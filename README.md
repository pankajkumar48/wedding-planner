# Swift Shaadi - Indian Wedding Management Platform

A comprehensive Progressive Web App for managing Indian weddings with guest management, vendor marketplace, RSVP tracking, and custom wedding websites.

## Features

### ✅ Implemented (Core MVP)

- **Authentication System**
  - Email/password authentication
  - Magic link login
  - User profile management
  - Protected routes with middleware

- **Wedding Project Management**
  - Create and manage wedding projects
  - Multiple ceremonies support (Mehndi, Sangeet, Wedding, Reception)
  - Wedding date countdown
  - Custom wedding slug for website

- **Dashboard**
  - Overview with key statistics
  - Guest count and RSVP tracking
  - Vendor bookings overview
  - Payment tracking summary
  - Quick actions panel

- **Database & Backend**
  - Complete PostgreSQL schema with 18+ tables
  - Row Level Security (RLS) policies
  - Database functions and triggers
  - Comprehensive type safety with TypeScript

- **UI/UX**
  - Responsive mobile-first design
  - Reusable component library (Shadcn/ui)
  - Toast notifications
  - Loading states and error handling
  - Gradient-based branding

- **PWA Support**
  - Manifest configuration
  - Offline-ready architecture
  - Installable on mobile devices

### 📋 To Be Completed (See IMPLEMENTATION_GUIDE.md)

- Guest Management (CRUD, CSV import, invite sending)
- RSVP System (guest portal, ceremony-wise responses)
- Wedding Website Builder (public-facing sites with subdomain)
- Vendor Marketplace (browse, shortlist, book vendors)
- Payment Tracking (vendor payments, reminders)
- Team & Permissions (family member collaboration)
- Notification System (push notifications, email alerts)
- Razorpay Integration (subscription payments)
- Live Updates Feed (real-time wedding updates)

## Tech Stack

### Frontend
- **Framework:** Next.js 14.1 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Shadcn/ui (Radix UI)
- **State Management:** React Context + Zustand
- **Forms:** React Hook Form + Zod validation
- **PWA:** next-pwa

### Backend
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime subscriptions
- **API:** Next.js API Routes + Server Actions

### Third-Party Services
- **Payments:** Razorpay (configured, not implemented)
- **SMS/WhatsApp:** Twilio (configured, not implemented)
- **Email:** Resend (configured, not implemented)
- **Push Notifications:** Firebase Cloud Messaging (configured, not implemented)

## Project Structure

```
wedding-planner/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── guest/[token]/        # RSVP page (to implement)
│   │   └── w/[slug]/             # Wedding websites (to implement)
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Dashboard overview (✅ Complete)
│   │   ├── setup/                # Wedding setup wizard (✅ Complete)
│   │   ├── guests/               # Guest management (to implement)
│   │   ├── vendors/              # Vendor marketplace (to implement)
│   │   ├── payments/             # Payment tracking (to implement)
│   │   ├── website/              # Website builder (to implement)
│   │   ├── team/                 # Team management (to implement)
│   │   └── settings/             # Settings (to implement)
│   ├── api/                      # API routes (to implement)
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── input.tsx             # Input component
│   │   ├── label.tsx             # Label component
│   │   ├── badge.tsx             # Badge component
│   │   ├── toast.tsx             # Toast component
│   │   └── toaster.tsx           # Toast provider
│   └── dashboard/                # Dashboard-specific components
│       └── dashboard-nav.tsx     # Dashboard navigation
├── lib/                          # Library code
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts     # Generated Supabase types
│   ├── utils.ts                  # Utility functions
│   └── permissions.ts            # Permission helpers
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast hook
├── supabase/                     # Supabase configuration
│   ├── config.toml               # Supabase config
│   └── migrations/               # Database migrations
│       └── 20240101000000_initial_schema.sql
├── public/                       # Static files
│   └── manifest.json             # PWA manifest
├── middleware.ts                 # Next.js middleware
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.mjs               # Next.js config
├── .env.example                  # Environment variables template
├── ARCHITECTURE.md               # System architecture docs
├── DATABASE_SCHEMA.md            # Database schema docs
├── IMPLEMENTATION_GUIDE.md       # Implementation guide for remaining features
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**

```bash
cd wedding-planner
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

