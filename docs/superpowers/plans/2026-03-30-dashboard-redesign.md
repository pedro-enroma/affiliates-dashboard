# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the NUMAtours affiliate dashboard to match the Stitch-generated mockup — new emerald/green theme, Material Design 3 tokens, upgraded KPI cards, new Performance chart, Top Destination card, Top Performing Campaigns table, and restyled layout.

**Architecture:** Update the shared design system (Tailwind + fonts + icons) first, then rework layout components (sidebar, top bar), then update each dashboard component bottom-up (composables → components → page). All data comes from existing Supabase tables via existing composables — no schema changes needed.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, Tailwind CSS, Chart.js (vue-chartjs), Supabase, TypeScript

**Note:** This project has no test framework configured. Steps verify via `npm run dev` (port 6001) visual checks instead of automated tests.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `tailwind.config.ts` | Modify | MD3 color tokens, font families, border-radius |
| `nuxt.config.ts` | Modify | Google Fonts links for Plus Jakarta Sans, Manrope, Material Symbols |
| `layouts/default.vue` | Modify | Background color, content padding for fixed TopBar |
| `components/ui/Sidebar.vue` | Modify | Full redesign: emerald theme, Material icons, New Campaign CTA |
| `components/ui/TopBar.vue` | Modify | Add date picker, search, notifications, help; sign-out to sidebar |
| `components/ui/DateRangePicker.vue` | Modify | Restyle to match Stitch dropdown design |
| `composables/useDashboardStats.ts` | Create | Period comparison, top campaigns aggregation, top destination |
| `composables/useEarnings.ts` | Modify | Add fetchAllBookings (unfiltered by status) |
| `components/dashboard/KpiCard.vue` | Modify | Change indicator, progress bar, highlight variant |
| `components/dashboard/TrafficChart.vue` | Modify | Emerald colors, custom legend, dashed Users line |
| `components/dashboard/FunnelChart.vue` | Modify | Replace Chart.js with styled HTML horizontal bars |
| `components/dashboard/RecentBookings.vue` | Modify | Status badges, restyled table |
| `components/dashboard/PerformanceChart.vue` | Create | Revenue line chart with gradient fill, period toggle |
| `components/dashboard/TopDestination.vue` | Create | Top campaign highlight card |
| `components/dashboard/TopCampaigns.vue` | Create | Campaigns performance table with CSV export |
| `pages/index.vue` | Modify | Wire up all new/updated components, fetch prev period data |
| `types/index.ts` | Modify | Add CampaignPerformance interface |

---

### Task 1: Design System — Tailwind Config + Fonts

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Update tailwind.config.ts with MD3 color tokens, font families, and border-radius**

Replace the entire file content:

```typescript
import type { Config } from 'tailwindcss'

export default <Config>{
  content: [],
  theme: {
    extend: {
      colors: {
        'primary-fixed-dim': '#5ade9d',
        'on-secondary-container': '#3e6c52',
        'error-container': '#ffdad6',
        'primary-container': '#2dba7d',
        'surface-variant': '#e1e3e2',
        'surface-tint': '#006c45',
        'surface-container': '#eceeed',
        'outline-variant': '#bccabe',
        'on-surface-variant': '#3d4a41',
        'surface': '#f8faf9',
        'tertiary-fixed-dim': '#ffb3b4',
        'secondary-fixed': '#bceece',
        'surface-container-high': '#e6e9e8',
        'inverse-primary': '#5ade9d',
        'on-error-container': '#93000a',
        'secondary-fixed-dim': '#a1d2b3',
        'tertiary-fixed': '#ffdad9',
        'surface-container-lowest': '#ffffff',
        'primary': '#006c45',
        'on-background': '#191c1c',
        'tertiary': '#a43942',
        'on-primary': '#ffffff',
        'on-surface': '#191c1c',
        'secondary-container': '#b9ebcb',
        'inverse-surface': '#2e3131',
        'on-primary-fixed-variant': '#005233',
        'surface-container-highest': '#e1e3e2',
        'surface-container-low': '#f2f4f3',
        'on-secondary': '#ffffff',
        'secondary': '#3a674e',
        'on-tertiary-container': '#731421',
        'error': '#ba1a1a',
        'on-secondary-fixed-variant': '#214f38',
        'on-secondary-fixed': '#002112',
        'background': '#f8faf9',
        'on-tertiary': '#ffffff',
        'on-error': '#ffffff',
        'inverse-on-surface': '#eff1f0',
        'primary-fixed': '#78fbb8',
        'on-tertiary-fixed': '#40000a',
        'surface-dim': '#d8dada',
        'on-tertiary-fixed-variant': '#84222c',
        'outline': '#6d7a70',
        'surface-bright': '#f8faf9',
        'on-primary-container': '#004429',
        'on-primary-fixed': '#002112',
        'tertiary-container': '#fd7d83',
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
}
```

- [ ] **Step 2: Add Google Fonts links to nuxt.config.ts**

