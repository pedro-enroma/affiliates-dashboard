# Admin Dashboard + Drill-Down Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin dashboard with aggregated KPIs across all affiliates, a sortable affiliate comparison table, and a drill-down page that shows any affiliate's full dashboard.

**Architecture:** Admin dashboard fetches all data without `affiliateId` filters (admin RLS returns everything), computes aggregated KPIs and groups per-affiliate metrics for the table. Drill-down page reuses ALL existing affiliate dashboard components by passing the URL param's `affiliate_id` to every fetch call. A new `useAdminData` composable handles admin-specific queries (all affiliates, commission rates, grouping).

**Tech Stack:** Nuxt 3, Supabase (dual-project: primary for affiliates/traffic, bookings client for activity_bookings), Chart.js, TypeScript

**Note:** No test framework. Verify via dev server (port 6500).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `types/index.ts` | Modify | Add `AffiliateRow` interface |
| `composables/useAdminData.ts` | Create | Fetch all affiliates, commission rates, group data by affiliate |
| `components/dashboard/AffiliateTable.vue` | Create | Sortable affiliate comparison table |
| `pages/admin/index.vue` | Modify | Replace placeholder with aggregated KPIs + affiliate table |
| `pages/admin/affiliates/[id].vue` | Create | Drill-down page reusing affiliate dashboard components |

---

### Task 1: Add AffiliateRow Type

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Append AffiliateRow interface**

Add to the end of `types/index.ts`:

```typescript
export interface AffiliateRow {
  affiliate: Affiliate
  sessions: number
  bookings: number
  revenue: number
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add AffiliateRow type for admin dashboard table"
```

---

### Task 2: Create useAdminData Composable

**Files:**
- Create: `composables/useAdminData.ts`

- [ ] **Step 1: Create the composable**

```typescript
import type { Affiliate, AffiliateCommission, DailyTraffic, ActivityBooking } from '~/types'

export function useAdminData() {
  const client = useSupabaseClient()

  async function fetchAllAffiliates(): Promise<Affiliate[]> {
    const { data, error } = await client
      .from('affiliates')
      .select('*')
      .order('display_name', { ascending: true })

    if (error) throw error
    return (data || []) as Affiliate[]
  }

  async function fetchAffiliateCommission(affiliateId: string): Promise<number> {
    const { data, error } = await client
      .from('affiliate_commissions')
      .select('commission_percentage')
      .eq('affiliate_id', affiliateId)
      .maybeSingle()

    if (error) throw error
    return data?.commission_percentage || 0
  }

  function groupTrafficByAffiliate(traffic: DailyTraffic[]): Map<string, number> {
    const map = new Map<string, number>()
    for (const row of traffic) {
      map.set(row.affiliate_id, (map.get(row.affiliate_id) || 0) + row.sessions)
    }
    return map
  }

  function groupBookingsByAffiliate(bookings: ActivityBooking[]): Map<string, { count: number; revenue: number }> {
    const map = new Map<string, { count: number; revenue: number }>()
    for (const b of bookings) {
      const aid = b.affiliate_id || ''
      const existing = map.get(aid) || { count: 0, revenue: 0 }
      existing.count++
      existing.revenue += b.total_price
      map.set(aid, existing)
    }
    return map
  }

  return { fetchAllAffiliates, fetchAffiliateCommission, groupTrafficByAffiliate, groupBookingsByAffiliate }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useAdminData.ts
git commit -m "feat: add useAdminData composable for admin dashboard"
```

---

### Task 3: Create AffiliateTable Component

**Files:**
- Create: `components/dashboard/AffiliateTable.vue`

- [ ] **Step 1: Create the component**

