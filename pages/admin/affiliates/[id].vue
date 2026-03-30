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

    <!-- Traffic chart -->
    <DashboardTrafficChart :data="trafficData" />

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

async function loadProfile() {
  const { data } = await client
    .from('affiliates')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .maybeSingle()

  affiliateProfile.value = data as Affiliate | null
  commissionRate.value = await fetchAffiliateCommission(affiliateId)
}

const kpis = computed<KpiData>(() => {
  const traffic = aggregateTraffic(trafficData.value)
  const totalBookings = bookings.value.length
  const totalRevenue = bookings.value.reduce((sum, b) => sum + b.total_price, 0)
  const totalCommission = bookings.value.reduce((sum, b) => sum + (b.affiliate_commission || 0), 0)
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
  const totalCommission = prevBookings.value.reduce((sum, b) => sum + (b.affiliate_commission || 0), 0)
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

loadProfile()
watch(range, loadData, { immediate: true })
</script>
