# Swift Shaadi - Architecture Documentation

## Overview
Progressive Web App for Indian wedding management with role-based access control, guest management, vendor marketplace, and custom wedding websites.

## Tech Stack

### Frontend
- **Framework:** Next.js 14.2+ (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** Shadcn/ui
- **State Management:** React Context + Tanstack Query
- **Forms:** React Hook Form + Zod
- **PWA:** next-pwa

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime
- **API:** Next.js API Routes + Supabase Edge Functions

### Third-Party Services
- **Payments:** Razorpay
- **Notifications:** Firebase Cloud Messaging (FCM)
- **SMS/WhatsApp:** Twilio (for invites)
- **Email:** Resend

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (PWA)                      │
│  ┌────────────┬──────────────┬──────────────┬─────────────┐ │
│  │  Dashboard │  Website     │  Guest View  │  Auth       │ │
│  │  (Admin)   │  Builder     │  (Public)    │  (Public)   │ │
│  └────────────┴──────────────┴──────────────┴─────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS/WebSocket
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Application Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes                         │ │
│  │  /api/weddings  /api/guests  /api/vendors  /api/rsvp   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┬────────────────┬──────────────┐          │
│  │  Supabase    │  Supabase      │  Supabase    │          │
│  │  PostgreSQL  │  Auth          │  Storage     │          │
│  └──────────────┴────────────────┴──────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  External Services                           │
│  ┌──────────┬──────────┬──────────────┬──────────────────┐  │
│  │ Razorpay │  Twilio  │     FCM      │      Resend      │  │
│  └──────────┴──────────┴──────────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Architecture

### Core Tables
1. **users** - User accounts (via Supabase Auth)
2. **weddings** - Wedding projects
3. **team_members** - Family members with roles
4. **roles** - Permission templates
5. **guests** - Guest list
6. **rsvps** - RSVP responses
7. **ceremonies** - Multiple events per wedding
8. **vendors** - Vendor directory
9. **vendor_bookings** - Booked vendors
10. **payments** - Payment tracking
11. **website_content** - Wedding website data
12. **live_updates** - Real-time updates feed
13. **notifications** - Notification log
14. **subscriptions** - Payment plans

### Security Model
- Row Level Security (RLS) enabled on all tables
- Policies based on user roles and wedding ownership
- API routes validate permissions server-side

## Module Architecture

### 1. Authentication Module
- Email/phone login via Supabase Auth
- Magic link and OTP support
- Session management
- Role-based middleware

### 2. Wedding Project Module
- Create/edit wedding details
- Multi-ceremony support
- Settings management
- Team invitations

### 3. Guest Management Module
- Manual guest entry
- CSV import with validation
- Guest segmentation (tags)
- Bulk invite sending
- RSVP tracking dashboard

### 4. RSVP Module (Guest-facing)
- Public RSVP form
- Guest authentication via link token
- Meal preferences, plus-ones
- Status updates

### 5. Team & Permissions Module
- Invite family members
- Assign roles (admin/helper)
- Permission matrix
- Activity log

### 6. Wedding Website Builder (Paid)
- Subdomain provisioning: {couple}.swiftshaadi.com
- WYSIWYG editor
- Pre-built templates
- Photo gallery
- Schedule/timeline
- Live updates feed
- Google Maps integration

### 7. Vendor Marketplace (Paid)
- Browse by category and location
- Vendor profiles
- Shortlist management
- Booking tracking
- Payment milestones
- Reminders

### 8. Notification System
- Push notifications (FCM)
- Email notifications
- SMS for critical updates
- In-app notification center
- Configurable preferences

### 9. Payment & Subscription Module
- Free vs Paid plan
- Razorpay integration
- Subscription management
- Invoice generation

## API Structure

### REST Endpoints

```
/api/auth/*                 - Authentication
/api/weddings               - CRUD weddings
/api/weddings/[id]/team     - Team management
/api/guests                 - Guest management
/api/guests/import          - CSV import
/api/rsvp                   - RSVP submission
/api/ceremonies             - Event management
/api/vendors                - Vendor directory
/api/vendor-bookings        - Booking management
/api/payments               - Payment tracking
/api/website                - Website content
/api/website/publish        - Publish website
/api/live-updates           - Live feed updates
/api/notifications          - Notification CRUD
/api/invites/send           - Send invites
/api/subscriptions          - Plan management
/api/webhooks/razorpay      - Payment webhooks
```

### Real-time Subscriptions
- RSVP updates
- Live update feed
- Team activity
- Payment confirmations

## Routing Structure

### Dashboard Routes (Protected)
```
/dashboard                  - Overview
/dashboard/setup            - Wedding setup wizard
/dashboard/guests           - Guest management
/dashboard/guests/import    - CSV import
/dashboard/rsvp-tracker     - RSVP dashboard
/dashboard/vendors          - Vendor marketplace
/dashboard/vendor-bookings  - My bookings
/dashboard/website          - Website builder
/dashboard/team             - Team & permissions
/dashboard/notifications    - Notification center
/dashboard/settings         - Wedding settings
/dashboard/billing          - Plans & billing
```

### Public Routes
```
/                           - Landing page
/login                      - Sign in
/signup                     - Sign up
/pricing                    - Plans
/guest/[token]              - Guest RSVP form
/w/[slug]                   - Wedding website
/w/[slug]/rsvp              - RSVP page
/w/[slug]/schedule          - Schedule
/w/[slug]/gallery           - Photo gallery
/w/[slug]/updates           - Live updates
```

## Component Hierarchy

```
app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx                      - Landing
│   ├── login/
│   ├── signup/
│   ├── pricing/
│   ├── guest/[token]/
│   └── w/[slug]/                     - Wedding websites
│       ├── layout.tsx
│       ├── page.tsx
│       ├── rsvp/
│       ├── schedule/
│       ├── gallery/
│       └── updates/
├── dashboard/
│   ├── layout.tsx                    - Dashboard shell
│   ├── page.tsx                      - Overview
│   ├── setup/
│   ├── guests/
│   ├── rsvp-tracker/
│   ├── vendors/
│   ├── vendor-bookings/
│   ├── website/
│   ├── team/
│   ├── notifications/
│   ├── settings/
│   └── billing/
└── api/
    ├── auth/
    ├── weddings/
    ├── guests/
    ├── rsvp/
    ├── vendors/
    ├── payments/
    ├── website/
    └── webhooks/
```

## Security Considerations

### Authentication & Authorization
- JWT tokens via Supabase Auth
- HTTP-only cookies for session
- Role-based access control (RBAC)
- Row-level security policies
- API route middleware for permission checks

### Data Protection
- Environment variables for secrets
- CORS configuration
- Rate limiting on API routes
- Input validation with Zod
- SQL injection prevention (Supabase ORM)

### Guest Privacy
- Unique token per guest invite
- No indexable guest pages
- GDPR-compliant data handling
- Optional guest data deletion

## Performance Optimization

### Frontend
- Server-side rendering (SSR) for SEO
- Incremental Static Regeneration (ISR) for wedding websites
- Image optimization with Next/Image
- Code splitting and lazy loading
- Service worker for offline support

### Backend
- Database indexing on frequently queried fields
- Connection pooling
- Query optimization
- Caching with React Query
- CDN for static assets

## PWA Configuration

### Features
- Offline support for RSVP form
- Home screen installation
- Push notification support
- Background sync for form submissions
- App-like experience

### Manifest
```json
{
  "name": "Swift Shaadi",
  "short_name": "SwiftShaadi",
  "description": "Indian Wedding Management Platform",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#E11D48",
  "background_color": "#FFFFFF"
}
```

## Deployment Architecture

### Vercel (Frontend + API)
- Automatic deployments from GitHub
- Preview deployments for PRs
- Edge Functions for API routes
- Custom domain configuration

### Supabase (Backend)
- Production database
- Automated backups
- Connection pooling
- Built-in monitoring

### DNS Configuration
- Main domain: swiftshaadi.com
- Wildcard subdomain: *.swiftshaadi.com
- SSL certificates via Vercel

## Monitoring & Analytics

### Application Monitoring
- Vercel Analytics
- Supabase Dashboard
- Error tracking (Sentry)
- Performance metrics

### Business Metrics
- User signups
- Wedding projects created
- RSVP response rate
- Conversion to paid plans
- Vendor booking rate

## Scalability Considerations

### Current Scale (MVP)
- 1000 concurrent users
- 10,000 weddings
- 500,000 guests
- 1000 vendors

### Future Scale
- Multi-region database
- CDN for media files
- Microservices for vendor marketplace
- Queue system for bulk operations
- Elasticsearch for vendor search

## Development Workflow

### Local Development
```bash
npm run dev           # Start Next.js dev server
npm run db:types      # Generate TypeScript types from Supabase
npm run lint          # ESLint
npm run test          # Jest + React Testing Library
```

### Git Workflow
- Feature branches from main
- PR reviews required
- Automated tests on PR
- Deploy preview for each PR

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
RESEND_API_KEY=
FCM_SERVER_KEY=
```

## Migration Path

### Phase 1: MVP (Current)
- Core features only
- Manual vendor addition
- Basic website templates

### Phase 2: Enhancement
- Advanced website builder
- Vendor verification system
- Mobile apps (React Native)

### Phase 3: Scale
- Vendor self-service portal
- Payment gateway for vendor bookings
- Multi-language support
- WhatsApp Business API integration

## Conclusion

This architecture provides a solid foundation for Swift Shaadi MVP with:
- Rapid development cycle
- Built-in scalability
- Security best practices
- Cost-effective infrastructure
- Mobile-first user experience
