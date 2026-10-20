BEGIN;
-- Independent of billing and chat deletion. Each user has at most 10 recent
-- claims and two live leases; a crashed request's lease expires in five minutes.
CREATE TABLE app.generation_guards (
 user_id text PRIMARY KEY,
 recent jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(recent)='object'),
 active jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(active)='object')
);
ALTER TABLE app.generation_guards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.generation_guards FROM PUBLIC;

CREATE FUNCTION app.start_guarded_chat_generation(p_user text,p_chat uuid,p_request uuid,p_workflow text,p_title text,p_content text,p_context jsonb)
RETURNS TABLE(state text,chat_id uuid,message_id uuid,answer text,answer_sources jsonb) LANGUAGE plpgsql AS $$
DECLARE claim record; guard app.generation_guards; stamp numeric;
BEGIN
 -- Serialize across all conversations/instances for this account, before the
 -- existing request/chat locks. Completed replays never consume another slot.
 PERFORM pg_advisory_xact_lock(hashtextextended('generation-user:' || p_user,0));
 SELECT * INTO claim FROM app.start_chat_generation(p_user,p_chat,p_request,p_workflow,p_title,p_content,p_context);
 IF claim.state='created' THEN
  stamp:=extract(epoch FROM clock_timestamp());
  INSERT INTO app.generation_guards(user_id) VALUES(p_user) ON CONFLICT DO NOTHING;
  SELECT * INTO guard FROM app.generation_guards WHERE user_id=p_user FOR UPDATE;
  SELECT coalesce(jsonb_object_agg(key,value),'{}'::jsonb) INTO guard.recent
   FROM jsonb_each(guard.recent) WHERE value::text::numeric>stamp-60;
  SELECT coalesce(jsonb_object_agg(key,value),'{}'::jsonb) INTO guard.active
   FROM jsonb_each(guard.active) WHERE value::text::numeric>stamp;
  IF (SELECT count(*) FROM jsonb_each(guard.recent))>=10 THEN
   RAISE EXCEPTION 'generation_rate_limited' USING ERRCODE='P0429';
  END IF;
  IF (SELECT count(*) FROM jsonb_each(guard.active))>=2 THEN
   RAISE EXCEPTION 'generation_concurrency_limited' USING ERRCODE='P0428';
  END IF;
  UPDATE app.generation_guards SET
   recent=guard.recent || jsonb_build_object(p_request::text,stamp),
   active=guard.active || jsonb_build_object(p_request::text,stamp+300)
   WHERE user_id=p_user;
 END IF;
 -- Exceptions above roll back the new history claim too: rejected requests do
 -- not leave empty chats or reach the model.
 RETURN QUERY SELECT claim.state,claim.chat_id,claim.message_id,claim.answer,claim.answer_sources;
END $$;

CREATE FUNCTION app.finish_guarded_chat_generation(p_user text,p_request uuid,p_success boolean,p_answer text,p_sources jsonb)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE saved boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('generation-user:' || p_user,0));
 saved:=app.finish_chat_generation(p_user,p_request,p_success,p_answer,p_sources);
 -- Release even when the owner deleted the chat while generation was running.
 UPDATE app.generation_guards SET active=active-p_request::text WHERE user_id=p_user;
 RETURN saved;
END $$;
REVOKE ALL ON FUNCTION app.start_guarded_chat_generation(text,uuid,uuid,text,text,text,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.finish_guarded_chat_generation(text,uuid,boolean,text,jsonb) FROM PUBLIC;
COMMIT;
