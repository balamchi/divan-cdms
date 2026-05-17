-- 1. Add list_name to clickup_tasks_cache for client-portal list filtering
ALTER TABLE public.clickup_tasks_cache
  ADD COLUMN IF NOT EXISTS list_name TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_cache_list_name
  ON public.clickup_tasks_cache (list_name);

-- 2. Enable Supabase Realtime on messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
END $$;