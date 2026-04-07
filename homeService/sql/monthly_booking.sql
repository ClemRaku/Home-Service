-- =============================================
-- Monthly Booking Table Migration Script
-- =============================================
-- This script creates a properly structured table
-- for storing monthly booking data.
-- =============================================

-- Step 1: Create the new improved table
CREATE TABLE IF NOT EXISTS public.monthly_booking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    bookings INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate year+month combinations (unique constraint name)
    CONSTRAINT unique_monthly_booking_year_month UNIQUE (year, month)
);

-- Step 2: Insert sample data for 2026
-- (Adjust these values based on your actual booking data)
INSERT INTO public.monthly_booking (year, month, bookings)
VALUES
    (2026, 1, 90),
    (2026, 2, 102),
    (2026, 3, 118),
    (2026, 4, 97),
    (2026, 5, 126),
    (2026, 6, 142),
    (2026, 7, 136),
    (2026, 8, 150),
    (2026, 9, 138),
    (2026, 10, 160),
    (2026, 11, 148),
    (2026, 12, 170)
ON CONFLICT (year, month) DO NOTHING;

-- Step 3: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_monthly_booking_year_month 
ON public.monthly_booking (year, month);

-- Step 4: Remove RLS for admin access (optional - adjust as needed)
ALTER TABLE public.monthly_booking DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Useful queries for verification:
-- =============================================

-- Check data:
-- SELECT * FROM public.monthly_booking ORDER BY year, month;

-- Get last 12 months of bookings (for chart):
-- SELECT year, month, bookings 
-- FROM public.monthly_booking 
-- ORDER BY year DESC, month DESC 
-- LIMIT 12;