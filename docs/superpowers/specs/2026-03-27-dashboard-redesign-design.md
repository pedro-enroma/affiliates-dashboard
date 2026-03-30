# Dashboard Redesign — Stitch-Based Design Spec

**Date:** 2026-03-27
**Source:** Google Stitch AI-generated HTML mockup, approved by user
**Scope:** Dashboard page (`pages/index.vue`) full redesign + shared layout updates (sidebar, top bar, Tailwind theme)

---

## 1. Design System

### Colors

Replace the current blue primary palette with the Stitch emerald/green Material Design 3 token system.

Key tokens (full set in Tailwind config):

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#006c45` | Primary actions, active nav, links |
| `primary-container` | `#2dba7d` | Highlighted KPI card (Revenue), progress bars |
| `on-primary` | `#ffffff` | Text on primary backgrounds |
| `surface` / `background` | `#f8faf9` | Page background |
| `surface-container-lowest` | `#ffffff` | Cards |
| `surface-container-low` | `#f2f4f3` | Table header backgrounds, alternating rows |
| `surface-container-high` | `#e6e9e8` | Progress bar track |
| `on-surface` | `#191c1c` | Primary text |
| `on-surface-variant` | `#3d4a41` | Secondary text, labels |
| `outline-variant` | `#bccabe` | Borders (used at /10 opacity) |
| `error` | `#ba1a1a` | Negative indicators |
| `tertiary` | `#a43942` | Error-adjacent UI |
| `tertiary-container` | `#fd7d83` | Pending badge alternative |
| `secondary` | `#3a674e` | Secondary actions |
| `secondary-container` | `#b9ebcb` | Active campaign badge |
| `secondary-fixed` | `#bceece` | Badge backgrounds |

### Typography

- **Headlines:** Plus Jakarta Sans (weights: 400, 600, 700, 800)
- **Body/Labels:** Manrope (weights: 400, 500, 600, 700)
- Load via Google Fonts in `nuxt.config.ts` `app.head.link`

### Icons

- Replace emoji icons with **Material Symbols Outlined**
- Load via Google Fonts CSS link
- Icon settings: `FILL 0, wght 400, GRAD 0, opsz 24`
- Active nav items: `FILL 1`

### Border Radius

- Default: `0.25rem`
- lg: `0.5rem`
- xl: `0.75rem` (cards, inputs, buttons)
- full: `9999px` (badges)

### Shadows

- Cards: `shadow-[0px_20px_40px_rgba(25,28,28,0.03)]` (very subtle)
- Sidebar: `shadow-[20px_0_40px_rgba(25,28,28,0.03)]`
- No visible borders on cards (border-none), use shadow for depth

---

## 2. Layout Changes

### Sidebar (`components/ui/Sidebar.vue`)

Current: White background, gray border-right, emoji icons, NuxtLink nav items, user info at bottom.

New design:
- Background: `bg-emerald-50/50` with `backdrop-blur-xl`
- No border-right, use shadow: `shadow-[20px_0_40px_rgba(25,28,28,0.03)]`
- Logo area: 40x40 rounded-xl green icon with Material Symbol `explore` (filled), "NUMAtours" title in `text-emerald-900`, "AFFILIATE PORTAL" subtitle in `text-emerald-600` uppercase tracking-widest
- Nav items: Material Symbols icons (`dashboard`, `analytics`, `payments`, `campaign`, `settings`)
- Active state: white background, emerald-700 text, rounded-xl, shadow-sm
- Inactive state: zinc-500 text, hover `bg-emerald-100/30`
- Font: Plus Jakarta Sans, font-semibold, tracking-tight
- Settings link pushed to bottom with `mt-auto`
- "New Campaign" button at very bottom: full-width, `bg-primary text-on-primary`, rounded-xl, with `add` icon
- User info section stays but inherits new styling
- Mobile behavior unchanged (slide in/out with overlay)

### TopBar (`components/ui/TopBar.vue`)

Current: Sticky, white, page title + sign out button.