Add the `link` entries inside `app.head`:

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/forgot-password', '/reset-password'],
      cookieRedirect: false,
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'https://enroma.com',
    },
  },

  devServer: {
    port: 6001,
  },

  app: {
    head: {
      title: 'NUMAtours Affiliate Portal',
      meta: [
        { name: 'description', content: 'Track your traffic, bookings, and commissions' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        },
      ],
      style: [
        {
          children: `
            .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            body { font-family: 'Manrope', sans-serif; }
            h1, h2, h3, .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
          `,
        },
      ],
    },
  },
})
```

- [ ] **Step 3: Verify fonts load**

Run: `npm run dev`
Open http://localhost:6001, check that body text uses Manrope and headings use Plus Jakarta Sans (visible in browser DevTools computed styles). Check that Material Symbols icon font loads (no 404 in network tab).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts nuxt.config.ts
git commit -m "feat: update design system to MD3 emerald tokens with Plus Jakarta Sans + Manrope fonts"
```

---

### Task 2: Layout + Sidebar Redesign

**Files:**
- Modify: `layouts/default.vue`
- Modify: `components/ui/Sidebar.vue`

- [ ] **Step 1: Update default.vue layout**

Replace the entire file:

```vue
<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600/75" />
    </div>

    <!-- Sidebar -->
    <UiSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

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

- [ ] **Step 2: Rewrite Sidebar.vue**

Replace the entire file:

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
          <p class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Affiliate Portal</p>
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
        to="/settings"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200 mt-auto',
          isActive('/settings')
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive('/settings') ? `font-variation-settings: 'FILL' 1` : ''"
        >settings</span>
        <span>Settings</span>
      </NuxtLink>
    </nav>

    <!-- User info -->
    <div class="mt-6 pt-6 border-t border-outline-variant/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-sm font-bold">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-on-surface truncate">{{ affiliate?.display_name || 'Loading...' }}</p>
          <p class="text-xs text-zinc-500 truncate">{{ affiliate?.email }}</p>
        </div>
      </div>

      <!-- Sign out -->
      <button
        class="w-full text-left text-sm text-zinc-500 hover:text-error transition-colors mb-4 px-1"
        @click="signOut"
      >
        Sign out
      </button>

      <!-- New Campaign button -->
      <NuxtLink
        to="/campaigns/create"
        class="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        New Campaign
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const client = useSupabaseClient()
const { affiliate } = useAffiliate()

const initials = computed(() => {
  const name = affiliate.value?.display_name || ''
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/traffic', label: 'Traffic', icon: 'analytics' },
  { path: '/earnings', label: 'Earnings', icon: 'payments' },
  { path: '/campaigns', label: 'Campaigns', icon: 'campaign' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function signOut() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
```

- [ ] **Step 3: Verify layout + sidebar**

Run: `npm run dev`
Check: emerald sidebar renders, Material Symbols icons show, active state is white card, "New Campaign" button at bottom, sign out link works.

- [ ] **Step 4: Commit**

```bash
git add layouts/default.vue components/ui/Sidebar.vue
git commit -m "feat: redesign layout and sidebar with emerald theme and Material icons"
```

---

### Task 3: TopBar + DateRangePicker Redesign

**Files:**
- Modify: `components/ui/TopBar.vue`
- Modify: `components/ui/DateRangePicker.vue`

- [ ] **Step 1: Rewrite TopBar.vue**

Replace the entire file:

```vue
<template>
  <header class="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-zinc-50/80 backdrop-blur-md flex justify-between items-center px-10 h-20 border-b border-outline-variant/10">
    <!-- Mobile menu button -->
    <button class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-container-high" @click="$emit('toggle-sidebar')">
      <span class="material-symbols-outlined">menu</span>
    </button>

    <!-- Page title -->
    <h2 class="font-headline text-2xl font-bold text-on-surface">{{ pageTitle }}</h2>

    <div class="flex items-center gap-6">
      <!-- Date Range Picker -->
      <UiDateRangePicker />

      <!-- Search -->
      <div class="relative w-64 hidden md:block">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
        <input
          :value="searchQuery"
          class="w-full pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-container transition-all font-body"
          placeholder="Search campaigns..."
          @input="onSearchInput"
        />
      </div>

      <!-- Notification & Help -->
      <div class="flex items-center gap-4">
        <div class="relative">
          <button
            class="p-2 text-zinc-500 hover:text-emerald-500 transition-colors active:opacity-80"
            @click="showNotifications = !showNotifications"
          >
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <div
            v-if="showNotifications"
            class="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-outline-variant/10 p-4 z-50"
          >
            <p class="text-sm text-zinc-400 text-center">No new notifications</p>
          </div>
        </div>
        <a
          href="https://enroma.com/help"
          target="_blank"
          class="p-2 text-zinc-500 hover:text-emerald-500 transition-colors active:opacity-80"
        >
          <span class="material-symbols-outlined">help</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const showNotifications = ref(false)

const searchQuery = useState<string>('campaignSearch', () => '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = val
  }, 300)
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/traffic': 'Traffic Analytics',
    '/earnings': 'Earnings',
    '/campaigns': 'Campaigns',
    '/campaigns/create': 'Create Campaign',
    '/settings': 'Settings',
  }
  return titles[route.path] || 'Dashboard'
})

// Close notifications dropdown on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showNotifications.value = false
    }
  })
})
</script>
```

