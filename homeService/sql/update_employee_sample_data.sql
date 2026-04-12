-- Sample data to update an existing employee with new profile fields
-- Run this in Supabase SQL Editor to populate the new columns

-- Update the first employee with sample data
UPDATE employees
SET 
  about_me = 'Experienced electrician with over 8 years of expertise in residential and commercial electrical work. Committed to providing safe and reliable service.',
  skills = ARRAY['Wiring', 'AC Repair', 'Fan Installation', 'Circuit Breaker', 'LED Installation'],
  certifications = ARRAY['Licensed Electrician', 'Safety Training Certified', 'AC Technician'],
  address = 'House 45, Road 12, Dhanmondi, Dhaka 1209',
  hourly_rate = 500,
  response_time_minutes = 15,
  member_since = '2022-01-15',
  reviews_count = 156
WHERE email = (SELECT email FROM employees LIMIT 1);

-- You can manually update other employees with different data:
-- UPDATE employees SET about_me = 'Your text here', skills = ARRAY['Skill1', 'Skill2'], ... WHERE email = 'employee@example.com';
