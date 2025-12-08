-- Swift Shaadi Initial Database Schema
-- Migration: 20240101000000

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES (Extends Supabase Auth)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROLES & PERMISSIONS
-- ============================================================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default roles
INSERT INTO roles (name, description, permissions, is_default) VALUES
  ('owner', 'Full access to everything', '{"guests": ["read", "write", "delete"], "vendors": ["read", "write", "delete"], "website": ["read", "write"], "team": ["read", "write", "delete"], "payments": ["read", "write"], "settings": ["read", "write"]}'::jsonb, true),
  ('admin', 'Guest and vendor management', '{"guests": ["read", "write"], "vendors": ["read", "write"], "website": ["read"], "team": ["read"], "payments": ["read"], "settings": ["read"]}'::jsonb, true),
  ('helper', 'Content upload and updates', '{"guests": ["read"], "vendors": ["read"], "website": ["read", "write"], "team": [], "payments": [], "settings": []}'::jsonb, true);

-- ============================================================================
-- WEDDINGS
-- ============================================================================

CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date DATE,
  city TEXT,
  venue TEXT,
  description TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_published BOOLEAN DEFAULT false,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weddings_owner ON weddings(owner_id);
CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_weddings_status ON weddings(status);

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_members_wedding ON team_members(wedding_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE UNIQUE INDEX idx_team_members_wedding_email ON team_members(wedding_id, email);

-- ============================================================================
-- GUESTS
-- ============================================================================

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  side TEXT CHECK (side IN ('bride', 'groom', 'both')),
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  plus_one_allowed BOOLEAN DEFAULT false,
  invite_token TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  invite_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_guest_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT check_guest_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$')
);

CREATE INDEX idx_guests_wedding ON guests(wedding_id);
CREATE INDEX idx_guests_invite_token ON guests(invite_token);
CREATE INDEX idx_guests_tags ON guests USING gin(tags);
CREATE INDEX idx_guests_name_search ON guests USING gin(to_tsvector('english', name));

-- ============================================================================
-- CEREMONIES
-- ============================================================================

CREATE TABLE ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  address TEXT,
  city TEXT,
  map_url TEXT,
  dress_code TEXT,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_ceremony_times CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_ceremonies_wedding ON ceremonies(wedding_id);
CREATE INDEX idx_ceremonies_date ON ceremonies(date);

-- ============================================================================
-- RSVPS
-- ============================================================================

CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  ceremony_id UUID REFERENCES ceremonies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'maybe')),
  guests_count INT DEFAULT 1,
  dietary_restrictions TEXT,
  meal_preference TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rsvps_guest ON rsvps(guest_id);
CREATE INDEX idx_rsvps_ceremony ON rsvps(ceremony_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);

-- ============================================================================
-- VENDOR CATEGORIES
-- ============================================================================

CREATE TABLE vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO vendor_categories (name, slug, icon, display_order) VALUES
  ('Photographers', 'photographers', '📸', 1),
  ('Videographers', 'videographers', '🎥', 2),
  ('Caterers', 'caterers', '🍽️', 3),
  ('Decorators', 'decorators', '🎨', 4),
  ('Makeup Artists', 'makeup-artists', '💄', 5),
  ('Mehndi Artists', 'mehndi-artists', '🎨', 6),
  ('DJ & Music', 'dj-music', '🎵', 7),
  ('Venues', 'venues', '🏛️', 8),
  ('Invitation Cards', 'invitation-cards', '💌', 9),
  ('Wedding Planners', 'wedding-planners', '📋', 10);

-- ============================================================================
-- VENDORS
-- ============================================================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vendor_categories(id),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  description TEXT,
  services TEXT[],
  price_range TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  portfolio_urls TEXT[] DEFAULT '{}',
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_verified ON vendors(is_verified);
CREATE INDEX idx_vendors_name_search ON vendors USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_vendors_city_category ON vendors(city, category_id);

-- ============================================================================
-- VENDOR BOOKINGS
-- ============================================================================

CREATE TABLE vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contacted', 'negotiating', 'booked', 'completed', 'cancelled')),
  quoted_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  advance_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2),
  contract_url TEXT,
  notes TEXT,
  booked_by UUID REFERENCES auth.users(id),
  booked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_vendor_booking_amounts CHECK (final_price IS NULL OR advance_paid <= final_price)
);

CREATE INDEX idx_vendor_bookings_wedding ON vendor_bookings(wedding_id);
CREATE INDEX idx_vendor_bookings_vendor ON vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_status ON vendor_bookings(status);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_booking_id UUID REFERENCES vendor_bookings(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'installment', 'final', 'subscription')),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  transaction_id TEXT,
  receipt_url TEXT,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_payment_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payments_wedding ON payments(wedding_id);