New design:
- Background: `bg-zinc-50/80` with `backdrop-blur-md`
- Height: `h-20` (up from h-16)
- Border bottom: `border-outline-variant/10`
- Left side: Page title (Plus Jakarta Sans, 2xl, font-bold)
- Right side (left to right):
  1. **Date range picker** — Moved from individual pages into the TopBar. Button shows calendar icon + "Last 30 days" + expand_more icon. Dropdown on hover with presets (Last 7 days, Last 30 days, This month, Last quarter). Uses existing `useDateRange` composable.
  2. **Search input** — 256px wide, Material Symbol `search` icon left, placeholder "Search campaigns...", rounded-xl, `bg-surface-container-highest`
  3. **Notifications icon** — `notifications` Material Symbol, hover turns emerald-500
  4. **Help icon** — `help` Material Symbol, hover turns emerald-500
- Sign out moves into sidebar user section or a dropdown (not visible in Stitch — keep as a menu behind the help icon or user avatar)
- Mobile menu button stays for responsive

### Default Layout (`layouts/default.vue`)

- Change `bg-gray-50` to `bg-background` (which maps to `#f8faf9`)
- TopBar fixed positioning: `fixed top-0 right-0 w-[calc(100%-16rem)]`
- Main content: `pt-32 pb-20 px-10 max-w-7xl mx-auto`

---

## 3. Dashboard Page Components

### KPI Cards (`components/dashboard/KpiCard.vue`)

Current: Simple card with label + formatted value.

New props:
```typescript
interface KpiCardProps {
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  change?: number       // percentage change vs prior period (e.g., +12, -0.4)
  progress?: number     // 0-100, drives the progress bar width
  highlight?: boolean   // true = green primary-container background (Revenue card)
}
```

Visual changes:
- Label: `text-xs font-bold tracking-wider uppercase` in `text-on-surface-variant`
- Value: `text-3xl font-extrabold`
- Change indicator: green text for positive, red (`text-error`) for negative, `text-xs font-bold`
- Progress bar: 4px (`h-1`) with rounded-full track and fill
- Highlight variant: `bg-primary-container` background, white text, white/20 progress bar track

### Traffic Over Time Chart (`components/dashboard/TrafficChart.vue`)

Current: Chart.js line chart with Sessions + Users, blue fill.

Changes:
- Card wrapper: Remove border, add subtle shadow
- Title: "Traffic Over Time" in `text-lg font-bold`, subtitle "Comparing Sessions and Users" in `text-sm text-zinc-500`
- Legend: Inline dots — green circle for Sessions, gray circle for Users
- Chart colors: Sessions line `#2dba7d` (primary-container), Users line `#d1d5db` (gray-300) dashed
- Sessions dataset: `borderColor: '#2dba7d'`, light green fill
- Users dataset: `borderColor: '#d1d5db'`, `borderDash: [6, 4]`, no fill
- Chart.js options: Hide default legend, use custom legend above

### Conversion Funnel (`components/dashboard/FunnelChart.vue`)

Current: Chart.js vertical bar chart.

**Replace Chart.js with styled HTML horizontal bars.** This matches the Stitch design and is more informative with inline percentages.

Structure per step:
```html
<div>
  <div class="flex justify-between text-xs font-bold">
    <span>{{ stepLabel }}</span>
    <span>{{ count }} ({{ percentage }}%)</span>
  </div>
  <div class="h-8 w-full bg-blue-500/10 rounded-lg overflow-hidden">
    <div class="h-full bg-blue-500 rounded-lg" :style="{ width: barWidth }"></div>
  </div>
</div>
```

- 4 steps: View Item (100%, full width), Add to Cart, Begin Checkout, Purchase
- Bar colors: gradient from `blue-500` to `blue-600` (the Stitch design uses blue for the funnel, contrasting with the green theme — keep this)
- Bar width is relative: first step is always 100%, others are proportional to their value vs first step
- Percentage is relative to View Item count

### Recent Bookings Table (`components/dashboard/RecentBookings.vue`)

