-- ============================================================
-- HOME SERVICE APPLICATION - DATABASE SCHEMA
-- ============================================================
-- This file documents the complete SQL layout of the database
-- Generated: 2026-04-20
-- ============================================================

-- ============================================================
-- OVERVIEW
-- ============================================================
-- Total Tables: 12 (public schema)
-- All tables have Row Level Security (RLS) enabled
-- 
-- Tables:
--   1. admin_profiles      - Admin user accounts
--   2. bookings            - Service booking records
--   3. contacts            - Contact form submissions
--   4. conversations       - Chat conversations
--   5. customers           - Customer accounts
--   6. employees           - Employee accounts
--   7. messages            - Chat messages
--   8. offers              - Promotional offers
--   9. package_categories  - Package categorization
--  10. packages            - Service packages
--  11. service_performance - Service analytics
--  12. services            - Available services
-- ============================================================


-- ============================================================
-- TABLE: admin_profiles
-- ============================================================
-- Purpose: Stores admin user accounts with role-based permissions
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.admin_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name               VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone_number            VARCHAR(50),
    role                    VARCHAR(100) NOT NULL DEFAULT 'Admin',
    status                  VARCHAR(50) NOT NULL DEFAULT 'Active',
    avatar_url              TEXT,
    joined_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at           TIMESTAMPTZ,
    
    -- Permission flags
    can_manage_employees    BOOLEAN NOT NULL DEFAULT false,
    can_manage_customers     BOOLEAN NOT NULL DEFAULT false,
    can_manage_services      BOOLEAN NOT NULL DEFAULT false,
    can_manage_packages      BOOLEAN NOT NULL DEFAULT false,
    can_manage_offers        BOOLEAN NOT NULL DEFAULT false,
    can_manage_scheduling    BOOLEAN NOT NULL DEFAULT false,
    can_view_analytics       BOOLEAN NOT NULL DEFAULT false,
    can_access_settings      BOOLEAN NOT NULL DEFAULT false,
    
    password_changed_at      TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    password_hash            TEXT NOT NULL
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view own profile"
    ON public.admin_profiles FOR SELECT
    USING (auth.uid()::text = email::text);

CREATE POLICY "Admins can update own profile"
    ON public.admin_profiles FOR UPDATE
    USING (auth.uid()::text = email::text);

CREATE POLICY "Super Admins can insert profiles"
    ON public.admin_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.role::text = 'Super Admin'
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "Super Admins can delete profiles"
    ON public.admin_profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.role::text = 'Super Admin'
            AND ap.status::text = 'Active'
        )
    );


