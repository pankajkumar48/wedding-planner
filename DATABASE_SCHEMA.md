# Swift Shaadi - Database Schema

## Entity Relationship Diagram

```
users (Supabase Auth)
  ├──< weddings (1:many)
  ├──< team_members (1:many)
  └──< notifications (1:many)

weddings
  ├──< team_members (1:many)
  ├──< guests (1:many)
  ├──< ceremonies (1:many)
  ├──< vendor_bookings (1:many)
  ├──< payments (1:many)
  ├──< live_updates (1:many)
  ├──< website_content (1:1)
  └──< subscriptions (1:many)

guests
  └──< rsvps (1:many)

vendors
  └──< vendor_bookings (1:many)

team_members
  └─> roles (many:1)
```

## Tables

### 1. users (Supabase Auth - Extended)
Managed by Supabase Auth. Extended with custom profile table.

```sql
-- Supabase handles this table, but we extend it with:
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. weddings
Core wedding project table.

```sql
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
  slug TEXT UNIQUE, -- for wedding website URL
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_published BOOLEAN DEFAULT false,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weddings_owner ON weddings(owner_id);
CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_weddings_status ON weddings(status);
```

### 3. roles
Permission templates for team members.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}', -- {"guests": ["read", "write"], "vendors": ["read"]}
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default roles
INSERT INTO roles (name, description, permissions, is_default) VALUES
  ('owner', 'Full access to everything', '{"guests": ["read", "write", "delete"], "vendors": ["read", "write", "delete"], "website": ["read", "write"], "team": ["read", "write", "delete"], "payments": ["read", "write"], "settings": ["read", "write"]}', true),
  ('admin', 'Guest and vendor management', '{"guests": ["read", "write"], "vendors": ["read", "write"], "website": ["read"], "team": ["read"], "payments": ["read"], "settings": ["read"]}', true),
  ('helper', 'Content upload and updates', '{"guests": ["read"], "vendors": ["read"], "website": ["read", "write"], "team": [], "payments": [], "settings": []}', true);
```

### 4. team_members
Family members and helpers for a wedding.

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- for invitation before they sign up
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
```

### 5. guests
Guest list for each wedding.

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  side TEXT CHECK (side IN ('bride', 'groom', 'both')),
  tags TEXT[] DEFAULT '{}', -- ['family', 'friends', 'colleagues']
  category TEXT, -- 'VIP', 'Family', 'Friends', etc.
  plus_one_allowed BOOLEAN DEFAULT false,
  invite_token TEXT UNIQUE, -- unique token for RSVP link
  invite_sent_at TIMESTAMPTZ,
  invite_method TEXT, -- 'email', 'sms', 'whatsapp'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_wedding ON guests(wedding_id);
CREATE INDEX idx_guests_invite_token ON guests(invite_token);
CREATE INDEX idx_guests_tags ON guests USING gin(tags);
```

### 6. ceremonies
Multiple events for a wedding (mehndi, sangeet, wedding, reception).

```sql
CREATE TABLE ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Mehndi', 'Sangeet', 'Wedding', 'Reception'
  type TEXT, -- 'pre_wedding', 'main', 'post_wedding'
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ceremonies_wedding ON ceremonies(wedding_id);
CREATE INDEX idx_ceremonies_date ON ceremonies(date);
```

### 7. rsvps
RSVP responses from guests.

```sql
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  ceremony_id UUID REFERENCES ceremonies(id) ON DELETE CASCADE, -- if RSVP is per ceremony
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'maybe')),
  guests_count INT DEFAULT 1, -- including plus-ones
  dietary_restrictions TEXT,
  meal_preference TEXT, -- 'veg', 'non-veg', 'vegan', 'jain'
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rsvps_guest ON rsvps(guest_id);
CREATE INDEX idx_rsvps_ceremony ON rsvps(ceremony_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);
```

### 8. vendor_categories
Categories for vendor marketplace.

```sql
CREATE TABLE vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- icon name or emoji
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
```