```vue
<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10">
      <h3 class="text-xl font-bold text-on-surface font-headline">Affiliates</h3>
    </div>

    <div v-if="sortedAffiliates.length" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer hover:text-primary transition-colors select-none"
              @click="toggleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <span v-if="sortKey === col.key" class="material-symbols-outlined text-xs">
                  {{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="(row, i) in sortedAffiliates"
            :key="row.affiliate.affiliate_id"
            :class="[
              'hover:bg-primary-container/5 transition-colors cursor-pointer',
              i % 2 === 1 ? 'bg-surface-container-low/30' : '',
            ]"
            @click="navigateTo(`/admin/affiliates/${row.affiliate.affiliate_id}`)"
          >
            <td class="px-8 py-5 text-sm font-semibold text-on-surface">{{ row.affiliate.display_name }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant font-mono">{{ row.affiliate.affiliate_id }}</td>
            <td class="px-8 py-5 text-sm">{{ row.sessions.toLocaleString() }}</td>
            <td class="px-8 py-5 text-sm">{{ row.bookings.toLocaleString() }}</td>
            <td class="px-8 py-5 text-sm font-bold text-on-surface">{{ formatCurrency(row.revenue) }}</td>
            <td class="px-8 py-5">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  row.affiliate.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700',
                ]"
              >
                {{ row.affiliate.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No affiliates found
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AffiliateRow } from '~/types'

const props = defineProps<{ affiliates: AffiliateRow[] }>()

const columns = [
  { key: 'name', label: 'Affiliate Name' },
  { key: 'id', label: 'Affiliate ID' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue (EUR)' },
  { key: 'status', label: 'Status' },
]

const sortKey = ref<string>('revenue')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const sortedAffiliates = computed(() => {
  const rows = [...props.affiliates]
  const dir = sortDir.value === 'asc' ? 1 : -1

  return rows.sort((a, b) => {
    switch (sortKey.value) {
      case 'name':
        return dir * a.affiliate.display_name.localeCompare(b.affiliate.display_name)
      case 'id':
        return dir * a.affiliate.affiliate_id.localeCompare(b.affiliate.affiliate_id)
      case 'sessions':
        return dir * (a.sessions - b.sessions)
      case 'bookings':
        return dir * (a.bookings - b.bookings)
      case 'revenue':
        return dir * (a.revenue - b.revenue)
      case 'status':
        return dir * (Number(a.affiliate.is_active) - Number(b.affiliate.is_active))
      default:
        return 0
    }
  })
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/AffiliateTable.vue
git commit -m "feat: add sortable AffiliateTable component for admin dashboard"
```

---

### Task 4: Build Admin Dashboard Page

**Files:**
- Modify: `pages/admin/index.vue`

- [ ] **Step 1: Replace the placeholder entirely**

```vue
<template>
  <div class="space-y-8">
    <!-- KPI cards -->
    <section class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <DashboardKpiCard
        label="Sessions"
        :value="kpis.sessions"
        :change="changes.sessions"
        :progress="progressValues.sessions"
      />
      <DashboardKpiCard
        label="Bookings"
        :value="kpis.bookings"
        :change="changes.bookings"
        :progress="progressValues.bookings"
      />
      <DashboardKpiCard
        label="Revenue"
        :value="kpis.revenue"
        format="currency"
        :change="changes.revenue"
        :progress="progressValues.revenue"
        highlight
      />
      <DashboardKpiCard
        label="Affiliates"
        :value="affiliateCount"
        :progress="Math.min(100, (affiliateCount / 50) * 100)"
      />
      <DashboardKpiCard
        label="Conversion Rate"
        :value="kpis.conversionRate"
        format="percent"
        :change="changes.conversionRate"
        :progress="progressValues.conversionRate"
      />
    </section>

    <!-- Affiliate comparison table -->
    <DashboardAffiliateTable :affiliates="affiliateRows" />
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic, ActivityBooking, AffiliateRow, Affiliate } from '~/types'

definePageMeta({ layout: 'admin' })

const { range } = useDateRange()
const { fetchDailyTraffic, aggregateTraffic } = useTraffic()
const { fetchBookings } = useEarnings()
const { getPreviousPeriod, percentChange } = useDashboardStats()
const { fetchAllAffiliates, groupTrafficByAffiliate, groupBookingsByAffiliate } = useAdminData()

const trafficData = ref<DailyTraffic[]>([])
const bookings = ref<ActivityBooking[]>([])
const affiliates = ref<Affiliate[]>([])
const prevTrafficData = ref<DailyTraffic[]>([])
const prevBookings = ref<ActivityBooking[]>([])

const affiliateCount = computed(() => affiliates.value.filter((a) => a.is_active).length)

const kpis = computed(() => {
  const traffic = aggregateTraffic(trafficData.value)
  const totalBookings = bookings.value.length
  const totalRevenue = bookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const conversionRate = traffic.sessions > 0 ? (totalBookings / traffic.sessions) * 100 : 0

  return { sessions: traffic.sessions, bookings: totalBookings, revenue: totalRevenue, conversionRate }
})

const prevKpis = computed(() => {
  const traffic = aggregateTraffic(prevTrafficData.value)
  const totalBookings = prevBookings.value.length
  const totalRevenue = prevBookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const conversionRate = traffic.sessions > 0 ? (totalBookings / traffic.sessions) * 100 : 0

  return { sessions: traffic.sessions, bookings: totalBookings, revenue: totalRevenue, conversionRate }
})

const changes = computed(() => ({
  sessions: percentChange(kpis.value.sessions, prevKpis.value.sessions),
  bookings: percentChange(kpis.value.bookings, prevKpis.value.bookings),
  revenue: percentChange(kpis.value.revenue, prevKpis.value.revenue),
  conversionRate: percentChange(kpis.value.conversionRate, prevKpis.value.conversionRate),
}))

const progressValues = computed(() => {
  const s = kpis.value
  return {
    sessions: Math.min(100, (s.sessions / 100000) * 100),
    bookings: Math.min(100, (s.bookings / 5000) * 100),
    revenue: Math.min(100, (s.revenue / 100000) * 100),
    conversionRate: Math.min(100, (s.conversionRate / 10) * 100),
  }
})

const affiliateRows = computed<AffiliateRow[]>(() => {
  const sessionMap = groupTrafficByAffiliate(trafficData.value)
  const bookingMap = groupBookingsByAffiliate(bookings.value)

  return affiliates.value.map((a) => ({
    affiliate: a,
    sessions: sessionMap.get(a.affiliate_id) || 0,
    bookings: bookingMap.get(a.affiliate_id)?.count || 0,
    revenue: bookingMap.get(a.affiliate_id)?.revenue || 0,
  }))
})

async function loadData() {
  const prevRange = getPreviousPeriod(range.value)

  const [traffic, bk, affs, prevTraffic, prevBk] = await Promise.all([
    fetchDailyTraffic(range.value),
    fetchBookings(range.value),
    fetchAllAffiliates(),
    fetchDailyTraffic(prevRange),
    fetchBookings(prevRange),
  ])

  trafficData.value = traffic
  bookings.value = bk
  affiliates.value = affs
  prevTrafficData.value = prevTraffic
  prevBookings.value = prevBk
}

watch(range, loadData, { immediate: true })
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/admin/index.vue
git commit -m "feat: build admin dashboard with aggregated KPIs and affiliate table"
```

