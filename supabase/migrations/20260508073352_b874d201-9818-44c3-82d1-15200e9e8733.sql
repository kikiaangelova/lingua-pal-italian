
CREATE TABLE public.tutor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_messages_user_created ON public.tutor_messages(user_id, created_at);
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tm owner select" ON public.tutor_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tm owner insert" ON public.tutor_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tm owner delete" ON public.tutor_messages FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.tutor_mistakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  note TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic)
);
ALTER TABLE public.tutor_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tk owner select" ON public.tutor_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tk owner insert" ON public.tutor_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tk owner update" ON public.tutor_mistakes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tk owner delete" ON public.tutor_mistakes FOR DELETE USING (auth.uid() = user_id);
