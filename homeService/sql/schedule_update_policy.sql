-- Enable controlled UPDATE access for the schedule table instead of disabling RLS.
-- Run this in the Supabase SQL Editor if you want to keep RLS enabled.

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- Allow reading all schedule rows
DROP POLICY IF EXISTS "Allow public read schedule" ON public.schedule;
CREATE POLICY "Allow public read schedule"
ON public.schedule
FOR SELECT
USING (true);

-- Allow updating all schedule rows
DROP POLICY IF EXISTS "Allow public update schedule" ON public.schedule;
CREATE POLICY "Allow public update schedule"
ON public.schedule
FOR UPDATE
USING (true)
WITH CHECK (true);