### 9. vendors
Vendor directory.

```sql
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
  price_range TEXT, -- '₹₹₹', '₹₹₹₹', '₹₹₹₹₹'
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
```

### 10. vendor_bookings
Shortlisted and booked vendors.

```sql
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_bookings_wedding ON vendor_bookings(wedding_id);
CREATE INDEX idx_vendor_bookings_vendor ON vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_status ON vendor_bookings(status);
```

### 11. payments
Payment tracking for vendors.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_booking_id UUID REFERENCES vendor_bookings(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'installment', 'final', 'subscription')),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT, -- 'cash', 'upi', 'card', 'bank_transfer'
  transaction_id TEXT,
  receipt_url TEXT,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_wedding ON payments(wedding_id);
CREATE INDEX idx_payments_booking ON payments(vendor_booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
```

### 12. website_content
Content for the wedding website.

```sql
CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'classic', -- 'classic', 'modern', 'traditional'
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
```

### 13. live_updates
Real-time updates feed for wedding website.

```sql
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
```

### 14. notifications
Notification log.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'rsvp_received', 'payment_due', 'team_invite', etc.
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
```

### 15. subscriptions
Payment plans and subscriptions.

```sql
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
```

### 16. invitation_templates
Pre-built invitation message templates.

```sql
CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en', -- 'en', 'hi', 'ta', 'te', etc.
  subject TEXT,
  message TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}', -- ['bride_name', 'groom_name', 'wedding_date', 'venue', 'rsvp_link']
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 17. activity_log
Audit trail for important actions.

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'guest_added', 'invite_sent', 'rsvp_received', etc.
  entity_type TEXT, -- 'guest', 'vendor', 'payment', etc.
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_wedding ON activity_log(wedding_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

## Row Level Security (RLS) Policies

### profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### weddings
```sql
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Users can read weddings they own or are team members of
CREATE POLICY "Users can read their weddings"
  ON weddings FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Users can create their own weddings
CREATE POLICY "Users can create weddings"
  ON weddings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Only owners can update their weddings
CREATE POLICY "Owners can update weddings"
  ON weddings FOR UPDATE
  USING (owner_id = auth.uid());

-- Only owners can delete their weddings
CREATE POLICY "Owners can delete weddings"
  ON weddings FOR DELETE
  USING (owner_id = auth.uid());
```

### team_members
```sql
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team members can read their wedding's team
CREATE POLICY "Team can read team members"
  ON team_members FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Only owners can manage team members
CREATE POLICY "Owners can manage team"
  ON team_members FOR ALL
  USING (wedding_id IN (SELECT id FROM weddings WHERE owner_id = auth.uid()));
```

### guests
```sql
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Team members with guest permissions can read guests
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
        AND r.permissions->>'guests' ? 'read'
    )
  );

-- Team members with write permissions can insert/update guests
CREATE POLICY "Team can manage guests"
  ON guests FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT tm.wedding_id FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.permissions->>'guests' ? 'write'
    )
  );
```

### rsvps
```sql
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Team members can read RSVPs
CREATE POLICY "Team can read rsvps"
  ON rsvps FOR SELECT
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN weddings w ON g.wedding_id = w.id
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT g.id FROM guests g
      JOIN team_members tm ON g.wedding_id = tm.wedding_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Public can insert RSVPs (validated by invite token in app logic)
CREATE POLICY "Anyone can submit rsvp"
  ON rsvps FOR INSERT
  WITH CHECK (true);

-- Public can update their own RSVPs (validated by invite token in app logic)
CREATE POLICY "Anyone can update rsvp"
  ON rsvps FOR UPDATE
  USING (true);
```

### vendor_bookings
```sql
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;

-- Team members can read vendor bookings
CREATE POLICY "Team can read vendor bookings"
  ON vendor_bookings FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Team members with vendor permissions can manage bookings
CREATE POLICY "Team can manage vendor bookings"
  ON vendor_bookings FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT tm.wedding_id FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.permissions->>'vendors' ? 'write'
    )
  );
