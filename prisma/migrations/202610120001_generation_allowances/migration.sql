-- Plan-specific internal units preserve exact standard/premium/research maxima.
BEGIN;
ALTER TABLE billing.plans ADD COLUMN standard_cost integer NOT NULL DEFAULT 1 CHECK (standard_cost > 0),
  ADD COLUMN premium_cost integer NOT NULL DEFAULT 4 CHECK (premium_cost > 0),
  ADD COLUMN research_cost integer NOT NULL DEFAULT 20 CHECK (research_cost > 0);
UPDATE billing.plans SET credits=120,standard_cost=4,premium_cost=15,research_cost=24 WHERE id='starter';
UPDATE billing.plans SET credits=630,standard_cost=9,premium_cost=35,research_cost=63 WHERE id='plus';
UPDATE billing.plans SET credits=2100,standard_cost=21,premium_cost=75,research_cost=140 WHERE id='pro';

-- Existing orders retain the original weights. New orders snapshot the new ones.
ALTER TABLE billing.orders ADD COLUMN standard_cost integer NOT NULL DEFAULT 1 CHECK (standard_cost > 0),
  ADD COLUMN premium_cost integer NOT NULL DEFAULT 4 CHECK (premium_cost > 0),
  ADD COLUMN research_cost integer NOT NULL DEFAULT 20 CHECK (research_cost > 0);

CREATE TABLE billing.usage_allocations (
  environment text NOT NULL, order_id text NOT NULL, customer_id text NOT NULL,
  remaining_units integer NOT NULL CHECK (remaining_units >= 0),
  standard_cost integer NOT NULL CHECK (standard_cost > 0),
  premium_cost integer NOT NULL CHECK (premium_cost > 0),
  research_cost integer NOT NULL CHECK (research_cost > 0),
  closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(environment,order_id),
  FOREIGN KEY(environment,order_id) REFERENCES billing.orders(environment,id),
  FOREIGN KEY(environment,customer_id) REFERENCES billing.customers(environment,id)
);
CREATE INDEX usage_allocations_customer ON billing.usage_allocations(environment,customer_id,created_at);
CREATE TABLE billing.generation_reservations (
  environment text NOT NULL, id text NOT NULL CHECK(id ~ '^[a-f0-9]{64}$'),
  customer_id text NOT NULL, order_id text NOT NULL,
  operation text NOT NULL CHECK(operation IN ('standard','premium','research')),
  units integer NOT NULL CHECK(units > 0),
  status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','completed','released')),
  created_at timestamptz NOT NULL DEFAULT now(), settled_at timestamptz,
  PRIMARY KEY(environment,id),
  FOREIGN KEY(environment,customer_id) REFERENCES billing.customers(environment,id),
  FOREIGN KEY(environment,order_id) REFERENCES billing.usage_allocations(environment,order_id)
);
CREATE INDEX generation_reservations_customer ON billing.generation_reservations(environment,customer_id,created_at);

-- Only previously untouched purchased balances can be safely backfilled. Refuse
-- ambiguous live accounts rather than guessing how their prior credits were used.
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM billing.credit_accounts a WHERE a.credits <> (
    SELECT coalesce(sum(l.delta),0) FROM billing.credit_ledger l
    WHERE l.environment=a.environment AND l.customer_id=a.customer_id)) THEN
    RAISE EXCEPTION 'Reconcile existing credit accounts before allowance migration';
  END IF;
END $$;
INSERT INTO billing.usage_allocations(environment,order_id,customer_id,remaining_units,standard_cost,premium_cost,research_cost,closed,created_at)
SELECT o.environment,o.id,o.customer_id,o.credits,o.standard_cost,o.premium_cost,o.research_cost,
  a.expires_at<=now(),o.fulfilled_at FROM billing.orders o JOIN billing.credit_accounts a
  ON a.environment=o.environment AND a.customer_id=o.customer_id
WHERE o.fulfilled_at IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM billing.credit_ledger l WHERE l.environment=o.environment AND l.customer_id=o.customer_id
    AND l.kind NOT IN ('purchase','expiry')) AND NOT EXISTS (
  SELECT 1 FROM billing.credit_ledger l WHERE l.environment=o.environment AND l.customer_id=o.customer_id
    AND l.kind='expiry' AND l.created_at>=o.fulfilled_at);
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM billing.credit_accounts a WHERE a.expires_at>now() AND a.credits>0
    AND a.credits <> (SELECT coalesce(sum(u.remaining_units),0) FROM billing.usage_allocations u
      WHERE u.environment=a.environment AND u.customer_id=a.customer_id AND NOT u.closed)) THEN
    RAISE EXCEPTION 'Existing usage needs a reviewed allocation backfill';
  END IF;
END $$;