- [ ] **Step 2: Restyle DateRangePicker.vue**

Replace the entire file:

```vue
<template>
  <div class="relative group">
    <button
      class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface-variant hover:border-primary transition-colors"
      @click="dropdownOpen = !dropdownOpen"
    >
      <span class="material-symbols-outlined text-lg">calendar_today</span>
      <span>{{ presetLabel }}</span>
      <span class="material-symbols-outlined text-lg">expand_more</span>
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline-variant/10 z-50 overflow-hidden"
    >
      <button
        v-for="preset in presets"
        :key="preset.value"
        :class="[
          'w-full px-4 py-2.5 text-left text-sm transition-colors',
          selectedPreset === preset.value
            ? 'bg-primary-container/10 text-primary font-bold'
            : 'hover:bg-surface-container-low',
        ]"
        @click="selectPreset(preset.value)"
      >
        {{ preset.label }}
      </button>

      <div v-if="selectedPreset === 'custom'" class="px-4 py-3 border-t border-outline-variant/10 space-y-2">
        <input
          type="date"
          :value="range.start"
          class="w-full px-3 py-2 text-sm border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary-container"
          @input="onCustomStart"
        />
        <input
          type="date"
          :value="range.end"
          class="w-full px-3 py-2 text-sm border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary-container"
          @input="onCustomEnd"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { range, setRange } = useDateRange()
const selectedPreset = ref('30d')
const dropdownOpen = ref(false)

const presets = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_quarter', label: 'Last quarter' },
  { value: 'custom', label: 'Custom range' },
]

const presetLabel = computed(() => {
  const found = presets.find((p) => p.value === selectedPreset.value)
  return found?.label || 'Last 30 days'
})

function getPresetRange(preset: string): { start: string; end: string } {
  const now = new Date()
  const end = now.toISOString().split('T')[0]

  switch (preset) {
    case '7d': {
      const s = new Date(now)
      s.setDate(s.getDate() - 6)
      return { start: s.toISOString().split('T')[0], end }
    }
    case '30d': {
      const s = new Date(now)
      s.setDate(s.getDate() - 29)
      return { start: s.toISOString().split('T')[0], end }
    }
    case 'this_month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: s.toISOString().split('T')[0], end }
    }
    case 'last_quarter': {
      const s = new Date(now)
      s.setDate(s.getDate() - 89)
      return { start: s.toISOString().split('T')[0], end }
    }
    default:
      return range.value
  }
}

function selectPreset(preset: string) {
  selectedPreset.value = preset
  if (preset !== 'custom') {
    setRange(getPresetRange(preset))
    dropdownOpen.value = false
  }
}

function onCustomStart(e: Event) {
  const val = (e.target as HTMLInputElement).value
  setRange({ ...range.value, start: val })
}

function onCustomEnd(e: Event) {
  const val = (e.target as HTMLInputElement).value
  setRange({ ...range.value, end: val })
}

// Close dropdown on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      dropdownOpen.value = false
    }
  })
})
</script>
```

- [ ] **Step 3: Verify TopBar + DateRangePicker**

Run: `npm run dev`
Check: TopBar shows title, date picker dropdown, search input, notification/help icons. Date range picker dropdown opens on click, presets change the range.

- [ ] **Step 4: Commit**

```bash
git add components/ui/TopBar.vue components/ui/DateRangePicker.vue
git commit -m "feat: redesign TopBar with date picker, search, notifications, and help"
```

---

### Task 4: Add CampaignPerformance Type

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add the CampaignPerformance interface**

Append to the end of `types/index.ts`:

```typescript
export interface CampaignPerformance {
  campaign: AffiliateCampaign
  trafficSource: string
  clickThrough: number
  revenue: number
  status: 'Active' | 'Pending'
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add CampaignPerformance type"
```

---

### Task 5: Create useDashboardStats Composable

**Files:**
- Create: `composables/useDashboardStats.ts`

- [ ] **Step 1: Create the composable**

