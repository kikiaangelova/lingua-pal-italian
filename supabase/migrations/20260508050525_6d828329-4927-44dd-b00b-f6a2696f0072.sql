
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '🇮🇹',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Progress
CREATE TABLE public.progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  daily_xp INTEGER NOT NULL DEFAULT 0,
  daily_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progress owner select" ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Progress owner insert" ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Progress owner update" ON public.progress FOR UPDATE USING (auth.uid() = user_id);

-- Learned words
CREATE TABLE public.learned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_it TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_it)
);
ALTER TABLE public.learned_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Words owner select" ON public.learned_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Words owner insert" ON public.learned_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Words owner update" ON public.learned_words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Words owner delete" ON public.learned_words FOR DELETE USING (auth.uid() = user_id);

-- Lesson completion
CREATE TABLE public.lesson_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_completion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson owner select" ON public.lesson_completion FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Lesson owner insert" ON public.lesson_completion FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lesson owner update" ON public.lesson_completion FOR UPDATE USING (auth.uid() = user_id);

-- Story progress
CREATE TABLE public.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story owner select" ON public.story_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Story owner insert" ON public.story_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile + progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.progress (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
