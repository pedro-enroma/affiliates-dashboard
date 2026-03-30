# NUMAtours Affiliate Dashboard

Nuxt 3 dashboard where affiliates view traffic analytics, booking conversions, commission earnings, and create promotional links.

## Stack

- **Nuxt 3** — Vue 3 SSR/SPA framework
- **Supabase** — Auth (email/password) + Postgres (via RLS)
- **Tailwind CSS** — Styling
- **Chart.js** + **vue-chartjs** — Data visualizations

## Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server (http://localhost:3000)
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://ydnvqephejbcvlfzjzej.supabase.co` |
| `SUPABASE_KEY` | Publishable anon key (NOT service role) | `eyJhbGciOi...` |
| `BASE_URL` | Base URL for generating campaign links | `https://enroma.com` |

## Project Structure

```
pages/
  login.vue              # Email + password sign in
  forgot-password.vue    # Request password reset
  reset-password.vue     # Set new password from reset link
  confirm.vue            # Supabase auth callback
  index.vue              # Dashboard: KPIs, traffic chart, funnel, recent bookings
  traffic.vue            # Detailed traffic + demographics
  earnings.vue           # Commission table, monthly totals, booking list
  campaigns/
    index.vue            # List campaigns, copy affiliate links
    create.vue           # Create new link/widget/banner
  settings.vue           # Profile edit, password change, account info

layouts/
  auth.vue               # Minimal centered card (login pages)
  default.vue            # Sidebar + topbar (dashboard pages)

composables/
  useAffiliate.ts        # Profile, commission rate
  useTraffic.ts          # GA4 traffic data queries
  useEarnings.ts         # Booking data, commission calculations
  useCampaigns.ts        # Campaign CRUD + link generation
  useDateRange.ts        # Shared date range state

components/
  charts/                # LineChart, BarChart, DoughnutChart (Chart.js wrappers)
  dashboard/             # KpiCard, TrafficChart, FunnelChart, RecentBookings
  ui/                    # Sidebar, TopBar, DateRangePicker
```

## How It Works

### Authentication
- `@nuxtjs/supabase` manages session via cookies
- `middleware/auth.ts` redirects unauthenticated users to `/login`
- Login uses `signInWithPassword` (no social providers)
- Password reset sends a Supabase magic link to `/reset-password`

### Data Access
- All data fetched client-side via Supabase JS client (publishable key + user JWT)
- Row Level Security (RLS) policies filter data automatically:
  - `get_my_affiliate_id()` resolves `auth.uid()` → `affiliate_id`
  - Each affiliate only sees their own traffic, bookings, campaigns
- No custom backend API needed for reads

### Data Sources

| Page | Tables Queried |
|------|---------------|
| Dashboard | `affiliate_daily_traffic`, `affiliate_daily_events`, `activity_bookings` |
| Traffic | `affiliate_daily_traffic`, `affiliate_traffic_demographics` |
| Earnings | `activity_bookings`, `affiliate_commissions` |
| Campaigns | `affiliate_campaigns` |
| Settings | `affiliates`, `affiliate_commissions` |

### Campaign Links
When an affiliate creates a campaign, the app generates a tracking URL:
```
https://enroma.com/tours/xxx?affiliate_id=blogger-x&first_campaign_id=summer-post
```
GTM captures both parameters on page load and propagates them through the entire session.

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Vercel Deployment
1. Push to GitHub
2. Connect repo on Vercel, framework preset: **Nuxt**
3. Set env vars: `SUPABASE_URL`, `SUPABASE_KEY`, `BASE_URL`
4. Custom domain: `affiliates.numatours.com`
5. Add redirect URL in Supabase Dashboard → Auth → URL Configuration:
   - `https://affiliates.numatours.com`
   - `https://affiliates.numatours.com/confirm`

## Backend Dependency

Traffic data (sessions, page views, demographics, funnel events) is synced from GA4 by a cron job in the `booking-webhook-system` Railway service. See `booking-webhook-system/docs/AFFILIATE_DASHBOARD.md` for full details on:
- GA4 Data API sync service
- Cron job schedules
- Backfill procedure
- Admin account creation script
