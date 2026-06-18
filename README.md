# Ascend Distributions

**Music distribution platform by Ascend Systems LLC**

Upload once. Release everywhere. Keep more of your royalties.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe (Subscriptions)
- **Email:** Resend
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project
- Stripe account
- Resend account (verified domain)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Set up Supabase

Run the migrations in your Supabase SQL editor (in order):

1. `supabase/migrations/001_initial_schema.sql` — tables, RLS, triggers
2. `supabase/migrations/002_storage_policies.sql` — storage buckets and policies

Enable Email Auth in Supabase Dashboard → Authentication → Providers.

Configure custom SMTP in Supabase → Authentication → SMTP Settings (recommended for signup emails):

| Setting | Value |
|---------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key |
| Sender email | Same as `RESEND_FROM_EMAIL` |

Then raise email rate limits under Authentication → Rate Limits.

### 4. Set up Stripe

Create products and prices in Stripe Dashboard:

| Plan | Monthly | Yearly |
|------|---------|--------|
| Standard | $5/mo | $20/yr |
| Pro | $10/mo | $70/yr |

Add the price IDs to `.env.local`. Set up a webhook endpoint pointing to:

```
https://your-domain.com/api/stripe/webhook
```

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Marketing pages
│   ├── (auth)/            # Login, register, verify
│   ├── (dashboard)/       # Artist dashboard
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Navbar, sidebar, footer
│   ├── marketing/         # Landing page sections
│   ├── dashboard/         # Dashboard widgets
│   ├── admin/             # Admin components
│   └── community/         # Community feed
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── stripe/            # Stripe config
│   ├── email/             # Resend templates
│   ├── api.ts             # API helpers
│   ├── constants.ts       # App constants
│   ├── utils.ts           # Utilities
│   └── validations.ts     # Zod schemas
└── types/                 # TypeScript types
supabase/
└── migrations/            # Database migrations
```

## Features

### Public Website
- Home, Pricing, Features, FAQ, Contact pages
- Dark glassmorphism theme with purple/blue gradients

### Authentication
- Supabase Auth with email verification
- Roles: Artist, Label, Admin
- Forgot password flow

### Artist Dashboard
- Overview with streams, revenue, growth metrics
- Music upload (WAV, FLAC, MP3 + 3000x3000 artwork)
- Release management (Draft → Pending → Approved → Live)
- Analytics with charts and filters
- Royalty tracking with CSV export
- Payout requests (PayPal, Bank Transfer)

### Subscriptions
- Free (80/20), Standard ($5/mo, 90/10), Pro ($10/mo, 100%)
- Stripe Checkout and Billing Portal
- Webhook-driven subscription sync

### Community
- Artist profiles with follow system
- Posts, comments, likes
- Notifications

### Admin Panel
- User management
- Release approval/rejection workflow
- Revenue and subscription overview
- Payout processing

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Add all environment variables from `.env.example` in the Vercel dashboard.

## License

Proprietary — Ascend Systems LLC. All rights reserved.
