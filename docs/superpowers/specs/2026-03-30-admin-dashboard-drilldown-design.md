# Admin Dashboard + Affiliate Drill-Down — Design Spec

**Date:** 2026-03-30
**Scope:** Sub-project 2. Admin dashboard with aggregated KPIs across all affiliates, affiliate comparison table, and drill-down into individual affiliate dashboards.

---

## 1. Admin Dashboard (`pages/admin/index.vue`)

### Top Section: Aggregated KPIs

Same 5 KPI cards as the affiliate dashboard:
- Sessions, Bookings, Revenue (EUR), Commission (EUR), Conversion Rate
- Revenue card highlighted with `highlight` prop
- Change indicators comparing current period vs previous period
- Progress bars

Data fetched **without** `affiliateId` filter — admin RLS policies return all rows. KPIs are computed the same way as the affiliate dashboard (`aggregateTraffic`, sum bookings, etc.) but across all affiliates.

Uses existing composables: `useTraffic`, `useEarnings`, `useDashboardStats`, `useDateRange`.

Commission calculation note: since each affiliate may have a different commission rate, the admin dashboard uses a flat calculation from the bookings data. For the aggregated view, we sum `total_price * (affiliate's commission_percentage / 100)` per booking. This requires fetching commission rates for all affiliates. To keep it simple, the admin KPI shows total revenue only (no commission card) — commission is per-affiliate and only meaningful in drill-down. Replace the Commission KPI with **Total Affiliates** count instead.

Updated admin KPIs:
- Sessions
- Bookings
- Revenue (EUR) — highlighted
- Affiliates (total active count)
- Conversion Rate

### Bottom Section: Affiliate Comparison Table

Full-width table listing all affiliates. Columns:

| Column | Data Source | Sortable |
|--------|-----------|----------|
| Affiliate Name | `affiliates.display_name` | Yes |
| Affiliate ID | `affiliates.affiliate_id` | Yes |
| Sessions | Sum of `affiliate_daily_traffic.sessions` for this affiliate | Yes |
| Bookings | Count of `activity_bookings` for this affiliate | Yes |
| Revenue (EUR) | Sum of `activity_bookings.total_price` for this affiliate | Yes |
| Status | `affiliates.is_active` → Active/Inactive badge | Yes |

Default sort: Revenue descending.

Click header to toggle sort (asc/desc). Each row is clickable — navigates to `/admin/affiliates/[affiliate_id]`.

Styled to match the Stitch design system: same card wrapper, table headers, row hover, status badges as the existing `RecentBookings` and `TopCampaigns` components.

### Data Flow

When date range changes:
1. Fetch all traffic data (no `affiliateId` filter) → aggregate for KPIs
2. Fetch all events (no filter) → for KPI conversion funnel if needed
3. Fetch all bookings from bookings client (no filter) → for KPIs + per-affiliate breakdown
4. Fetch all affiliates from primary client → for the table
5. Fetch previous period traffic + bookings → for change indicators

Per-affiliate metrics for the table are computed client-side by grouping the fetched data by `affiliate_id`.

---

## 2. Affiliate Drill-Down (`pages/admin/affiliates/[id].vue`)

Dynamic route where `[id]` is the `affiliate_id` string (not the UUID).

### Layout

Uses the `admin` layout (admin sidebar stays visible).

Top of page:
- "Back to Affiliates" link (← icon + text, navigates to `/admin/affiliates`)
- Affiliate name as page heading
- Affiliate ID shown as subtext

### Content

Reuses ALL existing dashboard components with the specific `affiliate_id` passed to every data fetch:

- `DashboardKpiCard` × 5 (Sessions, Bookings, Revenue, Commission, Conversion Rate) — commission works here because it's a single affiliate
- `DashboardTrafficChart`
- `DashboardFunnelChart`
- `DashboardRecentBookings`
- `DashboardPerformanceChart`
- `DashboardTopDestination`
- `DashboardTopCampaigns`

### Data Flow

1. Extract `affiliate_id` from route params
2. Fetch the affiliate profile from `affiliates` table by `affiliate_id`
3. Fetch the affiliate's commission rate from `affiliate_commissions` table
4. Pass `affiliate_id` to all fetch functions: `fetchDailyTraffic(range, affiliateId)`, `fetchDailyEvents(range, affiliateId)`, `fetchBookings(range, affiliateId)`, etc.
5. Compute KPIs, changes, progress — same logic as `pages/index.vue`

The commission rate for calculating the Commission KPI comes from the fetched `affiliate_commissions` row, not from `useAffiliate()` (which returns the current user's commission, but the admin is viewing someone else's data).

---

## 3. New Composable: `useAdminData`

**File:** `composables/useAdminData.ts`

```typescript
export function useAdminData() {
  const client = useSupabaseClient()

  // Fetch all affiliates
  async function fetchAllAffiliates(): Promise<Affiliate[]> { ... }

  // Fetch commission rate for a specific affiliate
  async function fetchAffiliateCommission(affiliateId: string): Promise<number> { ... }

  // Group traffic data by affiliate_id, return per-affiliate session totals
  function groupTrafficByAffiliate(traffic: DailyTraffic[]): Map<string, number> { ... }

  // Group bookings by affiliate_id, return per-affiliate count + revenue
  function groupBookingsByAffiliate(bookings: ActivityBooking[]): Map<string, { count: number; revenue: number }> { ... }

  return { fetchAllAffiliates, fetchAffiliateCommission, groupTrafficByAffiliate, groupBookingsByAffiliate }
}
```

---

## 4. New Component: `DashboardAffiliateTable`

**File:** `components/dashboard/AffiliateTable.vue`

Props:
```typescript
interface AffiliateRow {
  affiliate: Affiliate
  sessions: number
  bookings: number
  revenue: number
}

defineProps<{ affiliates: AffiliateRow[] }>()
```

Features:
- Sortable columns (click header toggles sort direction)
- Status badges (Active = green, Inactive = red)
- Row click navigates to `/admin/affiliates/${affiliate.affiliate_id}`
- Styled matching the existing table components (shadow card, uppercase headers, hover states)

---

## 5. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `composables/useAdminData.ts` | Create | Fetch all affiliates, commission rates, group data by affiliate |
| `components/dashboard/AffiliateTable.vue` | Create | Sortable affiliate comparison table |
| `pages/admin/index.vue` | Modify | Replace placeholder with aggregated KPIs + affiliate table |
| `pages/admin/affiliates/[id].vue` | Create | Drill-down page reusing affiliate dashboard components |

---

## 6. Out of Scope

- Affiliate CRUD (sub-project 3) — the table is read-only, no create/edit/delete
- Campaign management (sub-project 4)
- Editing commission rates from the admin dashboard
