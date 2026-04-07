-- Disable Row Level Security on admin_profiles table
-- Run this SQL in Supabase SQL Editor to allow API access

ALTER TABLE public.admin_profiles DISABLE ROW LEVEL SECURITY;

-- After running this, you can query the table to see all data:
-- SELECT * FROM public.admin_profiles;