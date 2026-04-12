-- ============================================================
-- ADMIN PROFILES TABLE CREATION & RLS POLICIES
-- For Home Service Application (Supabase/PostgreSQL)
-- ============================================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    role VARCHAR(100) NOT NULL DEFAULT 'Admin',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    avatar_url TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Permissions
    can_manage_employees BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_customers BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_services BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_packages BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_offers BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_scheduling BOOLEAN NOT NULL DEFAULT FALSE,
    can_view_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    can_access_settings BOOLEAN NOT NULL DEFAULT FALSE,

    -- Security
    password_changed_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,

    -- Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT status_check CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT role_check CHECK (role IN ('Super Admin', 'Admin', 'Moderator', 'Support'))
);

-- 2. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_status ON public.admin_profiles(status);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- 3. COMMENTS
COMMENT ON TABLE public.admin_profiles IS 'Stores admin user profiles with permissions and settings';
COMMENT ON COLUMN public.admin_profiles.user_id IS 'Foreign key reference to Supabase auth.users table';

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- Policy: Admins can view their own profile
CREATE POLICY "Admins can view own profile"
    ON public.admin_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Super Admins can view all profiles
CREATE POLICY "Super Admins can view all profiles"
    ON public.admin_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.user_id = auth.uid()
            AND ap.role = 'Super Admin'
            AND ap.status = 'Active'
        )
    );

-- Policy: Admins can update their own profile
CREATE POLICY "Admins can update own profile"
    ON public.admin_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Super Admins can update all profiles
CREATE POLICY "Super Admins can update all profiles"
    ON public.admin_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.user_id = auth.uid()
            AND ap.role = 'Super Admin'
            AND ap.status = 'Active'
        )
    );

-- Policy: Only Super Admins can insert new profiles
CREATE POLICY "Only Super Admins can insert profiles"
    ON public.admin_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.user_id = auth.uid()
            AND ap.role = 'Super Admin'
            AND ap.status = 'Active'
        )
    );

-- Policy: Only Super Admins can delete profiles
CREATE POLICY "Only Super Admins can delete profiles"
    ON public.admin_profiles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.user_id = auth.uid()
            AND ap.role = 'Super Admin'
            AND ap.status = 'Active'
        )
    );

-- 6. TRIGGER FUNCTION: Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER: Update timestamp on row modification
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. TRIGGER FUNCTION: Auto-create profile on user signup (optional)
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_profiles (user_id, full_name, email, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Admin'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'Admin'),
        'Active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER: Auto-create admin profile on new user (if needed)
-- Uncomment if you want automatic profile creation on signup
-- CREATE TRIGGER on_auth_user_created_for_admin
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_admin_user();

-- 10. SEED DATA: Insert a default Super Admin (optional - update as needed)
-- Uncomment and modify to create an initial Super Admin
-- INSERT INTO public.admin_profiles (user_id, full_name, email, role, status, can_manage_employees, can_manage_customers, can_manage_services, can_manage_packages, can_manage_offers, can_manage_scheduling, can_view_analytics, can_access_settings)
-- VALUES ('<USER_ID_FROM_AUTH>', 'Super Admin', 'admin@homeservice.com', 'Super Admin', 'Active', true, true, true, true, true, true, true, true)
-- ON CONFLICT (email) DO NOTHING;