```typescript
import type { DateRange, ActivityBooking, AffiliateCampaign, DailyTraffic, CampaignPerformance } from '~/types'

export function useDashboardStats() {
  function getPreviousPeriod(range: DateRange): DateRange {
    const startDate = new Date(range.start)
    const endDate = new Date(range.end)
    const durationMs = endDate.getTime() - startDate.getTime()

    const prevEnd = new Date(startDate.getTime() - 1) // day before current start
    const prevStart = new Date(prevEnd.getTime() - durationMs)

    return {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0],
    }
  }

  function percentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  function getTopCampaigns(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[],
  ): CampaignPerformance[] {
    // Sum revenue per campaign slug from bookings
    const revenueMap = new Map<string, number>()
    for (const b of bookings) {
      const slug = b.first_campaign || ''
      revenueMap.set(slug, (revenueMap.get(slug) || 0) + b.total_price)
    }

    // Sum sessions per campaign from traffic
    const totalSessions = trafficData.reduce((sum, t) => sum + t.sessions, 0)
    const sessionMap = new Map<string, number>()
    for (const t of trafficData) {
      sessionMap.set(t.campaign, (sessionMap.get(t.campaign) || 0) + t.sessions)
    }

    // Build performance entries for each campaign
    const results: CampaignPerformance[] = campaigns.map((c) => {
      const revenue = revenueMap.get(c.campaign_slug) || 0
      const sessions = sessionMap.get(c.campaign_slug) || 0
      const clickThrough = totalSessions > 0 ? Number(((sessions / totalSessions) * 100).toFixed(1)) : 0

      return {
        campaign: c,
        trafficSource: c.campaign_name,
        clickThrough,
        revenue,
        status: c.is_active ? 'Active' as const : 'Pending' as const,
      }
    })

    // Sort by revenue descending
    return results.sort((a, b) => b.revenue - a.revenue)
  }

  function getTopDestination(
    bookings: ActivityBooking[],
    campaigns: AffiliateCampaign[],
    trafficData: DailyTraffic[],
  ): { campaign: AffiliateCampaign; revenue: number; conversionRate: number; healthPercent: number } | null {
    // Group bookings by campaign slug
    const revenueMap = new Map<string, { revenue: number; count: number }>()
    for (const b of bookings) {
      const slug = b.first_campaign || ''
      const existing = revenueMap.get(slug) || { revenue: 0, count: 0 }
      existing.revenue += b.total_price
      existing.count++
      revenueMap.set(slug, existing)
    }

    // Find highest revenue campaign slug
    let topSlug = ''
    let topRevenue = 0
    for (const [slug, data] of revenueMap) {
      if (data.revenue > topRevenue) {
        topSlug = slug
        topRevenue = data.revenue
      }
    }

    if (!topSlug) return null

    const campaign = campaigns.find((c) => c.campaign_slug === topSlug)
    if (!campaign) return null

    const bookingCount = revenueMap.get(topSlug)?.count || 0

    // Get sessions for this campaign
    const sessions = trafficData
      .filter((t) => t.campaign === topSlug)
      .reduce((sum, t) => sum + t.sessions, 0)

    const conversionRate = sessions > 0 ? Number(((bookingCount / sessions) * 100).toFixed(1)) : 0
    const healthPercent = sessions > 0 ? Math.min(100, Math.round((bookingCount / sessions) * 100)) : 0

    return { campaign, revenue: topRevenue, conversionRate, healthPercent }
  }

  return { getPreviousPeriod, percentChange, getTopCampaigns, getTopDestination }
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useDashboardStats.ts
git commit -m "feat: add useDashboardStats composable for period comparison and top campaigns"
```

---

### Task 6: Add fetchAllBookings to useEarnings

**Files:**
- Modify: `composables/useEarnings.ts`

- [ ] **Step 1: Add fetchAllBookings function**

Add this function after the existing `fetchBookings` function, and export it in the return statement:

```typescript
async function fetchAllBookings(range: DateRange): Promise<ActivityBooking[]> {
  const { data, error } = await client
    .from('activity_bookings')
    .select('id, booking_id, product_title, start_date_time, total_price, currency, status, affiliate_id, first_campaign, created_at')
    .gte('start_date_time', range.start)
    .lte('start_date_time', range.end + 'T23:59:59')
    .order('start_date_time', { ascending: false })

  if (error) throw error
  return (data || []) as ActivityBooking[]
}
```

Update the return statement to include `fetchAllBookings`:

```typescript
return {
  fetchBookings,
  fetchAllBookings,
  calculateCommission,
  summarizeByMonth,
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useEarnings.ts
git commit -m "feat: add fetchAllBookings for unfiltered booking queries"
```

---

### Task 7: Redesign KpiCard

**Files:**
- Modify: `components/dashboard/KpiCard.vue`

- [ ] **Step 1: Rewrite KpiCard.vue**

Replace the entire file:

