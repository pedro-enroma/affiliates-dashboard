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