ALTER FUNCTION billing.fulfill_order(text,text,text,text,integer,text,numeric,numeric,timestamptz) RENAME TO fulfill_order_legacy;
CREATE FUNCTION billing.fulfill_order(
 p_environment text,p_order_id text,p_invoice_id text,p_payment_id text,p_price_cents integer,
 p_pay_currency text,p_pay_amount numeric,p_paid numeric,p_now timestamptz
) RETURNS text LANGUAGE plpgsql AS $$
DECLARE o billing.orders%ROWTYPE; result text; old_expiry timestamptz;
BEGIN
 SELECT * INTO o FROM billing.orders WHERE environment=p_environment AND id=p_order_id FOR UPDATE;
 IF NOT FOUND THEN RETURN 'missing'; END IF;
 SELECT expires_at INTO old_expiry FROM billing.credit_accounts
 WHERE environment=p_environment AND customer_id=o.customer_id FOR UPDATE;
 result := billing.fulfill_order_legacy(p_environment,p_order_id,p_invoice_id,p_payment_id,p_price_cents,p_pay_currency,p_pay_amount,p_paid,p_now);
 IF result='fulfilled' THEN
   IF old_expiry<=p_now THEN UPDATE billing.usage_allocations SET remaining_units=0,closed=true
     WHERE environment=p_environment AND customer_id=o.customer_id; END IF;
   INSERT INTO billing.usage_allocations(environment,order_id,customer_id,remaining_units,standard_cost,premium_cost,research_cost,created_at)
   VALUES(p_environment,o.id,o.customer_id,o.credits,o.standard_cost,o.premium_cost,o.research_cost,p_now);
 END IF;
 RETURN result;
END $$;

CREATE FUNCTION billing.reserve_generation(p_environment text,p_customer text,p_id text,p_operation text,p_now timestamptz)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE a billing.credit_accounts%ROWTYPE; u billing.usage_allocations%ROWTYPE;
 r billing.generation_reservations%ROWTYPE; cost integer;
BEGIN
 IF p_operation NOT IN ('standard','premium','research') THEN RETURN 'invalid'; END IF;
 SELECT * INTO a FROM billing.credit_accounts WHERE environment=p_environment AND customer_id=p_customer FOR UPDATE;
 IF NOT FOUND OR a.expires_at<=p_now THEN RETURN 'expired'; END IF;
 SELECT * INTO r FROM billing.generation_reservations WHERE environment=p_environment AND id=p_id;
 IF FOUND THEN
   IF r.customer_id<>p_customer OR r.operation<>p_operation THEN RETURN 'mismatch'; END IF;
   RETURN r.status;
 END IF;
 SELECT * INTO u FROM billing.usage_allocations WHERE environment=p_environment AND customer_id=p_customer AND NOT closed
   AND remaining_units >= CASE p_operation WHEN 'standard' THEN standard_cost WHEN 'premium' THEN premium_cost ELSE research_cost END
   ORDER BY created_at,order_id LIMIT 1 FOR UPDATE;
 IF NOT FOUND THEN RETURN 'exhausted'; END IF;
 cost := CASE p_operation WHEN 'standard' THEN u.standard_cost WHEN 'premium' THEN u.premium_cost ELSE u.research_cost END;
 UPDATE billing.usage_allocations SET remaining_units=remaining_units-cost WHERE environment=p_environment AND order_id=u.order_id;
 UPDATE billing.credit_accounts SET credits=credits-cost,updated_at=p_now WHERE environment=p_environment AND customer_id=p_customer;
 INSERT INTO billing.generation_reservations(environment,id,customer_id,order_id,operation,units,created_at)
 VALUES(p_environment,p_id,p_customer,u.order_id,p_operation,cost,p_now);
 RETURN 'created';
END $$;

CREATE FUNCTION billing.settle_generation(p_environment text,p_customer text,p_id text,p_success boolean,p_now timestamptz)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE a billing.credit_accounts%ROWTYPE; r billing.generation_reservations%ROWTYPE; is_closed boolean;
BEGIN
 SELECT * INTO a FROM billing.credit_accounts WHERE environment=p_environment AND customer_id=p_customer FOR UPDATE;
 SELECT * INTO r FROM billing.generation_reservations WHERE environment=p_environment AND id=p_id FOR UPDATE;
 IF NOT FOUND OR r.customer_id<>p_customer THEN RETURN 'missing'; END IF;
 IF r.status<>'reserved' THEN RETURN r.status; END IF;
 IF p_success THEN
   INSERT INTO billing.credit_ledger(environment,customer_id,kind,delta,balance_after,created_at)
   VALUES(p_environment,p_customer,'usage',-r.units,a.credits,p_now);
 ELSE
   SELECT closed INTO is_closed FROM billing.usage_allocations WHERE environment=p_environment AND order_id=r.order_id FOR UPDATE;
   IF NOT is_closed AND a.expires_at>p_now THEN
     UPDATE billing.usage_allocations SET remaining_units=remaining_units+r.units WHERE environment=p_environment AND order_id=r.order_id;
     UPDATE billing.credit_accounts SET credits=credits+r.units,updated_at=p_now WHERE environment=p_environment AND customer_id=p_customer;
   ELSE
     -- Held units had not reached the usage ledger. Expire them explicitly so
     -- late failed requests do not leave the financial audit out of balance.
     INSERT INTO billing.credit_ledger(environment,customer_id,kind,delta,balance_after,created_at)
     VALUES(p_environment,p_customer,'expiry',-r.units,a.credits,p_now);
   END IF;
 END IF;
 UPDATE billing.generation_reservations SET status=CASE WHEN p_success THEN 'completed' ELSE 'released' END,settled_at=p_now
 WHERE environment=p_environment AND id=p_id;
 RETURN CASE WHEN p_success THEN 'completed' ELSE 'released' END;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA billing FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA billing FROM PUBLIC;
COMMIT;