Current: Simple table with Date, Tour, Price, Campaign. Only shows confirmed bookings.

Changes:
- Full-width card with shadow, no border
- Header row: `bg-surface-container-low/50`, uppercase tracking-widest labels
- Add **Status** column with colored badges:
  - Confirmed: `bg-emerald-100 text-emerald-700`
  - Pending: `bg-amber-100 text-amber-700`
  - Cancelled: `bg-red-100 text-red-700`
- Row hover: `hover:bg-primary-container/5`
- Alternating rows: every other row gets `bg-surface-container-low/30`
- Tour name: `font-semibold`
- Campaign: `text-on-surface-variant`

Data change: `fetchBookings` in `useEarnings.ts` currently filters only confirmed. Create a separate `fetchAllBookings` (or a parameter) that includes all statuses for the dashboard table display. KPI calculations still use confirmed-only.

### Performance Over Time (`components/dashboard/PerformanceChart.vue`) — NEW

Revenue line chart with gradient fill. 8/12 column width.

Props:
```typescript
interface PerformanceChartProps {
  bookings: ActivityBooking[]
}
```

Features:
- Chart.js line chart showing daily revenue
- Line color: `#006c45` (primary)
- Gradient fill under the curve (primary color fading to transparent)
- Period toggle: 30D / 90D / 1Y buttons. This overrides the global date range for this chart only — uses its own local date range.
- Tooltip on hover showing date + revenue amount
- X-axis labels: date ticks
- Card: `bg-surface-container-lowest`, shadow, no border

Computation: Aggregate `bookings` by date (`start_date_time` → YYYY-MM-DD), sum `total_price` per day.

### Top Destination (`components/dashboard/TopDestination.vue`) — NEW

Highlight card for the best-performing campaign. 4/12 column width, placed next to Performance chart.

Props:
```typescript
interface TopDestinationProps {
  campaign: AffiliateCampaign | null
  revenue: number
  conversionRate: number
  healthPercent: number
}
```

Visual:
- Background image (grayscale, 20% opacity, un-grayscales on hover)
- "Top Destination" green badge at top
- Campaign name as 2xl bold heading
- Description: "Your most profitable campaign this month with a X% conversion rate."
- Campaign Health progress bar (thin, with percentage label)
- "View Campaign Details" button (white bg, primary text)

Data: Computed in the page from bookings + traffic + campaigns data:
- Group bookings by `first_campaign`, find highest revenue campaign
- Conversion rate = bookings from that campaign / sessions from that campaign * 100
- Health = `(bookings from campaign / sessions from campaign) * 100`, capped at 100. This is effectively the conversion rate scaled for the progress bar. If the campaign has 0 sessions, health = 0.

For the background image: Use a static placeholder travel image stored at `public/images/destination-placeholder.jpg`. We will include a royalty-free travel photo. If the file doesn't exist, the card renders without the image (just a solid `bg-surface-container-low` background).

### Top Performing Campaigns (`components/dashboard/TopCampaigns.vue`) — NEW

Full-width table at the bottom of the dashboard.

Props:
```typescript
interface CampaignPerformance {
  campaign: AffiliateCampaign
  trafficSource: string    // derived from campaign name or type
  clickThrough: number     // sessions for this campaign / total sessions * 100
  revenue: number          // sum of bookings for this campaign
  status: 'Active' | 'Pending'  // from campaign.is_active
}
```

Features:
- Header with title "Top Performing Campaigns" + "Export Report" button (download icon)
- Campaign name column: includes a Material Symbol icon based on campaign type (sailing for coastal, wine_bar for wine, hiking for adventure — or a generic `campaign` icon)
- Traffic Source: campaign name or "Organic Search" / "Direct Traffic" etc.
- Click-Through: percentage
- Revenue: EUR formatted
- Status: colored badge (Active = green `bg-secondary-fixed`, Pending = pink `bg-tertiary-fixed`)
- "Load More Campaigns" button at bottom

Export: Generate a CSV of the campaigns table data and trigger download.

