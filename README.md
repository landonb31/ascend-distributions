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
3. `supabase/migrations/003_distribution.sql` — store delivery jobs and platform tracking

Or run the combined `supabase/setup-all.sql` (includes all three).

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

Add your Stripe keys to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is required for the embedded payment form on `/dashboard/subscribe`.

Then create the subscription products and prices automatically:

```bash
npm run setup:stripe
```

This creates:

| Plan | Monthly | Yearly |
|------|---------|--------|
| Standard | $5/mo | $20/yr |
| Pro | $10/mo | $70/yr |

The script writes the generated price IDs into `.env.local`.

Set up a webhook endpoint pointing to:

```
https://ascenddistributions.com/api/stripe/webhook
```

Events to listen for:
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Enable the Stripe Customer Portal in Stripe Dashboard → Settings → Billing → Customer portal.

Checkout is embedded on-site at `/dashboard/subscribe` using Stripe Payment Element (no redirect to Stripe Checkout).

For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 6. Set up distribution (store delivery)

Ascend delivers music to Spotify, Apple Music, and other DSPs through **FUGA** (industry B2B distribution API). You need a FUGA distributor account with API access:

1. Contact [FUGA](https://fuga.com) for white-label / API access
2. Add credentials to `.env.local`:

```bash
FUGA_API_URL=https://next.fugamusic.com/api/v2
FUGA_USERNAME=your-fuga-user
FUGA_PASSWORD=your-fuga-password
FUGA_LABEL_ID=your-label-id
FUGA_DELIVERY_DSPS=spotify-dsp-id,apple-dsp-id
CRON_SECRET=random-secret-for-cron
```

3. Configure FUGA webhooks to `https://ascenddistributions.com/api/distribution/webhook`
4. Set `CRON_SECRET` in Vercel (cron runs every 15 minutes for scheduled releases)

**Release flow:** Upload → Release to stores → Automatic delivery to Spotify, Apple Music, etc.

### 7. Run locally

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
