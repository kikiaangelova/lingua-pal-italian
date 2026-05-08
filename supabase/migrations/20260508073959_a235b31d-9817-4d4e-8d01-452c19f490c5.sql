
ALTER TABLE public.lesson_completion REPLICA IDENTITY FULL;
ALTER TABLE public.tutor_mistakes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_completion;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tutor_mistakes;