```vue
<template>
  <div
    :class="[
      'p-6 rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] border-none',
      highlight
        ? 'bg-primary-container text-on-primary'
        : 'bg-surface-container-lowest',
    ]"
  >
    <p
      :class="[
        'text-xs font-bold tracking-wider uppercase mb-2',
        highlight ? 'text-on-primary opacity-80' : 'text-on-surface-variant',
      ]"
    >
      {{ label }}
    </p>
    <div class="flex items-baseline gap-2">
      <h3
        :class="[
          'text-3xl font-extrabold font-headline',
          highlight ? '' : 'text-on-surface',
        ]"
      >
        {{ formattedValue }}
      </h3>
      <span
        v-if="change !== undefined"
        :class="[
          'text-xs font-bold',
          highlight
            ? 'bg-white/20 px-1.5 py-0.5 rounded'
            : change >= 0
              ? 'text-emerald-600'
              : 'text-error',
        ]"
      >
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
    </div>
    <div
      v-if="progress !== undefined"
      :class="[
        'mt-4 h-1 w-full rounded-full overflow-hidden',
        highlight ? 'bg-white/20' : 'bg-surface-container-high',
      ]"
    >
      <div
        :class="[
          'h-full rounded-full',
          highlight ? 'bg-white' : 'bg-primary-container',
        ]"
        :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  change?: number
  progress?: number
  highlight?: boolean
}>()

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(props.value)
    case 'percent':
      return `${props.value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(props.value))
  }
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/KpiCard.vue
git commit -m "feat: redesign KPI cards with change indicators and progress bars"
```

---

### Task 8: Restyle TrafficChart

**Files:**
- Modify: `components/dashboard/TrafficChart.vue`

- [ ] **Step 1: Rewrite TrafficChart.vue**

Replace the entire file:

```vue
<template>
  <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h3 class="text-lg font-bold text-on-surface font-headline">Traffic Over Time</h3>
        <p class="text-sm text-zinc-500">Comparing Sessions and Users</p>
      </div>
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-primary-container" />
          <span class="text-xs font-semibold text-zinc-600">Sessions</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-zinc-300" />
          <span class="text-xs font-semibold text-zinc-600">Users</span>
        </div>
      </div>
    </div>
    <div class="h-[250px]">
      <ChartsLineChart
        v-if="labels.length"
        :labels="labels"
        :datasets="datasets"
      />
      <div v-else class="flex items-center justify-center h-full text-zinc-400 text-sm">
        No traffic data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic } from '~/types'

const props = defineProps<{ data: DailyTraffic[] }>()

const byDate = computed(() => {
  const map = new Map<string, { sessions: number; users: number }>()
  for (const row of props.data) {
    const existing = map.get(row.date) || { sessions: 0, users: 0 }
    existing.sessions += row.sessions
    existing.users += row.total_users
    map.set(row.date, existing)
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
})

const labels = computed(() => [...byDate.value.keys()])

const datasets = computed(() => [
  {
    label: 'Sessions',
    data: [...byDate.value.values()].map((v) => v.sessions),
    borderColor: '#2dba7d',
    backgroundColor: 'rgba(45, 186, 125, 0.1)',
    fill: true,
  },
  {
    label: 'Users',
    data: [...byDate.value.values()].map((v) => v.users),
    borderColor: '#d1d5db',
    borderDash: [6, 4],
  },
])
</script>
```

- [ ] **Step 2: Update LineChart.vue to support borderDash**

In `components/charts/LineChart.vue`, update the `datasets` prop interface and the `chartData` computed to pass through `borderDash`:

Add `borderDash?: number[]` to the dataset type in the props:

```typescript
const props = defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    borderDash?: number[]
  }[]
  yTitle?: string
}>()
```

In the `chartData` computed, add `borderDash` to the dataset mapping:

```typescript
const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.borderColor || ['#2dba7d', '#d1d5db', '#f59e0b', '#ef4444'][i % 4],
    backgroundColor: ds.backgroundColor || (ds.fill
      ? ['rgba(45,186,125,0.1)', 'rgba(209,213,219,0.1)', 'rgba(245,158,11,0.1)', 'rgba(239,68,68,0.1)'][i % 4]
      : 'transparent'),
    fill: ds.fill || false,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 5,
    borderDash: ds.borderDash || [],
  })),
}))
```

Also hide the default legend since TrafficChart now has its own:

```typescript
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: props.yTitle ? { display: true, text: props.yTitle } : undefined,
    },
  },
}))
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/TrafficChart.vue components/charts/LineChart.vue
git commit -m "feat: restyle traffic chart with emerald colors and custom legend"
```

---

### Task 9: Replace FunnelChart with HTML Bars

**Files:**
- Modify: `components/dashboard/FunnelChart.vue`

- [ ] **Step 1: Rewrite FunnelChart.vue**

Replace the entire file:

```vue
<template>
  <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
    <div class="mb-8">
      <h3 class="text-lg font-bold text-on-surface font-headline">Conversion Funnel</h3>
      <p class="text-sm text-zinc-500">User journey from view to purchase</p>
    </div>

    <div v-if="steps.length" class="space-y-6">
      <div v-for="(step, i) in steps" :key="step.name" class="space-y-2">
        <div class="flex justify-between text-xs font-bold text-on-surface-variant">
          <span>{{ step.label }}</span>
          <span>{{ step.count.toLocaleString() }} ({{ step.percentage }}%)</span>
        </div>
        <div :class="['h-8 w-full rounded-lg overflow-hidden', barBgColors[i]]">
          <div
            :class="['h-full rounded-lg', barColors[i]]"
            :style="{ width: step.barWidth + '%' }"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-48 text-zinc-400 text-sm">
      No funnel data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyEvent } from '~/types'

const props = defineProps<{ data: DailyEvent[] }>()

const funnelOrder = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']
const funnelLabels: Record<string, string> = {
  view_item: 'View Item',
  add_to_cart: 'Add to Cart',
  begin_checkout: 'Begin Checkout',
  purchase: 'Purchase',
}