Create a new Supabase project at [https://supabase.com](https://supabase.com)

4. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. **Run database migrations**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

6. **Generate TypeScript types**

```bash
npm run db:types
```

7. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First Steps

1. Sign up for an account at `/signup`
2. Create your first wedding project at `/dashboard/setup`
3. Explore the dashboard at `/dashboard`

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:types     # Generate TypeScript types from Supabase
npm run db:push      # Push migrations to Supabase
npm run db:reset     # Reset local database
```

### Adding New Features

See `IMPLEMENTATION_GUIDE.md` for detailed patterns and code examples for implementing:

- Guest Management
- RSVP System
- Wedding Websites
- Vendor Marketplace
- Payment Tracking
- And more...

Each feature follows a consistent pattern:
1. Create page components in `app/dashboard/[feature]`
2. Use Supabase client for data operations
3. Implement UI with existing component library
4. Test with development server

## Database Schema

The complete database schema is documented in `DATABASE_SCHEMA.md`. Key tables include:

- `users` & `profiles` - User accounts
- `weddings` - Wedding projects
- `guests` - Guest lists
- `rsvps` - RSVP responses
- `ceremonies` - Wedding events
- `vendors` - Vendor directory
- `vendor_bookings` - Booked vendors
- `payments` - Payment tracking
- `website_content` - Wedding website data
- `team_members` - Family collaboration
- `notifications` - User notifications

All tables have Row Level Security (RLS) enabled for data protection.

## Architecture

The application follows a modern serverless architecture:

- **Frontend:** Next.js 14 with App Router for SSR and client-side rendering
- **Backend:** Supabase for database, auth, storage, and real-time
- **API Layer:** Next.js API routes with server-side validation
- **Authentication:** Supabase Auth with JWT tokens
- **Authorization:** RLS policies + server-side permission checks
- **File Storage:** Supabase Storage for images and documents
- **Real-time:** Supabase Realtime for live updates

See `ARCHITECTURE.md` for detailed system design.

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**

- Connect your GitHub repository to Vercel
- Configure environment variables in Vercel dashboard
- Deploy automatically on every push

3. **Configure Custom Domain**

- Add your custom domain in Vercel settings
- Set up wildcard subdomain (*.yourdomain.com) for wedding websites
- Update `NEXT_PUBLIC_SITE_URL` environment variable

### Environment Variables for Production

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=

# Optional (for full functionality)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
RESEND_API_KEY=
FCM_SERVER_KEY=
```

## Security

### Implemented

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side authentication checks
- ✅ HTTPS-only in production (via Vercel)
- ✅ Environment variable protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention (via Supabase ORM)
- ✅ CORS configuration

### To Implement

- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Content Security Policy (CSP) headers
- [ ] Regular security audits
- [ ] Data encryption at rest (Supabase Pro)

## Performance

### Implemented

- ✅ Server-side rendering (SSR)
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting (Next.js automatic)
- ✅ Lazy loading components
- ✅ Database indexing on key fields
- ✅ Connection pooling (Supabase)

### To Implement

- [ ] CDN for static assets
- [ ] Redis caching
- [ ] Service worker for offline support
- [ ] Incremental Static Regeneration (ISR)
- [ ] Bundle size optimization

## Testing

Currently, the project does not include automated tests. Recommended testing strategy:

1. **Unit Tests:** Jest + React Testing Library for components
2. **Integration Tests:** Playwright for user flows
3. **E2E Tests:** Cypress for critical paths
4. **Load Tests:** k6 for API performance

## Contributing

This is a solo MVP project. For production use:

1. Fork the repository
2. Create a feature branch
3. Implement your feature following existing patterns
4. Submit a pull request

## Roadmap

### Phase 1: MVP (Current)
- [x] Core architecture
- [x] Database schema
- [x] Authentication
- [x] Dashboard overview
- [x] Wedding setup wizard
- [ ] Guest management
- [ ] RSVP system
- [ ] Basic wedding website

### Phase 2: Enhancement
- [ ] Vendor marketplace
- [ ] Payment tracking
- [ ] Team collaboration
- [ ] Website builder with themes
- [ ] Email/SMS notifications
- [ ] Razorpay integration

### Phase 3: Scale
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics
- [ ] Vendor self-service portal
- [ ] Multi-language support
- [ ] WhatsApp Business API integration
- [ ] AI-powered recommendations

## License

This project is proprietary and confidential.

## Support

For questions or issues:
- Email: support@swiftshaadi.com
- Documentation: See `IMPLEMENTATION_GUIDE.md`

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Shadcn for the beautiful UI components
- Vercel for hosting platform

---

**Built with ❤️ for Indian weddings**