```

### payments
```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Only owners and admins with payment permissions can see payments
CREATE POLICY "Authorized users can read payments"
  ON payments FOR SELECT
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT tm.wedding_id FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.permissions->>'payments' ? 'read'
    )
  );

-- Only owners can manage payments
CREATE POLICY "Owners can manage payments"
  ON payments FOR ALL
  USING (wedding_id IN (SELECT id FROM weddings WHERE owner_id = auth.uid()));
```

### vendors (public read)
```sql
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Anyone can read vendors
CREATE POLICY "Anyone can read vendors"
  ON vendors FOR SELECT
  USING (true);
```

### website_content
```sql
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Public can read published wedding content
CREATE POLICY "Anyone can read published content"
  ON website_content FOR SELECT
  USING (
    wedding_id IN (SELECT id FROM weddings WHERE is_published = true)
  );

-- Team members can read/edit their wedding content
CREATE POLICY "Team can manage content"
  ON website_content FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT tm.wedding_id FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.permissions->>'website' ? 'write'
    )
  );
```

### live_updates
```sql
ALTER TABLE live_updates ENABLE ROW LEVEL SECURITY;

-- Public can read updates for published weddings
CREATE POLICY "Anyone can read updates for published weddings"
  ON live_updates FOR SELECT
  USING (
    wedding_id IN (SELECT id FROM weddings WHERE is_published = true)
  );

-- Team can manage updates
CREATE POLICY "Team can manage updates"
  ON live_updates FOR ALL
  USING (
    wedding_id IN (
      SELECT id FROM weddings WHERE owner_id = auth.uid()
      UNION
      SELECT wedding_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );
```

## Database Functions

### Function: Check if user has permission
```sql
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
      AND r.permissions->>p_module ? p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Function: Generate unique wedding slug
```sql
CREATE OR REPLACE FUNCTION generate_wedding_slug(
  p_bride_name TEXT,
  p_groom_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INT := 0;
BEGIN
  -- Create base slug from names
  v_slug := lower(regexp_replace(p_bride_name || '-' || p_groom_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  -- Check if slug exists, append counter if needed
  WHILE EXISTS (SELECT 1 FROM weddings WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := v_slug || '-' || v_counter;
  END LOOP;

  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;
```

### Function: Generate unique invite token
```sql
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  LOOP
    v_token := encode(gen_random_bytes(16), 'base64');
    v_token := replace(v_token, '/', '_');
    v_token := replace(v_token, '+', '-');

    EXIT WHEN NOT EXISTS (SELECT 1 FROM guests WHERE invite_token = v_token);
  END LOOP;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql;
```

### Function: Update RSVP counts
```sql
CREATE OR REPLACE FUNCTION update_rsvp_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- This could update a cached stats table if needed
  -- For now, we'll compute on demand
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rsvp_stats
AFTER INSERT OR UPDATE OR DELETE ON rsvps
FOR EACH ROW EXECUTE FUNCTION update_rsvp_stats();
```

### Function: Set updated_at timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
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
```

## Indexes for Performance

```sql
-- Additional indexes for common queries

-- Guest search
CREATE INDEX idx_guests_name_search ON guests USING gin(to_tsvector('english', name));
CREATE INDEX idx_guests_email_search ON guests(email) WHERE email IS NOT NULL;

-- Vendor search
CREATE INDEX idx_vendors_name_search ON vendors USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_vendors_city_category ON vendors(city, category_id);

-- Payment reminders
CREATE INDEX idx_payments_due_reminders ON payments(due_date, status)
  WHERE status = 'pending' AND due_date IS NOT NULL;

-- Activity timeline
CREATE INDEX idx_activity_log_wedding_created ON activity_log(wedding_id, created_at DESC);
```

## Views for Common Queries

### Wedding Dashboard Stats
```sql
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
```

### Guest RSVP Summary
```sql
CREATE VIEW guest_rsvp_summary AS
SELECT
  g.id as guest_id,
  g.wedding_id,
  g.name,
  g.email,
  g.phone,
  g.side,
  g.tags,
  g.invite_sent_at,
  COALESCE(
    json_agg(
      json_build_object(
        'ceremony_id', c.id,
        'ceremony_name', c.name,
        'status', r.status,
        'guests_count', r.guests_count,
        'meal_preference', r.meal_preference
      )
    ) FILTER (WHERE r.id IS NOT NULL),
    '[]'
  ) as rsvps
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id
LEFT JOIN ceremonies c ON r.ceremony_id = c.id
GROUP BY g.id;
```

## Data Validation Constraints

```sql
-- Ensure wedding date is in the future (for active weddings)
ALTER TABLE weddings ADD CONSTRAINT check_wedding_date_future
  CHECK (status != 'active' OR wedding_date >= CURRENT_DATE);

-- Ensure payment amount is positive
ALTER TABLE payments ADD CONSTRAINT check_payment_amount_positive
  CHECK (amount > 0);

-- Ensure final price >= advance paid
ALTER TABLE vendor_bookings ADD CONSTRAINT check_vendor_booking_amounts
  CHECK (final_price IS NULL OR advance_paid <= final_price);

-- Ensure end time is after start time
ALTER TABLE ceremonies ADD CONSTRAINT check_ceremony_times
  CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time);