const barColors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-600']
const barBgColors = ['bg-blue-500/10', 'bg-blue-400/10', 'bg-blue-300/10', 'bg-blue-200/10']

const aggregated = computed(() => {
  const map = new Map<string, number>()
  for (const row of props.data) {
    map.set(row.event_name, (map.get(row.event_name) || 0) + row.event_count)
  }
  return map
})

const steps = computed(() => {
  const available = funnelOrder.filter((e) => aggregated.value.has(e))
  if (available.length === 0) return []

  const maxCount = aggregated.value.get(available[0]) || 1

  return available.map((name) => {
    const count = aggregated.value.get(name) || 0
    const percentage = maxCount > 0 ? Number(((count / maxCount) * 100).toFixed(1)) : 0
    // Bar width: proportional but minimum 15% so the bar is visible
    const barWidth = maxCount > 0 ? Math.max(15, (count / maxCount) * 100) : 0

    return {
      name,
      label: funnelLabels[name] || name,
      count,
      percentage,
      barWidth,
    }
  })
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/FunnelChart.vue
git commit -m "feat: replace funnel Chart.js with styled HTML horizontal bars"
```

---

### Task 10: Redesign RecentBookings Table

**Files:**
- Modify: `components/dashboard/RecentBookings.vue`

- [ ] **Step 1: Rewrite RecentBookings.vue**

Replace the entire file:

```vue
<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10">
      <h3 class="text-xl font-bold text-on-surface font-headline">Recent Bookings</h3>
    </div>

    <div v-if="bookings.length" class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tour Name</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Price (EUR)</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Campaign</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="(b, i) in bookings.slice(0, 10)"
            :key="b.id"
            :class="[
              'hover:bg-primary-container/5 transition-colors',
              i % 2 === 1 ? 'bg-surface-container-low/30' : '',
            ]"
          >
            <td class="px-8 py-5 text-sm">{{ formatDate(b.start_date_time) }}</td>
            <td class="px-8 py-5 text-sm font-semibold">{{ b.product_title }}</td>
            <td class="px-8 py-5 text-sm">{{ formatCurrency(b.total_price) }}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant">{{ b.first_campaign || '-' }}</td>
            <td class="px-8 py-5">
              <span :class="statusBadgeClass(b.status)">
                {{ normalizeStatus(b.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No bookings yet
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ActivityBooking } from '~/types'

defineProps<{ bookings: ActivityBooking[] }>()

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase()
  if (s === 'confirmed') return 'Confirmed'
  if (s === 'pending') return 'Pending'
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
  return status
}

function statusBadgeClass(status: string): string {
  const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider'
  const s = status.toLowerCase()
  if (s === 'confirmed') return `${base} bg-emerald-100 text-emerald-700`
  if (s === 'pending') return `${base} bg-amber-100 text-amber-700`
  if (s === 'cancelled' || s === 'canceled') return `${base} bg-red-100 text-red-700`
  return `${base} bg-zinc-100 text-zinc-600`
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/RecentBookings.vue
git commit -m "feat: redesign bookings table with status badges and new styling"
```

---

### Task 11: Create PerformanceChart Component

**Files:**
- Create: `components/dashboard/PerformanceChart.vue`

- [ ] **Step 1: Create PerformanceChart.vue**

```vue
<template>
  <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
    <div class="flex justify-between items-end mb-10">
      <div>
        <h3 class="text-xl font-bold text-on-surface font-headline">Performance Over Time</h3>
        <p class="text-sm text-zinc-500">Revenue trends for the selected period</p>
      </div>
      <div class="flex bg-surface-container-low p-1 rounded-lg">
        <button
          v-for="p in periods"
          :key="p.value"
          :class="[
            'px-4 py-1.5 text-xs font-bold rounded-md transition-all',
            activePeriod === p.value ? 'bg-white shadow-sm text-on-surface' : 'text-zinc-500',
          ]"
          @click="activePeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    <div class="h-[300px]">
      <Line v-if="chartLabels.length" :data="chartData" :options="chartOptions" />
      <div v-else class="flex items-center justify-center h-full text-zinc-400 text-sm">
        No revenue data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import type { ActivityBooking } from '~/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const props = defineProps<{ bookings: ActivityBooking[] }>()

const periods = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
]

const activePeriod = ref('30d')

const periodDays = computed(() => {
  switch (activePeriod.value) {
    case '30d': return 30
    case '90d': return 90
    case '1y': return 365
    default: return 30
  }
})

const filteredBookings = computed(() => {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - periodDays.value)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return props.bookings.filter((b) => b.start_date_time.slice(0, 10) >= cutoffStr)
})

