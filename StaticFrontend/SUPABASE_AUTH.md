# Supabase Authentication Integration

## Overview
The login system has been updated to integrate with Supabase for employee authentication while maintaining backward compatibility with demo accounts.

## Changes Made

### 1. Login.html
- ✅ Added **Role selector** (Employee/Customer/Admin)
- ✅ Added Supabase JS SDK script tag
- ✅ Added IDs to form inputs for easier JavaScript access

### 2. login.js
- ✅ Integrated Supabase client with your project credentials
- ✅ Queries the `employees` table for authentication
- ✅ Falls back to demo users if Supabase is unavailable
- ✅ Stores user session in localStorage
- ✅ Redirects based on user role:
  - **Employee** → `EmployeeProfile.html`
  - **Admin** → `Admin.html`
  - **Customer** → `Home.html`

### 3. Login.css
- ✅ Added styling for the role select dropdown
- ✅ Custom arrow icon for better UX
- ✅ Consistent with existing design

## How It Works

### Employee Login Flow:
1. User selects "Employee" role
2. Enters email and password
3. System queries Supabase `employees` table
4. If credentials match, user info is stored in localStorage
5. Redirects to `EmployeeProfile.html`

### Database Requirements:
The `employees` table should have these columns:
- `id` (UUID or int)
- `name` (text)
- `email` (text)
- `password` (text) - stored as plain text for now (should be hashed in production)
- `role` (text) - e.g., 'employee', 'admin'
- `status` (text) - 'active' or 'inactive'

## Demo Accounts (Fallback)
If Supabase is unavailable, these demo accounts still work:
- **Customer**: `customer@homeservice.com` / `customer123`
- **Employee**: `employee@homeservice.com` / `employee123`

## Supabase Configuration
- **URL**: `https://erqqqovdprgpfgmueevj.supabase.co`
- **Anon Key**: Configured in login.js

## Security Notes
⚠️ **IMPORTANT**: 
- Currently using plain text passwords (for development)
- In production, use Supabase Auth with bcrypt hashing
- Never expose anon key if it has elevated permissions
- Consider implementing JWT tokens for session management

## Testing
To test employee login:
1. Add an employee to your Supabase `employees` table
2. Open `Login.html`
3. Select "Employee" role
4. Enter the employee's email and password
5. Should redirect to `EmployeeProfile.html`
