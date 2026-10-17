BEGIN;
CREATE TABLE billing.free_daily_usage (
 environment text NOT NULL CHECK(environment IN ('live','sandbox')),
 customer_id text NOT NULL, day date NOT NULL,
 used integer NOT NULL DEFAULT 0 CHECK(used BETWEEN 0 AND 3),
 PRIMARY KEY(environment,customer_id,day),
 FOREIGN KEY(environment,customer_id) REFERENCES billing.customers(environment,id)
);
CREATE TABLE billing.free_generation_reservations (
 environment text NOT NULL, id text NOT NULL CHECK(id ~ '^[a-f0-9]{64}$'),
 customer_id text NOT NULL, day date NOT NULL,
 status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','completed','released')),
 created_at timestamptz NOT NULL DEFAULT now(), settled_at timestamptz,
 PRIMARY KEY(environment,id),
 FOREIGN KEY(environment,customer_id,day) REFERENCES billing.free_daily_usage(environment,customer_id,day)
);
CREATE INDEX free_generation_reservations_customer ON billing.free_generation_reservations(environment,customer_id,day,created_at);

CREATE FUNCTION billing.reserve_free_generation(p_environment text,p_customer text,p_id text,p_now timestamptz)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE d date := (p_now AT TIME ZONE 'UTC')::date; r billing.free_generation_reservations%ROWTYPE;
 reclaimed integer; used_count integer;
BEGIN
 INSERT INTO billing.free_daily_usage(environment,customer_id,day) VALUES(p_environment,p_customer,d) ON CONFLICT DO NOTHING;
 PERFORM 1 FROM billing.free_daily_usage WHERE environment=p_environment AND customer_id=p_customer AND day=d FOR UPDATE;
 -- Calls have a 60-second provider deadline plus a 10-second retrieval deadline.
 -- Reclaim abandoned holds only after two minutes; no automatic model retry.
 WITH stale AS (
  UPDATE billing.free_generation_reservations SET status='released',settled_at=p_now
  WHERE environment=p_environment AND customer_id=p_customer AND day=d AND status='reserved'
   AND created_at<=p_now-interval '2 minutes' RETURNING id
 ) SELECT count(*) INTO reclaimed FROM stale;
 UPDATE billing.free_daily_usage SET used=greatest(0,used-reclaimed)
 WHERE environment=p_environment AND customer_id=p_customer AND day=d;
 SELECT * INTO r FROM billing.free_generation_reservations WHERE environment=p_environment AND id=p_id;
 IF FOUND THEN
  IF r.customer_id<>p_customer THEN RETURN 'mismatch'; END IF;
  RETURN r.status;
 END IF;
 SELECT used INTO used_count FROM billing.free_daily_usage WHERE environment=p_environment AND customer_id=p_customer AND day=d;
 IF used_count>=3 THEN RETURN 'exhausted'; END IF;
 INSERT INTO billing.free_generation_reservations(environment,id,customer_id,day,created_at) VALUES(p_environment,p_id,p_customer,d,p_now);
 UPDATE billing.free_daily_usage SET used=used+1 WHERE environment=p_environment AND customer_id=p_customer AND day=d;
 RETURN 'created';
END $$;

CREATE FUNCTION billing.settle_free_generation(p_environment text,p_customer text,p_id text,p_success boolean,p_now timestamptz)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE r billing.free_generation_reservations%ROWTYPE;
BEGIN
 SELECT * INTO r FROM billing.free_generation_reservations WHERE environment=p_environment AND id=p_id AND customer_id=p_customer;
 IF NOT FOUND THEN RETURN 'missing'; END IF;
 -- Lock the quota before the reservation, in the same order as reserve.
 PERFORM 1 FROM billing.free_daily_usage WHERE environment=p_environment AND customer_id=p_customer AND day=r.day FOR UPDATE;
 SELECT * INTO r FROM billing.free_generation_reservations WHERE environment=p_environment AND id=p_id FOR UPDATE;
 IF r.status<>'reserved' THEN RETURN r.status; END IF;
 IF NOT p_success THEN
  UPDATE billing.free_daily_usage SET used=used-1 WHERE environment=p_environment AND customer_id=p_customer AND day=r.day;
 END IF;
 UPDATE billing.free_generation_reservations SET status=CASE WHEN p_success THEN 'completed' ELSE 'released' END,settled_at=p_now
 WHERE environment=p_environment AND id=p_id;
 RETURN CASE WHEN p_success THEN 'completed' ELSE 'released' END;
END $$;
REVOKE ALL ON billing.free_daily_usage,billing.free_generation_reservations FROM PUBLIC;
REVOKE ALL ON FUNCTION billing.reserve_free_generation(text,text,text,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION billing.settle_free_generation(text,text,text,boolean,timestamptz) FROM PUBLIC;
COMMIT;
