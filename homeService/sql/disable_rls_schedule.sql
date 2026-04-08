-- Disable Row Level Security on schedule table
-- Run this in the Supabase SQL Editor if the admin page uses the anon key
-- and you want the page to be able to update rows directly.

ALTER TABLE public.schedule DISABLE ROW LEVEL SECURITY;

-- Optional check:
-- SELECT * FROM public.schedule;
