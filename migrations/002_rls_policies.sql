-- Enable RLS on all tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_member()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM members 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM members 
        WHERE user_id = auth.uid() 
        AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Settings policies
CREATE POLICY "Settings are viewable by members" ON settings
    FOR SELECT USING (is_member());

CREATE POLICY "Settings are updatable by admins" ON settings
    FOR UPDATE USING (is_admin());

-- Profiles policies
CREATE POLICY "Profiles are viewable by members" ON profiles
    FOR SELECT USING (is_member());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Members policies
CREATE POLICY "Members can view their own membership" ON members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships" ON members
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage memberships" ON members
    FOR ALL USING (is_admin());

-- Bookings policies
CREATE POLICY "Bookings are viewable by members" ON bookings
    FOR SELECT USING (is_member());

CREATE POLICY "Members can create pending bookings" ON bookings
    FOR INSERT WITH CHECK (
        is_member() 
        AND status = 'PENDING' 
        AND requester_id = auth.uid()
    );

CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (is_admin());

-- Visits policies
CREATE POLICY "Visits are viewable by members" ON visits
    FOR SELECT USING (is_member());

CREATE POLICY "Admins can manage visits" ON visits
    FOR ALL USING (is_admin());

-- Notices policies
CREATE POLICY "Notices are viewable by members" ON notices
    FOR SELECT USING (is_member());

CREATE POLICY "Members can create notices" ON notices
    FOR INSERT WITH CHECK (
        is_member() 
        AND author_id = auth.uid()
    );

CREATE POLICY "Admins can manage all notices" ON notices
    FOR ALL USING (is_admin());
