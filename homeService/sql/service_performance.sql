-- =============================================
-- Service Performance Table Migration Script
-- =============================================
-- This script creates a properly structured table
-- for tracking top performing services.
-- =============================================

-- Step 1: Create the new table
CREATE TABLE IF NOT EXISTS public.service_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT NOT NULL,
    bookings INTEGER NOT NULL DEFAULT 0,
    revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate service entries for same month/year
    CONSTRAINT unique_service_month_year UNIQUE (service_name, month, year)
);

-- Step 2: Insert sample data for current month (March 2026)
INSERT INTO public.service_performance (service_name, bookings, revenue, month, year)
VALUES
    ('Deep Cleaning', 312, 62400.00, 3, 2026),
    ('Plumbing Repair', 245, 29400.00, 3, 2026),
    ('Electrical Installation', 189, 28350.00, 3, 2026),
    ('HVAC Maintenance', 156, 28080.00, 3, 2026),
    ('Carpentry Work', 98, 13720.00, 3, 2026)
ON CONFLICT (service_name, month, year) DO NOTHING;

-- Step 3: Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_service_performance_year_month 
ON public.service_performance (year, month);

CREATE INDEX IF NOT EXISTS idx_service_performance_bookings 
ON public.service_performance (bookings DESC);

-- Step 4: Remove RLS for admin access (optional - adjust as needed)
ALTER TABLE public.service_performance DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Useful queries for verification:
-- =============================================

-- Check all data:
-- SELECT * FROM public.service_performance ORDER BY year, month, bookings DESC;

-- Get top 5 services by bookings for current month:
-- SELECT service_name, bookings, revenue 
-- FROM public.service_performance 
-- WHERE year = 2026 AND month = 3 
-- ORDER BY bookings DESC 
-- LIMIT 5;

-- Get progress percentage (relative to top service):
-- SELECT service_name, bookings, revenue, 
--        ROUND((bookings::numeric / MAX(bookings) OVER()) * 100) as progress_pct
-- FROM public.service_performance 
-- WHERE year = 2026 AND month = 3 
-- ORDER BY bookings DESC 
-- LIMIT 5;