-- Ensure valid email format
ALTER TABLE guests ADD CONSTRAINT check_guest_email_format
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Ensure valid phone format (Indian)
ALTER TABLE guests ADD CONSTRAINT check_guest_phone_format
  CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$');
```

## Useful Queries

### Get wedding team with permissions
```sql
SELECT
  tm.id,
  tm.email,
  p.full_name,
  r.name as role_name,
  r.permissions,
  tm.status
FROM team_members tm
LEFT JOIN profiles p ON tm.user_id = p.id
JOIN roles r ON tm.role_id = r.id
WHERE tm.wedding_id = '<wedding_id>'
ORDER BY tm.created_at;
```

### Get RSVP statistics by ceremony
```sql
SELECT
  c.name as ceremony_name,
  COUNT(r.id) as total_responses,
  COUNT(*) FILTER (WHERE r.status = 'attending') as attending,
  COUNT(*) FILTER (WHERE r.status = 'not_attending') as not_attending,
  COUNT(*) FILTER (WHERE r.status = 'maybe') as maybe,
  SUM(r.guests_count) FILTER (WHERE r.status = 'attending') as total_attendees
FROM ceremonies c
LEFT JOIN rsvps r ON r.ceremony_id = c.id
WHERE c.wedding_id = '<wedding_id>'
GROUP BY c.id, c.name
ORDER BY c.display_order;
```

### Get pending payments with vendor details
```sql
SELECT
  p.id,
  p.amount,
  p.due_date,
  p.payment_type,
  v.name as vendor_name,
  vc.name as vendor_category
FROM payments p
JOIN vendor_bookings vb ON p.vendor_booking_id = vb.id
JOIN vendors v ON vb.vendor_id = v.id
JOIN vendor_categories vc ON v.category_id = vc.id
WHERE p.wedding_id = '<wedding_id>'
  AND p.status = 'pending'
ORDER BY p.due_date ASC;
```

## Migration Order

1. Create extensions
2. Create profiles table
3. Create roles table (with seed data)
4. Create weddings table
5. Create team_members table
6. Create guests table
7. Create ceremonies table
8. Create rsvps table
9. Create vendor_categories table (with seed data)
10. Create vendors table
11. Create vendor_bookings table
12. Create payments table
13. Create website_content table
14. Create live_updates table
15. Create notifications table
16. Create subscriptions table
17. Create invitation_templates table
18. Create activity_log table
19. Create functions
20. Create triggers
21. Create indexes
22. Create views
23. Enable RLS and create policies

This schema provides a solid foundation for the Swift Shaadi MVP with proper relationships, security, and performance optimizations.