const revenueByDate = computed(() => {
  const map = new Map<string, number>()
  for (const b of filteredBookings.value) {
    const date = b.start_date_time.slice(0, 10)
    map.set(date, (map.get(date) || 0) + b.total_price)
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
})

const chartLabels = computed(() => [...revenueByDate.value.keys()])
const chartValues = computed(() => [...revenueByDate.value.values()])

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Revenue',
      data: chartValues.value,
      borderColor: '#006c45',
      backgroundColor: (ctx: any) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 300)
        gradient.addColorStop(0, 'rgba(0, 108, 69, 0.2)')
        gradient.addColorStop(1, 'rgba(0, 108, 69, 0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 3,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#191c1c',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => `€${ctx.parsed.y.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10, weight: 'bold' as const }, color: '#a1a1aa', maxTicksLimit: 6 },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(188, 202, 190, 0.1)' },
      ticks: {
        font: { size: 10 },
        color: '#a1a1aa',
        callback: (val: any) => `€${val.toLocaleString()}`,
      },
    },
  },
}))
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/PerformanceChart.vue
git commit -m "feat: add PerformanceChart component with gradient fill and period toggle"
```

---

### Task 12: Create TopDestination Component

**Files:**
- Create: `components/dashboard/TopDestination.vue`

- [ ] **Step 1: Create TopDestination.vue**

```vue
<template>
  <div class="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between overflow-hidden relative group min-h-[420px]">
    <!-- Background image -->
    <img
      v-if="imageExists"
      src="/images/destination-placeholder.jpg"
      alt=""
      class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700"
    />

    <template v-if="campaign">
      <div class="relative z-10">
        <span class="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Top Destination
        </span>
        <h3 class="text-2xl font-bold mt-4 leading-tight text-on-surface font-headline">
          {{ campaign.campaign_name }}
        </h3>
        <p class="mt-2 text-on-surface-variant text-sm">
          Your most profitable campaign this month with a {{ conversionRate }}% conversion rate.
        </p>
      </div>

      <div class="relative z-10 mt-8">
        <div class="flex justify-between text-xs font-bold mb-2">
          <span>Campaign Health</span>
          <span>{{ healthPercent }}%</span>
        </div>
        <div class="h-2 w-full bg-surface-container-highest rounded-full">
          <div
            class="h-full bg-primary rounded-full"
            :style="{ width: healthPercent + '%' }"
          />
        </div>
        <NuxtLink
          to="/campaigns"
          class="mt-6 w-full py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-sm hover:shadow-md transition-shadow block text-center"
        >
          View Campaign Details
        </NuxtLink>
      </div>
    </template>

    <div v-else class="relative z-10 flex items-center justify-center h-full text-zinc-400 text-sm">
      No campaign data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AffiliateCampaign } from '~/types'

defineProps<{
  campaign: AffiliateCampaign | null
  revenue: number
  conversionRate: number
  healthPercent: number
}>()

// Check if placeholder image exists (it may not on first run)
const imageExists = ref(true)
onMounted(() => {
  const img = new Image()
  img.onload = () => { imageExists.value = true }
  img.onerror = () => { imageExists.value = false }
  img.src = '/images/destination-placeholder.jpg'
})
</script>
```

- [ ] **Step 2: Add a placeholder image**

Download or create a placeholder at `public/images/destination-placeholder.jpg`. For now, create the directory:

```bash
mkdir -p public/images
```

The component gracefully handles a missing image — it just renders without the background.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/TopDestination.vue
git commit -m "feat: add TopDestination campaign highlight card"
```

---

### Task 13: Create TopCampaigns Component

**Files:**
- Create: `components/dashboard/TopCampaigns.vue`

- [ ] **Step 1: Create TopCampaigns.vue**

```vue
<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10 flex justify-between items-center">
      <h3 class="text-xl font-bold text-on-surface font-headline">Top Performing Campaigns</h3>
      <button
        class="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
        @click="exportCsv"
      >
        Export Report
        <span class="material-symbols-outlined text-sm">download</span>
      </button>
    </div>

    <div v-if="visibleCampaigns.length" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Campaign Name</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Traffic Source</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Click-Through</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Revenue</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="item in visibleCampaigns"
            :key="item.campaign.id"
            class="hover:bg-surface-container-low transition-colors"
          >
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <span class="material-symbols-outlined text-lg">{{ getCampaignIcon(item.campaign) }}</span>
                </div>
                <span class="font-bold text-on-surface">{{ item.campaign.campaign_name }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-sm text-on-surface-variant">{{ item.trafficSource }}</td>
            <td class="px-8 py-6 text-sm font-semibold">{{ item.clickThrough }}%</td>
            <td class="px-8 py-6 text-sm font-bold text-on-surface">{{ formatCurrency(item.revenue) }}</td>
            <td class="px-8 py-6">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  item.status === 'Active'
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
                ]"
              >
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No campaign data available
    </div>

    <div
      v-if="filteredCampaigns.length > displayCount"
      class="p-6 bg-surface-container-low/30 flex justify-center"
    >
      <button
        class="text-sm font-bold text-zinc-500 hover:text-primary transition-colors"
        @click="displayCount += 5"
      >
        Load More Campaigns
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CampaignPerformance } from '~/types'

const props = defineProps<{ campaigns: CampaignPerformance[] }>()

