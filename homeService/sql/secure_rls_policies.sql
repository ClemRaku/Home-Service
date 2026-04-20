-- Row Level Security (RLS) Policies for Home Service Database
-- Generated from Supabase database

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Table: admin_profiles
-- ============================================
CREATE POLICY "Admins can view own profile" ON admin_profiles
    FOR SELECT USING (auth.uid()::text = email::text);

CREATE POLICY "Admins can update own profile" ON admin_profiles
    FOR UPDATE USING (auth.uid()::text = email::text);

CREATE POLICY "Super Admins can insert profiles" ON admin_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.role::text = 'Super Admin'
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "Super Admins can delete profiles" ON admin_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.role::text = 'Super Admin'
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: bookings
-- ============================================
CREATE POLICY "Public can read bookings" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "anon read bookings" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "anon insert bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "anon update bookings" ON bookings
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon delete bookings" ON bookings
    FOR DELETE USING (true);

-- ============================================
-- Table: contacts
-- ============================================
CREATE POLICY "Public can read contacts" ON contacts
    FOR SELECT USING (true);

CREATE POLICY "Allow public contact form submissions" ON contacts
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON contacts
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow admin to view all contacts" ON contacts
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow admin to update contacts" ON contacts
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin to delete contacts" ON contacts
    FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage contacts" ON contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_scheduling = true
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: conversations
-- ============================================
CREATE POLICY "Participants can read conversations" ON conversations
    FOR SELECT USING (
        auth.uid()::text = customer_email OR auth.uid()::text = employee_email
    );

CREATE POLICY "anon_all_conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Table: customers
-- ============================================
CREATE POLICY "Public can read customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Allow anon insert on Sign up" ON customers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon full access" ON customers
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_customers = true
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: employees
-- ============================================
CREATE POLICY "Public can read employees" ON employees
    FOR SELECT USING (true);

CREATE POLICY "anon full access" ON employees
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_employees = true
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: messages
-- ============================================
CREATE POLICY "Participants can read messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_email = auth.uid()::text OR c.employee_email = auth.uid()::text)
        )
    );

CREATE POLICY "anon_all_messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Table: offers
-- ============================================
CREATE POLICY "Public can read offers" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Allow all select" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Allow anon insert on Offer" ON offers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon full access" ON offers
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage offers" ON offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_offers = true
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: package_categories
-- ============================================
CREATE POLICY "Public can read package_categories" ON package_categories
    FOR SELECT USING (true);

CREATE POLICY "anon read package_categories" ON package_categories
    FOR SELECT USING (true);

CREATE POLICY "anon all package_categories" ON package_categories
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Table: packages
-- ============================================
CREATE POLICY "Public can read packages" ON packages
    FOR SELECT USING (true);

CREATE POLICY "anon full access" ON packages
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage packages" ON packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_packages = true
            AND ap.status::text = 'Active'
        )
    );

-- ============================================
-- Table: service_performance
-- ============================================
CREATE POLICY "Public can read service_performance" ON service_performance
    FOR SELECT USING (true);

-- ============================================
-- Table: services
-- ============================================
CREATE POLICY "Public can read services" ON services
    FOR SELECT USING (true);

CREATE POLICY "anon full access" ON services
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_services = true
            AND ap.status::text = 'Active'
        )
    );