Data: Join `campaigns` with aggregated bookings (by `first_campaign` matching `campaign_slug`) and traffic data (by `campaign` field in `affiliate_daily_traffic`).

### Campaign Search (in TopBar)

Simple client-side search. The TopBar stores the query in a `useState<string>('campaignSearch', () => '')` composable. The Top Performing Campaigns table filters its rows by matching `campaign_name` against the query (case-insensitive `includes`). Other components ignore it. The search input debounces at 300ms.

### Notifications & Help (in TopBar)

UI-only icons for now. Clicking notifications shows an empty dropdown with "No new notifications". Help links to an external URL or shows a simple tooltip. No backend needed.

---

## 4. New Composable: `useDashboardStats`

**File:** `composables/useDashboardStats.ts`

```typescript
export function useDashboardStats() {
  // Compute previous period range for KPI change indicators
  function getPreviousPeriod(range: DateRange): DateRange { ... }

  // Compute % change between two values
  function percentChange(current: number, previous: number): number { ... }

  // Aggregate bookings by campaign, return sorted by revenue
  function getTopCampaigns(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[]
  ): CampaignPerformance[] { ... }

  // Find the single best campaign
  function getTopDestination(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[]
  ): { campaign, revenue, conversionRate, healthPercent } | null { ... }

  return { getPreviousPeriod, percentChange, getTopCampaigns, getTopDestination }
}
```

### Data flow for KPI change indicators

When the date range changes:
1. Compute previous period (e.g., if current = last 30 days, previous = 30 days before that)
2. Fetch traffic + bookings for both periods in parallel
3. Compare totals to get % change per KPI

This adds one extra Supabase query per data load (the previous period). The queries are parallel so latency impact is minimal.

---

## 5. Modified Composable: `useEarnings`

Add a `fetchAllBookings(range: DateRange)` function that does not filter by status. Used by the Recent Bookings table to show Confirmed/Pending/Cancelled. The existing `fetchBookings` stays unchanged for KPI calculations.

---

## 6. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `tailwind.config.ts` | Modify | Replace blue palette with MD3 emerald tokens, add font families, update border-radius |
| `nuxt.config.ts` | Modify | Add Google Fonts links (Plus Jakarta Sans, Manrope, Material Symbols) |
| `layouts/default.vue` | Modify | Update background, adjust content padding for fixed TopBar |
| `components/ui/Sidebar.vue` | Modify | Full redesign: emerald theme, Material icons, New Campaign button |
| `components/ui/TopBar.vue` | Modify | Add date picker, search, notifications, help |
| `components/ui/DateRangePicker.vue` | Modify | Restyle to match Stitch (rounded-xl, outline-variant border) |
| `components/dashboard/KpiCard.vue` | Modify | Add change indicator, progress bar, highlight variant |
| `components/dashboard/TrafficChart.vue` | Modify | Restyle colors to emerald, custom legend |
| `components/dashboard/FunnelChart.vue` | Modify | Replace Chart.js with HTML horizontal bars |
| `components/dashboard/RecentBookings.vue` | Modify | Add status badges, restyle table |
| `components/dashboard/PerformanceChart.vue` | Create | Revenue line chart with gradient, period toggle |
| `components/dashboard/TopDestination.vue` | Create | Top campaign highlight card |
| `components/dashboard/TopCampaigns.vue` | Create | Campaigns performance table with export |
| `composables/useDashboardStats.ts` | Create | Period comparison, top campaigns logic |
| `composables/useEarnings.ts` | Modify | Add fetchAllBookings for unfiltered bookings |
| `pages/index.vue` | Modify | Wire up all new/updated components |

---

## 7. Out of Scope

- Other pages (traffic, earnings, campaigns, settings) — these keep their current design for now
- Backend/Supabase schema changes — all data is available in existing tables
- Authentication changes
- Mobile-specific redesign (responsive behavior stays the same pattern, just restyled)
- Dark mode (the Stitch design is light mode; dark mode tokens are defined but not activated)
