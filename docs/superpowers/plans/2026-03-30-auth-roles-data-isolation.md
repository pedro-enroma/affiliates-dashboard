# Auth, Roles & Data Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin/affiliate role system with an `admins` table, role-aware middleware (nothing accessible without login), admin layout with placeholder pages, and explicit `affiliate_id` filtering on all data queries.

**Architecture:** A separate `admins` table determines role. `useAuth` composable queries it once per session, middleware enforces routing (public routes → auth check → role check). Data composables gain an optional `affiliateId` parameter for defense-in-depth filtering. RLS SQL provided for manual Supabase execution.

**Tech Stack:** Nuxt 3, Supabase (auth + RLS), TypeScript

**Note:** No test framework in this project. Verify via dev server.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `composables/useAuth.ts` | Create | Role check: queries `admins` table, caches result |
| `middleware/auth.ts` | Modify | Auth gate + role-based routing |
| `layouts/admin.vue` | Create | Admin layout (sidebar + top bar, admin nav items) |
| `components/ui/AdminSidebar.vue` | Create | Admin-specific sidebar with admin nav and badge |
| `pages/login.vue` | Modify | Role-aware redirect after login |
| `pages/admin/index.vue` | Create | Admin dashboard placeholder |
| `pages/admin/affiliates/index.vue` | Create | Affiliates list placeholder |
| `pages/admin/campaigns/index.vue` | Create | Campaigns placeholder |
| `pages/admin/settings.vue` | Create | Admin settings placeholder |
| `composables/useTraffic.ts` | Modify | Add `affiliateId` param to fetch functions |
| `composables/useEarnings.ts` | Modify | Add `affiliateId` param to fetch functions |
| `composables/useCampaigns.ts` | Modify | Add `affiliateId` param to fetchCampaigns |
| `pages/index.vue` | Modify | Pass `affiliate_id` to all data fetches |
| `docs/rls-policies.sql` | Create | SQL for RLS policies (run manually) |

---

### Task 1: Create `useAuth` Composable

**Files:**
- Create: `composables/useAuth.ts`

- [ ] **Step 1: Create the composable**

```typescript
export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const isAdmin = useState<boolean>('auth-is-admin', () => false)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const authChecked = useState<boolean>('auth-checked', () => false)

  async function checkRole() {
    if (!user.value) {
      isAdmin.value = false
      authLoading.value = false
      authChecked.value = true
      return
    }

    if (authChecked.value) {
      authLoading.value = false
      return
    }

    const { data } = await client
      .from('admins')
      .select('id')
      .eq('user_id', user.value.id)
      .maybeSingle()

    isAdmin.value = !!data
    authLoading.value = false
    authChecked.value = true
  }

  const isAffiliate = computed(() => !isAdmin.value)
  const role = computed<'admin' | 'affiliate'>(() => isAdmin.value ? 'admin' : 'affiliate')

  return { isAdmin, isAffiliate, role, authLoading, authChecked, checkRole }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useAuth.ts
git commit -m "feat: add useAuth composable for admin/affiliate role detection"
```

---

### Task 2: Rewrite Auth Middleware

**Files:**
- Modify: `middleware/auth.ts`

