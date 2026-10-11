CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents > 0),
  credits integer NOT NULL CHECK (credits > 0),
  period_days integer NOT NULL DEFAULT 30 CHECK (period_days > 0),
  active boolean NOT NULL DEFAULT true
);
INSERT INTO billing.plans (id, name, price_cents, credits) VALUES
  ('starter', 'Starter', 1000, 100), ('plus', 'Plus', 2000, 200), ('pro', 'Pro', 2800, 308);

CREATE TABLE billing.customers (
  environment text NOT NULL CHECK (environment IN ('live','sandbox')),
  id text NOT NULL CHECK (id ~ '^[a-f0-9]{64}$'),
  auth_user_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (environment, id),
  UNIQUE (environment, auth_user_id)
);
CREATE TABLE billing.orders (
  environment text NOT NULL,
  id text NOT NULL CHECK (id ~ '^[a-f0-9]{64}$'),
  customer_id text NOT NULL,
  plan_id text NOT NULL REFERENCES billing.plans(id),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  credits integer NOT NULL CHECK (credits > 0),
  invoice_id text,
  invoice_url text,
  payment_id text,
  status text NOT NULL DEFAULT 'creating',
  created_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  PRIMARY KEY (environment, id),
  FOREIGN KEY (environment, customer_id) REFERENCES billing.customers(environment, id),
  UNIQUE (environment, invoice_id)
);
CREATE INDEX orders_customer_created ON billing.orders(environment, customer_id, created_at DESC);
CREATE TABLE billing.credit_accounts (
  environment text NOT NULL,
  customer_id text NOT NULL,
  credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  expires_at timestamptz NOT NULL DEFAULT now(),
  plan_id text REFERENCES billing.plans(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (environment, customer_id),
  FOREIGN KEY (environment, customer_id) REFERENCES billing.customers(environment, id)
);
CREATE TABLE billing.payments (
  environment text NOT NULL,
  id text NOT NULL,
  order_id text NOT NULL,
  invoice_id text NOT NULL,
  status text NOT NULL,
  price_cents integer NOT NULL,
  pay_currency text,
  pay_amount numeric(60,30),
  actually_paid numeric(60,30),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (environment, id),
  FOREIGN KEY (environment, order_id) REFERENCES billing.orders(environment, id)
);
CREATE TABLE billing.subscriptions (
  environment text NOT NULL,
  order_id text NOT NULL,
  customer_id text NOT NULL,
  plan_id text NOT NULL REFERENCES billing.plans(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  status text NOT NULL DEFAULT 'active',
  PRIMARY KEY (environment, order_id),
  FOREIGN KEY (environment, order_id) REFERENCES billing.orders(environment, id),
  FOREIGN KEY (environment, customer_id) REFERENCES billing.customers(environment, id)
);
CREATE INDEX subscriptions_customer_end ON billing.subscriptions(environment, customer_id, ends_at DESC);
CREATE TABLE billing.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL,
  customer_id text NOT NULL,
  order_id text,
  kind text NOT NULL CHECK (kind IN ('purchase','expiry','usage','refund','adjustment')),
  delta integer NOT NULL CHECK (delta <> 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (environment, customer_id) REFERENCES billing.customers(environment, id),
  FOREIGN KEY (environment, order_id) REFERENCES billing.orders(environment, id),
  UNIQUE (environment, order_id, kind)
);
CREATE INDEX credit_ledger_customer_created ON billing.credit_ledger(environment, customer_id, created_at DESC);
CREATE TABLE billing.webhook_events (
  environment text NOT NULL CHECK (environment IN ('live','sandbox')),
  id text NOT NULL,
  order_id text NOT NULL,
  payment_id text NOT NULL,
  provider_status text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  PRIMARY KEY (environment, id),
  FOREIGN KEY (environment, order_id) REFERENCES billing.orders(environment, id)
);
CREATE TABLE billing.rate_limits (
  environment text NOT NULL CHECK (environment IN ('live','sandbox')),
  id text NOT NULL,
  count integer NOT NULL CHECK (count > 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (environment, id)
);

-- An order row lock + customer account lock make fulfilment safe across
-- concurrent IPNs, multiple server instances and different simultaneous orders.
CREATE FUNCTION billing.fulfill_order(
  p_environment text, p_order_id text, p_invoice_id text, p_payment_id text,
  p_price_cents integer, p_pay_currency text, p_pay_amount numeric, p_paid numeric, p_now timestamptz
) RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  o billing.orders%ROWTYPE;
  a billing.credit_accounts%ROWTYPE;
  start_time timestamptz;
  end_time timestamptz;
BEGIN
  SELECT * INTO o FROM billing.orders WHERE environment=p_environment AND id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  IF o.invoice_id IS DISTINCT FROM p_invoice_id OR o.price_cents <> p_price_cents THEN RETURN 'mismatch'; END IF;
  IF o.fulfilled_at IS NOT NULL THEN RETURN 'duplicate'; END IF;
  IF p_pay_amount IS NULL OR p_paid IS NULL OR p_pay_amount <= 0 OR p_paid < p_pay_amount THEN RETURN 'underpaid'; END IF;
  IF EXISTS (SELECT 1 FROM billing.payments WHERE environment=p_environment AND id=p_payment_id AND order_id<>p_order_id) THEN RETURN 'mismatch'; END IF;

  INSERT INTO billing.credit_accounts(environment,customer_id,expires_at)
  VALUES (p_environment,o.customer_id,p_now) ON CONFLICT DO NOTHING;
  SELECT * INTO a FROM billing.credit_accounts WHERE environment=p_environment AND customer_id=o.customer_id FOR UPDATE;
  IF a.expires_at <= p_now AND a.credits > 0 THEN
    INSERT INTO billing.credit_ledger(environment,customer_id,order_id,kind,delta,balance_after,created_at)
    VALUES(p_environment,o.customer_id,o.id,'expiry',-a.credits,0,p_now);
    a.credits := 0;
  END IF;
  start_time := greatest(p_now,a.expires_at);
  end_time := start_time + interval '30 days';

  INSERT INTO billing.payments(environment,id,order_id,invoice_id,status,price_cents,pay_currency,pay_amount,actually_paid)
  VALUES(p_environment,p_payment_id,o.id,p_invoice_id,'finished',p_price_cents,p_pay_currency,p_pay_amount,p_paid)
  ON CONFLICT(environment,id) DO UPDATE SET status='finished',actually_paid=excluded.actually_paid,updated_at=now();
  UPDATE billing.credit_accounts SET credits=a.credits+o.credits,expires_at=end_time,plan_id=o.plan_id,updated_at=p_now
  WHERE environment=p_environment AND customer_id=o.customer_id;
  INSERT INTO billing.subscriptions(environment,order_id,customer_id,plan_id,starts_at,ends_at)
  VALUES(p_environment,o.id,o.customer_id,o.plan_id,start_time,end_time);
  INSERT INTO billing.credit_ledger(environment,customer_id,order_id,kind,delta,balance_after,created_at)
  VALUES(p_environment,o.customer_id,o.id,'purchase',o.credits,a.credits+o.credits,p_now);
  UPDATE billing.orders SET status='finished',payment_id=p_payment_id,fulfilled_at=p_now
  WHERE environment=p_environment AND id=o.id;
  RETURN 'fulfilled';
END;
$$;

-- The database is server-only. Do not expose these financial tables through
-- an unauthenticated Data API or grant access to browser roles.
REVOKE ALL ON SCHEMA billing FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA billing FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA billing FROM PUBLIC;
