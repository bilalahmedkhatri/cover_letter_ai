BEGIN;
CREATE TABLE app.conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL,
 workflow text NOT NULL CHECK(workflow IN ('cover-letter','university','email','research')),
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 160),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX conversations_owner_updated ON app.conversations(user_id,updated_at DESC,id DESC);
CREATE TABLE app.messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conversation_id uuid NOT NULL REFERENCES app.conversations(id) ON DELETE CASCADE,
 request_id uuid NOT NULL, role text NOT NULL CHECK(role IN ('user','assistant')),
 content text NOT NULL DEFAULT '' CHECK(length(content)<=200000),
 status text NOT NULL CHECK(status IN ('pending','completed','failed')),
 context jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(context)='object' AND length(context::text)<=65536),
 sources jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(sources)='array'),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(request_id,role)
);
CREATE INDEX messages_conversation_created ON app.messages(conversation_id,created_at DESC,id DESC);
ALTER TABLE app.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.conversations,app.messages FROM PUBLIC;

-- One claim per request, independent of billing. Ownership is checked inside
-- the atomic function as well as on every list/read/update/delete query.
CREATE FUNCTION app.start_chat_generation(p_user text,p_chat uuid,p_request uuid,p_workflow text,p_title text,p_content text,p_context jsonb)
RETURNS TABLE(state text,chat_id uuid,message_id uuid,answer text,answer_sources jsonb) LANGUAGE plpgsql AS $$
DECLARE c app.conversations; m app.messages; u app.messages; stamp timestamptz;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request::text,0));
 SELECT * INTO m FROM app.messages WHERE request_id=p_request AND role='assistant';
 IF FOUND THEN
  SELECT * INTO c FROM app.conversations WHERE id=m.conversation_id FOR UPDATE;
  IF c.user_id<>p_user OR c.workflow<>p_workflow OR (p_chat IS NOT NULL AND c.id<>p_chat) THEN
   RETURN QUERY SELECT 'conflict',NULL::uuid,NULL::uuid,NULL::text,NULL::jsonb; RETURN;
  END IF;
  SELECT * INTO u FROM app.messages WHERE request_id=p_request AND role='user';
  IF u.context<>p_context OR u.content<>p_content THEN
   RETURN QUERY SELECT 'conflict',NULL::uuid,NULL::uuid,NULL::text,NULL::jsonb; RETURN;
  END IF;
  IF m.status='pending' AND m.created_at<clock_timestamp()-interval '5 minutes' THEN
   UPDATE app.messages SET status='failed' WHERE request_id=p_request;
   m.status:='failed';
  END IF;
  RETURN QUERY SELECT m.status,c.id,m.id,m.content,m.sources; RETURN;
 END IF;
 IF p_chat IS NULL THEN
  INSERT INTO app.conversations(user_id,workflow,title) VALUES(p_user,p_workflow,p_title) RETURNING * INTO c;
 ELSE
  SELECT * INTO c FROM app.conversations WHERE id=p_chat AND user_id=p_user AND workflow=p_workflow FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT 'missing',NULL::uuid,NULL::uuid,NULL::text,NULL::jsonb; RETURN; END IF;
 END IF;
 UPDATE app.messages SET status='failed' WHERE conversation_id=c.id AND status='pending' AND created_at<clock_timestamp()-interval '5 minutes';
 IF EXISTS(SELECT 1 FROM app.messages WHERE conversation_id=c.id AND status='pending') THEN
  RETURN QUERY SELECT 'pending',c.id,NULL::uuid,NULL::text,NULL::jsonb; RETURN;
 END IF;
 stamp:=clock_timestamp();
 INSERT INTO app.messages(conversation_id,request_id,role,content,status,context,created_at)
 VALUES(c.id,p_request,'user',p_content,'pending',p_context,stamp);
 INSERT INTO app.messages(id,conversation_id,request_id,role,status,created_at)
 VALUES(p_request,c.id,p_request,'assistant','pending',stamp+interval '1 microsecond');
 UPDATE app.conversations SET updated_at=clock_timestamp() WHERE id=c.id;
 RETURN QUERY SELECT 'created',c.id,p_request,NULL::text,'[]'::jsonb;
END $$;

CREATE FUNCTION app.finish_chat_generation(p_user text,p_request uuid,p_success boolean,p_answer text,p_sources jsonb)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE chat uuid; changed integer;
BEGIN
 SELECT c.id INTO chat FROM app.conversations c JOIN app.messages m ON m.conversation_id=c.id
 WHERE c.user_id=p_user AND m.request_id=p_request AND m.role='assistant' FOR UPDATE OF c;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE app.messages SET status=CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
 content=p_answer,sources=p_sources WHERE conversation_id=chat AND request_id=p_request AND role='assistant' AND status='pending';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed=0 THEN RETURN false; END IF;
 UPDATE app.messages SET status=CASE WHEN p_success THEN 'completed' ELSE 'failed' END WHERE conversation_id=chat AND request_id=p_request AND role='user';
 UPDATE app.conversations SET updated_at=clock_timestamp() WHERE id=chat;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION app.start_chat_generation(text,uuid,uuid,text,text,text,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.finish_chat_generation(text,uuid,boolean,text,jsonb) FROM PUBLIC;
COMMIT;