CREATE INDEX idx_payments_booking ON payments(vendor_booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_due_reminders ON payments(due_date, status)
  WHERE status = 'pending' AND due_date IS NOT NULL;

-- ============================================================================
-- WEBSITE CONTENT
-- ============================================================================

CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'classic',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  story_title TEXT DEFAULT 'Our Story',
  story_content TEXT,
  story_images TEXT[] DEFAULT '{}',
  gallery_images TEXT[] DEFAULT '{}',
  schedule_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  hashtag TEXT,
  custom_css TEXT,
  custom_html TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_website_content_wedding ON website_content(wedding_id);

-- ============================================================================
-- LIVE UPDATES
-- ============================================================================

CREATE TABLE live_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'announcement' CHECK (type IN ('announcement', 'photo', 'video', 'milestone')),
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_updates_wedding ON live_updates(wedding_id);
CREATE INDEX idx_live_updates_published ON live_updates(published_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_wedding ON notifications(wedding_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_wedding ON subscriptions(wedding_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- INVITATION TEMPLATES
-- ============================================================================

CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  subject TEXT,
  message TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_wedding ON activity_log(wedding_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_wedding_created ON activity_log(wedding_id, created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Generate unique wedding slug
CREATE OR REPLACE FUNCTION generate_wedding_slug(
  p_bride_name TEXT,
  p_groom_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INT := 0;
BEGIN
  v_slug := lower(regexp_replace(p_bride_name || '-' || p_groom_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  WHILE EXISTS (SELECT 1 FROM weddings WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := regexp_replace(v_slug, '-[0-9]+$', '') || '-' || v_counter;
  END LOOP;

  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate unique invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  LOOP
    v_token := encode(gen_random_bytes(16), 'base64');
    v_token := replace(v_token, '/', '_');
    v_token := replace(v_token, '+', '-');
    v_token := rtrim(v_token, '=');

    EXIT WHEN NOT EXISTS (SELECT 1 FROM guests WHERE invite_token = v_token);
  END LOOP;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_wedding_id UUID,
  p_module TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM weddings w
    WHERE w.id = p_wedding_id AND w.owner_id = p_user_id

    UNION

    SELECT 1
    FROM team_members tm
    JOIN roles r ON tm.role_id = r.id
    WHERE tm.wedding_id = p_wedding_id
      AND tm.user_id = p_user_id
      AND tm.status = 'active'
      AND r.permissions->p_module ? p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ceremonies_updated_at BEFORE UPDATE ON ceremonies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_bookings_updated_at BEFORE UPDATE ON vendor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_content_updated_at BEFORE UPDATE ON website_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Vendors and categories are public read
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Weddings policies
CREATE POLICY "Users can read their weddings"
  ON weddings FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Users can create weddings"
  ON weddings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update weddings"
  ON weddings FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete weddings"
  ON weddings FOR DELETE
  USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Team can read team members"
  ON team_members FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Owners can manage team"
  ON team_members FOR ALL
  USING (wedding_id IN (SELECT id FROM weddings WHERE owner_id = auth.uid()));

-- Guests policies
CREATE POLICY "Team can read guests"
  ON guests FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT tm.wedding_id FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Authorized team can manage guests"
  ON guests FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
    )
  );

-- Ceremonies policies
CREATE POLICY "Team can read ceremonies"
  ON ceremonies FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    wedding_id IN (SELECT id FROM weddings WHERE is_published = true)
  );

CREATE POLICY "Team can manage ceremonies"
  ON ceremonies FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
    )
  );

-- RSVPs policies
CREATE POLICY "Team can read rsvps"
  ON rsvps FOR SELECT
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      WHERE g.wedding_id IN (
        SELECT id FROM weddings WHERE owner_id = auth.uid()
        UNION
        SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Anyone can submit rsvp"
  ON rsvps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rsvp"
  ON rsvps FOR UPDATE
  USING (true);

-- Vendor categories (public read)
CREATE POLICY "Anyone can read vendor categories"
  ON vendor_categories FOR SELECT
  USING (true);

-- Vendors (public read)
CREATE POLICY "Anyone can read vendors"
  ON vendors FOR SELECT
  USING (true);

-- Vendor bookings policies
CREATE POLICY "Team can read vendor bookings"
  ON vendor_bookings FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team can manage vendor bookings"
  ON vendor_bookings FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Authorized users can read payments"
  ON payments FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage payments"
  ON payments FOR ALL
  USING (wedding_id IN (SELECT id FROM weddings WHERE owner_id = auth.uid()));

-- Website content policies
CREATE POLICY "Anyone can read published content"
  ON website_content FOR SELECT
  USING (
    wedding_id IN (SELECT id FROM weddings WHERE is_published = true)
    OR
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team can manage content"
  ON website_content FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
    )
  );

-- Live updates policies
CREATE POLICY "Anyone can read updates for published weddings"
  ON live_updates FOR SELECT
  USING (
    wedding_id IN (SELECT id FROM weddings WHERE is_published = true)
    OR
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team can manage updates"
  ON live_updates FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    wedding_id IN (SELECT id FROM weddings WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  USING (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Team can read activity log"
  ON activity_log FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Wedding dashboard stats view
CREATE VIEW wedding_dashboard_stats AS
SELECT
  w.id as wedding_id,
  w.bride_name,
  w.groom_name,
  w.wedding_date,
  COUNT(DISTINCT g.id) as total_guests,
  COUNT(DISTINCT CASE WHEN r.status = 'attending' THEN g.id END) as attending_count,
  COUNT(DISTINCT CASE WHEN r.status = 'not_attending' THEN g.id END) as not_attending_count,
  COUNT(DISTINCT CASE WHEN r.status IS NULL THEN g.id END) as pending_count,
  COUNT(DISTINCT vb.id) FILTER (WHERE vb.status = 'booked') as booked_vendors,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_paid,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) as total_pending
FROM weddings w
LEFT JOIN guests g ON g.wedding_id = w.id
LEFT JOIN rsvps r ON r.guest_id = g.id
LEFT JOIN vendor_bookings vb ON vb.wedding_id = w.id
LEFT JOIN payments p ON p.wedding_id = w.id
GROUP BY w.id;

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- Migration completed successfully
