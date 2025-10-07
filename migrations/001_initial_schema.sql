-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE member_role AS ENUM ('MEMBER', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'HOLD', 'BLOCKED');

-- Settings table (single row)
CREATE TABLE settings (
    id boolean PRIMARY KEY DEFAULT true,
    house_name text NOT NULL DEFAULT 'O''Sullivan House',
    join_code text NOT NULL,
    admin_claim_code text NOT NULL,
    timezone text NOT NULL DEFAULT 'Europe/London',
    ics_token uuid NOT NULL DEFAULT gen_random_uuid(),
    min_nights int NOT NULL DEFAULT 1,
    buffer_days int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT single_settings_row CHECK (id = true)
);

-- Profiles table (mirror of auth.users)
CREATE TABLE profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    display_name text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Members table (role per user for this single house)
CREATE TABLE members (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'MEMBER',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    status booking_status NOT NULL DEFAULT 'PENDING',
    start_ts timestamptz NOT NULL,
    end_ts timestamptz NOT NULL,
    title text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT start_before_end CHECK (start_ts < end_ts)
);

-- Visits table (admin-scheduled; non-blocking)
CREATE TABLE visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    start_ts timestamptz NOT NULL,
    end_ts timestamptz NOT NULL,
    title text NOT NULL,
    notes text,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT visit_start_before_end CHECK (start_ts < end_ts)
);

-- Notices table
CREATE TABLE notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    body text NOT NULL,
    pinned boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_bookings_start_ts ON bookings(start_ts);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_visits_start_ts ON visits(start_ts);
CREATE INDEX idx_notices_pinned_created ON notices(pinned DESC, created_at DESC);

-- Create GIST index for bookings to prevent overlaps
CREATE INDEX idx_bookings_timerange ON bookings USING gist (tstzrange(start_ts, end_ts, '[)'));

-- Create EXCLUDE constraint to prevent overlapping approved/hold/blocked bookings
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings 
EXCLUDE USING gist (
    tstzrange(start_ts, end_ts, '[)') WITH &&
) WHERE (status IN ('APPROVED', 'HOLD', 'BLOCKED'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to insert into profiles when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, display_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