- [ ] **Step 1: Replace the middleware entirely**

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Public routes — no auth needed
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/confirm']
  if (publicRoutes.includes(to.path)) return

  // No user → redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Check role (cached after first call)
  const { isAdmin, checkRole } = useAuth()
  await checkRole()

  const isAdminRoute = to.path === '/admin' || to.path.startsWith('/admin/')

  // Admin trying to access affiliate routes → redirect to admin dashboard
  if (isAdmin.value && !isAdminRoute) {
    return navigateTo('/admin')
  }

  // Affiliate trying to access admin routes → redirect to affiliate dashboard
  if (!isAdmin.value && isAdminRoute) {
    return navigateTo('/')
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add middleware/auth.ts
git commit -m "feat: rewrite auth middleware with role-based routing"
```

---

### Task 3: Update Login Page with Role-Aware Redirect

**Files:**
- Modify: `pages/login.vue`

- [ ] **Step 1: Update the `handleLogin` function**

Replace the entire `<script setup>` block:

```typescript
definePageMeta({ layout: false })

const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  const { error: authError } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (authError) {
    error.value = authError.message
    loading.value = false
    return
  }

  // Check role and redirect accordingly
  const { isAdmin, checkRole } = useAuth()
  await checkRole()

  if (isAdmin.value) {
    navigateTo('/admin')
  } else {
    navigateTo('/')
  }
}
```

The template stays unchanged.

- [ ] **Step 2: Commit**

```bash
git add pages/login.vue
git commit -m "feat: role-aware redirect after login"
```

---

### Task 4: Create Admin Sidebar Component

**Files:**
- Create: `components/ui/AdminSidebar.vue`

- [ ] **Step 1: Create the component**

Based on the existing `Sidebar.vue` but with admin-specific nav, "Admin" badge, and no "New Campaign" button:

```vue
<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-emerald-50/50 backdrop-blur-xl shadow-[20px_0_40px_rgba(25,28,28,0.03)] flex flex-col p-6 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex flex-col gap-1 mb-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">explore</span>
        </div>
        <div>
          <h1 class="text-xl font-bold text-emerald-900 tracking-tight font-headline">NUMAtours</h1>
          <div class="flex items-center gap-2">
            <p class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Admin</p>
            <span class="bg-primary text-on-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Admin</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-2 flex-grow">
      <NuxtLink
        v-for="item in mainNavItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200',
          isActive(item.path)
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive(item.path) ? `font-variation-settings: 'FILL' 1` : ''"
        >{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>

      <!-- Settings pushed to bottom -->
      <NuxtLink
        to="/admin/settings"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200 mt-auto',
          isActive('/admin/settings')
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive('/admin/settings') ? `font-variation-settings: 'FILL' 1` : ''"
        >settings</span>
        <span>Settings</span>
      </NuxtLink>
    </nav>

    <!-- User info + Sign out -->
    <div class="mt-6 pt-6 border-t border-outline-variant/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
          <span class="material-symbols-outlined text-sm">shield_person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-on-surface truncate">Admin</p>
          <p class="text-xs text-zinc-500 truncate">{{ user?.email }}</p>
        </div>
      </div>

      <button
        class="w-full text-left text-sm text-zinc-500 hover:text-error transition-colors px-1"
        @click="signOut"
      >
        Sign out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

const mainNavItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/affiliates', label: 'Affiliates', icon: 'group' },
  { path: '/admin/campaigns', label: 'Campaigns', icon: 'campaign' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

async function signOut() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/AdminSidebar.vue
git commit -m "feat: add AdminSidebar component with admin nav and badge"
```

---

### Task 5: Create Admin Layout

**Files:**
- Create: `layouts/admin.vue`

- [ ] **Step 1: Create the layout**

```vue
<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600/75" />
    </div>

    <!-- Admin Sidebar -->
    <UiAdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <main class="lg:ml-64 min-h-screen relative">
      <UiTopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="pt-32 pb-20 px-10 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add layouts/admin.vue
git commit -m "feat: add admin layout with AdminSidebar"
```

---

### Task 6: Create Admin Placeholder Pages

**Files:**
- Create: `pages/admin/index.vue`
- Create: `pages/admin/affiliates/index.vue`
- Create: `pages/admin/campaigns/index.vue`
- Create: `pages/admin/settings.vue`

- [ ] **Step 1: Create `pages/admin/index.vue`**

```vue
<template>
  <div>
    <h1 class="text-2xl font-bold text-on-surface font-headline mb-4">Admin Dashboard</h1>
    <p class="text-on-surface-variant">Aggregated metrics across all affiliates. Coming soon.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
```

- [ ] **Step 2: Create `pages/admin/affiliates/index.vue`**

```vue
<template>
  <div>
    <h1 class="text-2xl font-bold text-on-surface font-headline mb-4">Affiliates</h1>
    <p class="text-on-surface-variant">Manage affiliate accounts, commissions, and status. Coming soon.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
```

- [ ] **Step 3: Create `pages/admin/campaigns/index.vue`**

```vue
<template>
  <div>
    <h1 class="text-2xl font-bold text-on-surface font-headline mb-4">All Campaigns</h1>
    <p class="text-on-surface-variant">View and manage campaigns across all affiliates. Coming soon.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
```

- [ ] **Step 4: Create `pages/admin/settings.vue`**

```vue
<template>
  <div>
    <h1 class="text-2xl font-bold text-on-surface font-headline mb-4">Admin Settings</h1>
    <p class="text-on-surface-variant">Platform settings and configuration. Coming soon.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
```

- [ ] **Step 5: Commit**

```bash
git add pages/admin/
git commit -m "feat: add admin placeholder pages with admin layout"
```

---

### Task 7: Add `affiliateId` Param to `useTraffic`

**Files:**
- Modify: `composables/useTraffic.ts`

- [ ] **Step 1: Update all three fetch functions**

Replace the entire file:

```typescript
import type { DailyTraffic, DailyEvent, TrafficDemographic, DateRange } from '~/types'

export function useTraffic() {
  const client = useSupabaseClient()

  async function fetchDailyTraffic(range: DateRange, affiliateId?: string): Promise<DailyTraffic[]> {
    let query = client
      .from('affiliate_daily_traffic')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as DailyTraffic[]
  }

  async function fetchDailyEvents(range: DateRange, affiliateId?: string): Promise<DailyEvent[]> {
    let query = client
      .from('affiliate_daily_events')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as DailyEvent[]
  }

  async function fetchDemographics(range: DateRange, dimensionType: string, affiliateId?: string): Promise<TrafficDemographic[]> {
    let query = client
      .from('affiliate_traffic_demographics')
      .select('*')
      .gte('date', range.start)
      .lte('date', range.end)
      .eq('dimension_type', dimensionType)
      .order('date', { ascending: true })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as TrafficDemographic[]
  }

  function aggregateTraffic(rows: DailyTraffic[]) {
    return rows.reduce(
      (acc, row) => ({
        sessions: acc.sessions + row.sessions,
        totalUsers: acc.totalUsers + row.total_users,
        newUsers: acc.newUsers + row.new_users,
        pageViews: acc.pageViews + row.page_views,
      }),
      { sessions: 0, totalUsers: 0, newUsers: 0, pageViews: 0 },
    )
  }

  function aggregateDemographics(rows: TrafficDemographic[]) {
    const map = new Map<string, { sessions: number; users: number }>()
    for (const row of rows) {
      const existing = map.get(row.dimension_value) || { sessions: 0, users: 0 }
      existing.sessions += row.sessions
      existing.users += row.users
      map.set(row.dimension_value, existing)
    }
    return [...map.entries()]
      .map(([label, val]) => ({ label, ...val }))
      .sort((a, b) => b.sessions - a.sessions)
  }

  return {
    fetchDailyTraffic,
    fetchDailyEvents,
    fetchDemographics,
    aggregateTraffic,
    aggregateDemographics,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useTraffic.ts
git commit -m "feat: add optional affiliateId param to useTraffic fetch functions"
```

---

### Task 8: Add `affiliateId` Param to `useEarnings`

**Files:**
- Modify: `composables/useEarnings.ts`

- [ ] **Step 1: Update fetch functions**

Replace the entire file:

```typescript
import type { ActivityBooking, DateRange } from '~/types'

export function useEarnings() {
  const client = useSupabaseClient()
  const { commissionRate } = useAffiliate()

  async function fetchBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    let query = client
      .from('activity_bookings')
      .select('id, booking_id, product_title, start_date_time, total_price, currency, status, affiliate_id, first_campaign, created_at')
      .gte('start_date_time', range.start)
      .lte('start_date_time', range.end + 'T23:59:59')
      .in('status', ['CONFIRMED', 'confirmed'])
      .order('start_date_time', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ActivityBooking[]
  }

  async function fetchAllBookings(range: DateRange, affiliateId?: string): Promise<ActivityBooking[]> {
    let query = client
      .from('activity_bookings')
      .select('id, booking_id, product_title, start_date_time, total_price, currency, status, affiliate_id, first_campaign, created_at')
      .gte('start_date_time', range.start)
      .lte('start_date_time', range.end + 'T23:59:59')
      .order('start_date_time', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ActivityBooking[]
  }

  function calculateCommission(price: number): number {
    return price * (commissionRate.value / 100)
  }

  function summarizeByMonth(bookings: ActivityBooking[]) {
    const map = new Map<string, { bookings: number; revenue: number; commission: number }>()

    for (const b of bookings) {
      const month = b.start_date_time.slice(0, 7)
      const existing = map.get(month) || { bookings: 0, revenue: 0, commission: 0 }
      existing.bookings++
      existing.revenue += b.total_price
      existing.commission += calculateCommission(b.total_price)
      map.set(month, existing)
    }

    return [...map.entries()]
      .map(([month, val]) => ({ month, ...val }))
      .sort((a, b) => b.month.localeCompare(a.month))
  }

  return {
    fetchBookings,
    fetchAllBookings,
    calculateCommission,
    summarizeByMonth,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useEarnings.ts
git commit -m "feat: add optional affiliateId param to useEarnings fetch functions"
```

---

### Task 9: Add `affiliateId` Param to `useCampaigns`

**Files:**
- Modify: `composables/useCampaigns.ts`

- [ ] **Step 1: Update fetchCampaigns**

Replace the entire file:

```typescript
import type { AffiliateCampaign } from '~/types'

export function useCampaigns() {
  const client = useSupabaseClient()
  const { affiliate } = useAffiliate()

  async function fetchCampaigns(affiliateId?: string): Promise<AffiliateCampaign[]> {
    let query = client
      .from('affiliate_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as AffiliateCampaign[]
  }

  async function createCampaign(campaign: {
    campaign_slug: string
    campaign_name: string
    destination_url: string
    activity_id?: string
    campaign_type?: string
    widget_config?: Record<string, any>
  }): Promise<AffiliateCampaign> {
    if (!affiliate.value) throw new Error('Not authenticated')

    const { data, error } = await client
      .from('affiliate_campaigns')
      .insert({
        affiliate_id: affiliate.value.affiliate_id,
        ...campaign,
      })
      .select()
      .single()

    if (error) throw error
    return data as AffiliateCampaign
  }

  async function updateCampaign(id: number, updates: Partial<AffiliateCampaign>): Promise<void> {
    const { error } = await client
      .from('affiliate_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  async function deleteCampaign(id: number): Promise<void> {
    const { error } = await client
      .from('affiliate_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  function generateLink(affiliateId: string, campaignSlug: string, destinationUrl: string): string {
    const url = new URL(destinationUrl)
    url.searchParams.set('affiliate_id', affiliateId)
    url.searchParams.set('first_campaign_id', campaignSlug)
    return url.toString()
  }

  return {
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    generateLink,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useCampaigns.ts
git commit -m "feat: add optional affiliateId param to useCampaigns.fetchCampaigns"
```

---

### Task 10: Update Dashboard Page to Pass `affiliate_id`

**Files:**
- Modify: `pages/index.vue`

- [ ] **Step 1: Update the `loadData` function**

In the `<script setup>` block, add `useAffiliate()` and pass the affiliate_id to all fetch calls. Replace the `loadData` function and add the affiliate import:

After the existing composable destructures (around line 73-77), add:

```typescript
const { affiliate } = useAffiliate()
```

Replace the `loadData` function with:

```typescript
async function loadData() {
  const aid = affiliate.value?.affiliate_id
  if (!aid) return

  const prevRange = getPreviousPeriod(range.value)

  const [traffic, events, bk, allBk, camp, prevTraffic, prevBk] = await Promise.all([
    fetchDailyTraffic(range.value, aid),
    fetchDailyEvents(range.value, aid),
    fetchBookings(range.value, aid),
    fetchAllBookings(range.value, aid),
    fetchCampaigns(aid),
    fetchDailyTraffic(prevRange, aid),
    fetchBookings(prevRange, aid),
  ])

  trafficData.value = traffic
  eventsData.value = events
  bookings.value = bk
  allBookings.value = allBk
  campaigns.value = camp
  prevTrafficData.value = prevTraffic
  prevBookings.value = prevBk
}
```

Also update the `watch` to react to affiliate changes:

```typescript
watch([range, () => affiliate.value?.affiliate_id], loadData, { immediate: true })
```

- [ ] **Step 2: Commit**

```bash
git add pages/index.vue
git commit -m "feat: pass affiliate_id explicitly to all dashboard data fetches"
```

---

### Task 11: Create RLS Policies SQL File

**Files:**
- Create: `docs/rls-policies.sql`

- [ ] **Step 1: Create the SQL file**

```sql
-- ============================================================
-- RLS Policies for NUMAtours Affiliate Dashboard
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own admin status"
  ON admins FOR SELECT
  USING (user_id = auth.uid());

-- 2. affiliates table
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_profile" ON affiliates
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_read_all_profiles" ON affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 3. affiliate_daily_traffic
ALTER TABLE affiliate_daily_traffic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 4. affiliate_daily_events
ALTER TABLE affiliate_daily_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_events" ON affiliate_daily_events
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_events" ON affiliate_daily_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 5. affiliate_traffic_demographics
ALTER TABLE affiliate_traffic_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 6. activity_bookings
ALTER TABLE activity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_bookings" ON activity_bookings
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_bookings" ON activity_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 7. affiliate_campaigns
ALTER TABLE affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_campaigns" ON affiliate_campaigns
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_campaigns" ON affiliate_campaigns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_campaigns" ON affiliate_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 8. affiliate_commissions
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_commission" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_commissions" ON affiliate_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_commissions" ON affiliate_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- ============================================================
-- Don't forget: insert your user_id into the admins table!
-- INSERT INTO admins (user_id) VALUES ('your-user-uuid-here');
-- ============================================================
```

- [ ] **Step 2: Commit**

```bash
git add docs/rls-policies.sql
git commit -m "docs: add RLS policies SQL for admin/affiliate data isolation"
```

---

### Task 12: Verify and Test

- [ ] **Step 1: Run the RLS SQL in Supabase**

Open the Supabase SQL editor and run the contents of `docs/rls-policies.sql`. Insert your user_id into the `admins` table.

- [ ] **Step 2: Start dev server and test**

Run: `npm run dev`

Test scenarios:
1. **Not logged in** → any route redirects to `/login`
2. **Login as admin** → redirected to `/admin`, can navigate admin pages, cannot access `/`
3. **Login as affiliate** → redirected to `/`, can navigate affiliate pages, cannot access `/admin`
4. **Affiliate dashboard** → data loads correctly (filtered by affiliate_id)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: auth roles and data isolation complete"
```