const searchQuery = useState<string>('campaignSearch', () => '')
const displayCount = ref(5)

const filteredCampaigns = computed(() => {
  if (!searchQuery.value) return props.campaigns
  const q = searchQuery.value.toLowerCase()
  return props.campaigns.filter((c) =>
    c.campaign.campaign_name.toLowerCase().includes(q),
  )
})

const visibleCampaigns = computed(() => filteredCampaigns.value.slice(0, displayCount.value))

function getCampaignIcon(campaign: { campaign_name: string; campaign_type: string }): string {
  const name = campaign.campaign_name.toLowerCase()
  if (name.includes('coast') || name.includes('boat') || name.includes('sea')) return 'sailing'
  if (name.includes('wine') || name.includes('tasting')) return 'wine_bar'
  if (name.includes('hik') || name.includes('mountain') || name.includes('adventure')) return 'hiking'
  if (name.includes('food') || name.includes('culinary')) return 'restaurant'
  if (name.includes('art') || name.includes('museum') || name.includes('history')) return 'museum'
  return 'campaign'
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}

function exportCsv() {
  const header = 'Campaign Name,Traffic Source,Click-Through,Revenue,Status'
  const rows = props.campaigns.map((c) =>
    `"${c.campaign.campaign_name}","${c.trafficSource}",${c.clickThrough}%,€${c.revenue.toFixed(2)},${c.status}`,
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'top-campaigns.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/TopCampaigns.vue
git commit -m "feat: add TopCampaigns table with search filter and CSV export"
```

---

### Task 14: Wire Up Dashboard Page

**Files:**
- Modify: `pages/index.vue`

- [ ] **Step 1: Rewrite index.vue**

Replace the entire file:

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
import type { DailyTraffic, DailyEvent, ActivityBooking, KpiData, CampaignPerformance } from '~/types'

const { range } = useDateRange()
const { fetchDailyTraffic, fetchDailyEvents, aggregateTraffic } = useTraffic()
const { fetchBookings, fetchAllBookings, calculateCommission } = useEarnings()
const { fetchCampaigns } = useCampaigns()
const { getPreviousPeriod, percentChange, getTopCampaigns, getTopDestination } = useDashboardStats()

const trafficData = ref<DailyTraffic[]>([])
const eventsData = ref<DailyEvent[]>([])
const bookings = ref<ActivityBooking[]>([])
const allBookings = ref<ActivityBooking[]>([])
const campaigns = ref<Awaited<ReturnType<typeof fetchCampaigns>>>([])

// Previous period data for change indicators
const prevTrafficData = ref<DailyTraffic[]>([])
const prevBookings = ref<ActivityBooking[]>([])

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

// Progress bars: scale each KPI to a rough percentage for visual weight
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
    fetchDailyTraffic(range.value),
    fetchDailyEvents(range.value),
    fetchBookings(range.value),
    fetchAllBookings(range.value),
    fetchCampaigns(),
    fetchDailyTraffic(prevRange),
    fetchBookings(prevRange),
  ])

  trafficData.value = traffic
  eventsData.value = events
  bookings.value = bk
  allBookings.value = allBk
  campaigns.value = camp
  prevTrafficData.value = prevTraffic
  prevBookings.value = prevBk
}

watch(range, loadData, { immediate: true })
</script>
```

- [ ] **Step 2: Remove date picker from index.vue**

The date picker is now in the TopBar, so it's been removed from the page template. Verify it no longer appears duplicated.

- [ ] **Step 3: Verify the full dashboard**

Run: `npm run dev`
Open http://localhost:6001 and verify:
- 5 KPI cards with change indicators and progress bars, Revenue card highlighted in green
- Traffic Over Time chart (emerald line + gray dashed)
- Conversion Funnel with horizontal bars
- Recent Bookings table with status badges
- Performance Over Time chart with gradient and period toggle
- Top Destination card
- Top Performing Campaigns table with search filtering and export
- Date picker in TopBar, search works to filter campaigns table

- [ ] **Step 4: Commit**

```bash
git add pages/index.vue
git commit -m "feat: wire up redesigned dashboard with all new components"
```

---

### Task 15: Final Visual Polish + Cleanup

**Files:**
- All modified files

- [ ] **Step 1: Remove the date picker from other pages that still import it inline**

Check `pages/traffic.vue`, `pages/earnings.vue` — if they have `<UiDateRangePicker />` inline, keep them for now since those pages haven't been redesigned yet. The TopBar already shows the picker globally, so they'll get it for free. But if a page has its own `<UiDateRangePicker />`, remove it to avoid duplication.

- [ ] **Step 2: Verify responsive behavior**

Open http://localhost:6001 at mobile width (< 1024px). Verify:
- Sidebar hidden by default, hamburger menu in TopBar toggles it
- KPI cards stack (1 column on mobile, 5 on desktop)
- Charts stack vertically
- Tables scroll horizontally
- Search bar hidden on mobile (`hidden md:block`)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final polish and cleanup for dashboard redesign"
```
