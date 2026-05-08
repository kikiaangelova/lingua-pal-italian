-- Restrict Realtime channel subscriptions so authenticated users can only
-- listen on topics scoped to their own user id (e.g. "tutor-mistakes-<uid>",
-- "lesson-<uid>", or any topic ending with their uid).
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own-topic messages" ON realtime.messages;
CREATE POLICY "Authenticated can read own-topic messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE '%' || auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated can send own-topic messages" ON realtime.messages;
CREATE POLICY "Authenticated can send own-topic messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE '%' || auth.uid()::text
);