-- ============================================================
-- TABLE: customers
-- ============================================================
-- Purpose: Stores customer account information
-- Primary Key: email (TEXT)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.customers (
    full_name               TEXT NOT NULL,
    email                   TEXT PRIMARY KEY,
    phone_number            TEXT NOT NULL,
    password_hash           VARCHAR NOT NULL,
    wallet_balance          REAL,
    points                  INTEGER,
    address                 TEXT,
    bookings                INTEGER NOT NULL DEFAULT 0,
    status                  BOOLEAN NOT NULL DEFAULT false,
    joined_at               DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    location_updated_at     TIMESTAMPTZ
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Public can read customers"
    ON public.customers FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage customers"
    ON public.customers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_customers = true
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "Allow anon insert on Sign up"
    ON public.customers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "anon full access"
    ON public.customers FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: employees
-- ============================================================
-- Purpose: Stores employee accounts with skills and availability
-- Primary Key: email (TEXT)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.employees (
    full_name               VARCHAR NOT NULL,
    email                   TEXT PRIMARY KEY,
    phone_number            TEXT NOT NULL,
    role                    VARCHAR NOT NULL,
    password_hash           TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Performance metrics
    performance_score       DOUBLE PRECISION,
    jobs_completed          BIGINT,
    reviews_count           BIGINT DEFAULT 0,
    monthly_earnings        DOUBLE PRECISION,
    
    -- Profile info
    about_me                TEXT,
    skills                  TEXT[],
    certifications          TEXT[],
    address                 TEXT,
    avatar_url              TEXT,
    member_since            DATE DEFAULT CURRENT_DATE,
    
    -- Availability
    status                  BOOLEAN,
    availability            TEXT DEFAULT 'available',
    working_hours           JSONB,
    working_days            TEXT[],
    
    -- Location tracking
    last_latitude           DOUBLE PRECISION,
    last_longitude          DOUBLE PRECISION,
    last_location_at        TIMESTAMPTZ
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Public can read employees"
    ON public.employees FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage employees"
    ON public.employees FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_employees = true
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "anon full access"
    ON public.employees FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: services
-- ============================================================
-- Purpose: Available services offered by the company
-- Primary Key: service_name (VARCHAR)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.services (
    service_name            VARCHAR PRIMARY KEY,
    category                VARCHAR NOT NULL,
    price                   DOUBLE PRECISION NOT NULL,
    duration                INTEGER NOT NULL,
    points                  INTEGER,
    is_active               BOOLEAN,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Public can read services"
    ON public.services FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage services"
    ON public.services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_services = true
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "anon full access"
    ON public.services FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: package_categories
-- ============================================================
-- Purpose: Categories for grouping service packages
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.package_categories (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    description             TEXT NOT NULL,
    color_class             TEXT NOT NULL DEFAULT 'teal',
    created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.package_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for package_categories
CREATE POLICY "Public can read package_categories"
    ON public.package_categories FOR SELECT
    USING (true);

CREATE POLICY "anon all package_categories"
    ON public.package_categories FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: packages
-- ============================================================
-- Purpose: Service packages bundling multiple services
-- Primary Key: package_name (VARCHAR)
-- Foreign Key: category_id -> package_categories(id)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.packages (
    package_name            VARCHAR PRIMARY KEY,
    price                   REAL NOT NULL,
    discount                INTEGER NOT NULL,
    services_included       TEXT NOT NULL,
    points                  INTEGER,
    description             TEXT,
    package_category        TEXT,
    category_description    TEXT,
    category_id             UUID REFERENCES package_categories(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Public can read packages"
    ON public.packages FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage packages"
    ON public.packages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_packages = true
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "anon full access"
    ON public.packages FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: offers
-- ============================================================
-- Purpose: Promotional offers and discount codes
-- Primary Key: offer_title (VARCHAR)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.offers (
    offer_title             VARCHAR PRIMARY KEY,
    discount                INTEGER NOT NULL,
    promo_code              VARCHAR NOT NULL,
    valid_until             DATE NOT NULL,
    times_used              INTEGER NOT NULL,
    service_name            VARCHAR,
    package_name            VARCHAR,
    status                  BOOLEAN,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers
CREATE POLICY "Public can read offers"
    ON public.offers FOR SELECT
    USING (true);

CREATE POLICY "Allow all select"
    ON public.offers FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage offers"
    ON public.offers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_offers = true
            AND ap.status::text = 'Active'
        )
    );

CREATE POLICY "Allow anon insert on Offer"
    ON public.offers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "anon full access"
    ON public.offers FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: bookings
-- ============================================================
-- Purpose: Service booking records linking customers and employees
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.bookings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number          BIGINT NOT NULL,
    customer_email          TEXT NOT NULL,
    customer_name           TEXT,
    employee_email          TEXT,
    employee_name           TEXT,
    service_name            TEXT NOT NULL,
    scheduled_date          DATE NOT NULL,
    start_time              TIME NOT NULL,
    end_time                TIME NOT NULL,
    address                 TEXT NOT NULL,
    price                   REAL NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'upcoming',
    additional_details      TEXT,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Public can read bookings"
    ON public.bookings FOR SELECT
    USING (true);

CREATE POLICY "anon read bookings"
    ON public.bookings FOR SELECT
    USING (true);

CREATE POLICY "anon insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "anon update bookings"
    ON public.bookings FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "anon delete bookings"
    ON public.bookings FOR DELETE
    USING (true);


-- ============================================================
-- TABLE: contacts
-- ============================================================
-- Purpose: Contact form submissions from website visitors
-- Primary Key: id (INTEGER)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.contacts (
    id                      INTEGER PRIMARY KEY,
    full_name               TEXT NOT NULL,
    email                   VARCHAR NOT NULL,
    phone_number            TEXT NOT NULL,
    service_interest        VARCHAR NOT NULL,
    message                 VARCHAR NOT NULL,
    status                  BOOLEAN DEFAULT false,
    reply                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Public can read contacts"
    ON public.contacts FOR SELECT
    USING (true);

CREATE POLICY "Allow public contact form submissions"
    ON public.contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public inserts"
    ON public.contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admin to view all contacts"
    ON public.contacts FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to update contacts"
    ON public.contacts FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admin to delete contacts"
    ON public.contacts FOR DELETE
    USING (true);

CREATE POLICY "Admins can manage contacts"
    ON public.contacts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.email::text = auth.uid()::text
            AND ap.can_manage_scheduling = true
            AND ap.status::text = 'Active'
        )
    );


-- ============================================================
-- TABLE: conversations
-- ============================================================
-- Purpose: Chat conversation threads between customers and employees
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.conversations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email          TEXT NOT NULL,
    employee_email          TEXT NOT NULL,
    booking_id              UUID,
    last_message            TEXT,
    last_message_at         TIMESTAMPTZ DEFAULT now(),
    created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Participants can read conversations"
    ON public.conversations FOR SELECT
    USING (
        auth.uid()::text = customer_email
        OR auth.uid()::text = employee_email
    );

CREATE POLICY "anon_all_conversations"
    ON public.conversations FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: messages
-- ============================================================
-- Purpose: Individual chat messages within conversations
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.messages (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id         UUID NOT NULL,
    sender_email            TEXT NOT NULL,
    sender_type             TEXT NOT NULL,
    content                 TEXT NOT NULL,
    is_read                 BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Participants can read messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (
                c.customer_email = auth.uid()::text
                OR c.employee_email = auth.uid()::text
            )
        )
    );

CREATE POLICY "anon_all_messages"
    ON public.messages FOR ALL
    USING (true)
    WITH CHECK (true);


-- ============================================================
-- TABLE: service_performance
-- ============================================================
-- Purpose: Analytics metrics for service performance tracking
-- Primary Key: id (UUID)
-- RLS: Enabled
-- ============================================================

CREATE TABLE public.service_performance (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name            TEXT NOT NULL,
    bookings                INTEGER NOT NULL DEFAULT 0,
    revenue                 NUMERIC NOT NULL DEFAULT 0,
    month                   INTEGER NOT NULL,
    year                    INTEGER NOT NULL,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_performance
CREATE POLICY "Public can read service_performance"
    ON public.service_performance FOR SELECT
    USING (true);


-- ============================================================
-- INDEXES (Recommended for performance)
-- ============================================================
-- Consider adding indexes on frequently queried columns:
-- 
-- CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
-- CREATE INDEX idx_bookings_employee_email ON bookings(employee_email);
-- CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
-- CREATE INDEX idx_bookings_status ON bookings(status);
-- CREATE INDEX idx_conversations_customer ON conversations(customer_email);
-- CREATE INDEX idx_conversations_employee ON conversations(employee_email);
-- CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
-- CREATE INDEX idx_employees_availability ON employees(availability);
-- CREATE INDEX idx_service_performance_date ON service_performance(year, month);
-- ============================================================


-- ============================================================
-- DATABASE RELATIONSHIPS SUMMARY
-- ============================================================
-- Foreign Keys:
--   packages.category_id -> package_categories.id
--
-- Logical Relationships (not enforced by FK):
--   bookings.customer_email -> customers.email
--   bookings.employee_email -> employees.email
--   bookings.service_name -> services.service_name
--   conversations.customer_email -> customers.email
--   conversations.employee_email -> employees.email
--   messages.conversation_id -> conversations.id
--   offers.service_name -> services.service_name
--   offers.package_name -> packages.package_name
-- ============================================================


-- ============================================================
-- ROW LEVEL SECURITY SUMMARY
-- ============================================================
-- All 12 tables have RLS enabled with the following policy types:
--
-- Public Read Policies:
--   - services, packages, offers, bookings, contacts, 
--     package_categories, employees, customers, service_performance
--
-- Admin-Managed Policies:
--   - Based on admin_profiles permission flags
--   - Requires matching permission AND 'Active' status
--
-- Participant-Based Policies:
--   - conversations, messages (users can only access their own)
--
-- Note: Some tables have "anon full access" policies for 
-- development purposes. Review and restrict in production.
-- ============================================================