---

### Task 5: Create Affiliate Drill-Down Page

**Files:**
- Create: `pages/admin/affiliates/[id].vue`

- [ ] **Step 1: Create the drill-down page**

```vue
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <NuxtLink
        to="/admin/affiliates"
        class="text-sm text-primary font-semibold flex items-center gap-1 hover:underline mb-2"
      >
        <span class="material-symbols-outlined text-sm">arrow_back</span>
        Back to Affiliates
      </NuxtLink>
      <h1 class="text-2xl font-bold text-on-surface font-headline">{{ affiliateProfile?.display_name || 'Loading...' }}</h1>
      <p class="text-sm text-on-surface-variant font-mono">{{ affiliateId }}</p>
    </div>

    <!-- KPI cards -->
    <section class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <DashboardKpiCard
        label="Sessions"
        :value="kpis.sessions"
        :change="changes.sessions"
        :progress="progressValues.sessions"
      />
      <DashboardKpiCard
        label="Bookings"
        :value="kpis.bookings"
        :change="changes.bookings"
        :progress="progressValues.bookings"
      />
      <DashboardKpiCard
        label="Revenue"
        :value="kpis.revenue"
        format="currency"
        :change="changes.revenue"
        :progress="progressValues.revenue"
        highlight
      />
      <DashboardKpiCard
        label="Commission"
        :value="kpis.commission"
        format="currency"
        :change="changes.commission"
        :progress="progressValues.commission"
      />
      <DashboardKpiCard
        label="Conversion Rate"
        :value="kpis.conversionRate"
        format="percent"
        :change="changes.conversionRate"
        :progress="progressValues.conversionRate"
      />
    </section>

    <!-- Charts row -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <DashboardTrafficChart :data="trafficData" />
      <DashboardFunnelChart :data="eventsData" />
    </section>

    <!-- Recent Bookings -->
    <DashboardRecentBookings :bookings="allBookings" />

    <!-- Performance + Top Destination -->
    <section class="grid grid-cols-12 gap-8">
      <div class="col-span-12 lg:col-span-8">
        <DashboardPerformanceChart :bookings="allBookings" />
      </div>
      <div class="col-span-12 lg:col-span-4">
        <DashboardTopDestination
          :campaign="topDest?.campaign || null"
          :revenue="topDest?.revenue || 0"
          :conversion-rate="topDest?.conversionRate || 0"
          :health-percent="topDest?.healthPercent || 0"
        />
      </div>
    </section>

    <!-- Top Performing Campaigns -->
    <DashboardTopCampaigns :campaigns="topCampaigns" />
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic, DailyEvent, ActivityBooking, KpiData, CampaignPerformance, Affiliate } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const affiliateId = route.params.id as string

const { range } = useDateRange()
const { fetchDailyTraffic, fetchDailyEvents, aggregateTraffic } = useTraffic()
const { fetchBookings, fetchAllBookings } = useEarnings()
const { fetchCampaigns } = useCampaigns()
const { getPreviousPeriod, percentChange, getTopCampaigns, getTopDestination } = useDashboardStats()
const { fetchAffiliateCommission } = useAdminData()

const client = useSupabaseClient()

const affiliateProfile = ref<Affiliate | null>(null)
const commissionRate = ref(0)
const trafficData = ref<DailyTraffic[]>([])
const eventsData = ref<DailyEvent[]>([])
const bookings = ref<ActivityBooking[]>([])
const allBookings = ref<ActivityBooking[]>([])
const campaigns = ref<Awaited<ReturnType<typeof fetchCampaigns>>>([])
const prevTrafficData = ref<DailyTraffic[]>([])
const prevBookings = ref<ActivityBooking[]>([])

// Fetch affiliate profile
async function loadProfile() {
  const { data } = await client
    .from('affiliates')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .maybeSingle()

  affiliateProfile.value = data as Affiliate | null
  commissionRate.value = await fetchAffiliateCommission(affiliateId)
}

function calculateCommission(price: number): number {
  return price * (commissionRate.value / 100)
}

const kpis = computed<KpiData>(() => {
  const traffic = aggregateTraffic(trafficData.value)
  const totalBookings = bookings.value.length
  const totalRevenue = bookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const totalCommission = bookings.value.reduce((sum, b) => sum + calculateCommission(b.total_price), 0)
  const conversionRate = traffic.sessions > 0 ? (totalBookings / traffic.sessions) * 100 : 0

  return {
    sessions: traffic.sessions,
    bookings: totalBookings,
    revenue: totalRevenue,
    commission: totalCommission,
    conversionRate,
  }
})

const prevKpis = computed<KpiData>(() => {
  const traffic = aggregateTraffic(prevTrafficData.value)
  const totalBookings = prevBookings.value.length
  const totalRevenue = prevBookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const totalCommission = prevBookings.value.reduce((sum, b) => sum + calculateCommission(b.total_price), 0)
  const conversionRate = traffic.sessions > 0 ? (totalBookings / traffic.sessions) * 100 : 0

  return {
    sessions: traffic.sessions,
    bookings: totalBookings,
    revenue: totalRevenue,
    commission: totalCommission,
    conversionRate,
  }
})

const changes = computed(() => ({
  sessions: percentChange(kpis.value.sessions, prevKpis.value.sessions),
  bookings: percentChange(kpis.value.bookings, prevKpis.value.bookings),
  revenue: percentChange(kpis.value.revenue, prevKpis.value.revenue),
  commission: percentChange(kpis.value.commission, prevKpis.value.commission),
  conversionRate: percentChange(kpis.value.conversionRate, prevKpis.value.conversionRate),
}))

const progressValues = computed(() => {
  const s = kpis.value
  return {
    sessions: Math.min(100, (s.sessions / 50000) * 100),
    bookings: Math.min(100, (s.bookings / 1000) * 100),
    revenue: Math.min(100, (s.revenue / 25000) * 100),
    commission: Math.min(100, (s.commission / 5000) * 100),
    conversionRate: Math.min(100, (s.conversionRate / 10) * 100),
  }
})

const topCampaigns = computed<CampaignPerformance[]>(() =>
  getTopCampaigns(bookings.value, campaigns.value, trafficData.value),
)

const topDest = computed(() =>
  getTopDestination(bookings.value, campaigns.value, trafficData.value),
)

async function loadData() {
  const prevRange = getPreviousPeriod(range.value)

  const [traffic, events, bk, allBk, camp, prevTraffic, prevBk] = await Promise.all([
    fetchDailyTraffic(range.value, affiliateId),
    fetchDailyEvents(range.value, affiliateId),
    fetchBookings(range.value, affiliateId),
    fetchAllBookings(range.value, affiliateId),
    fetchCampaigns(affiliateId),
    fetchDailyTraffic(prevRange, affiliateId),
    fetchBookings(prevRange, affiliateId),
  ])

  trafficData.value = traffic
  eventsData.value = events
  bookings.value = bk
  allBookings.value = allBk
  campaigns.value = camp
  prevTrafficData.value = prevTraffic
  prevBookings.value = prevBk
}

// Load profile once, reload data when date range changes
loadProfile()
watch(range, loadData, { immediate: true })
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/admin/affiliates/\\[id\\].vue
git commit -m "feat: add affiliate drill-down page reusing dashboard components"
```

---

### Task 6: Verify

- [ ] **Step 1: Start dev server and test**

Run: `npm run dev` (port 6500)

Test scenarios:
1. Login as admin → `/admin` shows KPI cards (Sessions, Bookings, Revenue, Affiliates, Conversion Rate) + affiliate table
2. Affiliate table rows are clickable → navigates to `/admin/affiliates/<affiliate_id>`
3. Drill-down page shows full dashboard for that affiliate with "Back to Affiliates" link
4. Date range changes update both pages
5. Table columns are sortable

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "chore: admin dashboard and drill-down complete"
```
