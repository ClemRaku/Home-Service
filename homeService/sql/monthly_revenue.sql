-- =============================================
-- Monthly Revenue Table Migration Script
-- =============================================
-- This script creates a properly structured table
-- for storing monthly revenue data.
-- =============================================

-- Step 1: Create the new improved table
CREATE TABLE IF NOT EXISTS public.monthly_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate year+month combinations
    CONSTRAINT unique_year_month UNIQUE (year, month)
);

-- Step 2: Migrate existing data from old table
-- Maps old month names to numbers and handles the "Now" typo
INSERT INTO public.monthly_revenue (year, month, revenue)
SELECT 
    2026 AS year,
    CASE 
        WHEN TRIM("Month") IN ('Jan', 'January') THEN 1
        WHEN TRIM("Month") IN ('Feb', 'February') THEN 2
        WHEN TRIM("Month") IN ('Mar', 'March') THEN 3
        WHEN TRIM("Month") IN ('Apr', 'April') THEN 4
        WHEN TRIM("Month") IN ('May') THEN 5
        WHEN TRIM("Month") IN ('Jun', 'June') THEN 6
        WHEN TRIM("Month") IN ('Jul', 'July') THEN 7
        WHEN TRIM("Month") IN ('Aug', 'August') THEN 8
        WHEN TRIM("Month") IN ('Sep', 'September') THEN 9
        WHEN TRIM("Month") IN ('Oct', 'October') THEN 10
        WHEN TRIM("Month") IN ('Nov', 'November', 'Now') THEN 11  -- Fix typo
        WHEN TRIM("Month") IN ('Dec', 'December') THEN 12
        ELSE 0
    END AS month,
    "Taka" AS revenue
FROM public."Monthly Revenue"
WHERE TRIM("Month") IS NOT NULL
ON CONFLICT (year, month) DO NOTHING;

-- Step 3: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_year_month 
ON public.monthly_revenue (year, month);

-- Step 4: Remove RLS for admin access (optional - adjust as needed)
ALTER TABLE public.monthly_revenue DISABLE ROW LEVEL SECURITY;

-- Step 5: Drop old table AFTER verifying data migration was successful
-- UNCOMMENT THE LINE BELOW ONLY AFTER VERIFYING THE NEW TABLE HAS ALL DATA:
-- DROP TABLE IF EXISTS public."Monthly Revenue";

-- =============================================
-- Useful queries for verification:
-- =============================================

-- Check migrated data:
-- SELECT * FROM public.monthly_revenue ORDER BY year, month;

-- Get last 12 months of revenue (for chart):
-- SELECT year, month, revenue 
-- FROM public.monthly_revenue 
-- ORDER BY year DESC, month DESC 
-- LIMIT 12;