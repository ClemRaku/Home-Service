-- ============================================================
-- UPDATE PACKAGE SERVICES
-- ============================================================
-- This script ensures the package_services table is correctly
-- structured and has the necessary RLS policies.
-- ============================================

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_name VARCHAR REFERENCES public.packages(package_name) ON DELETE CASCADE,
    service_name VARCHAR REFERENCES public.services(service_name) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(package_name, service_name)
);

-- 2. Enable RLS
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow anyone to read
CREATE POLICY "Public can read package_services" ON public.package_services
    FOR SELECT USING (true);

-- Allow anon full access (to match the development style of the project)
CREATE POLICY "anon full access package_services" ON public.package_services
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow Admins to manage
CREATE POLICY "Admins can manage package_services" ON public.package_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_packages = true
            AND ap.status::text = 'Active'
        )
    );

-- 4. Ensure execute_sql function exists for future use (optional but recommended)
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;
  RETURN result;
END;
$$;
