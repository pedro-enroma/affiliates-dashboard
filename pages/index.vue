<template>
  <div class="space-y-6">
    <!-- Date range picker -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <UiDateRangePicker />
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <DashboardKpiCard label="Sessions" :value="kpis.sessions" />
      <DashboardKpiCard label="Bookings" :value="kpis.bookings" />
      <DashboardKpiCard label="Revenue" :value="kpis.revenue" format="currency" />
      <DashboardKpiCard label="Commission" :value="kpis.commission" format="currency" />
      <DashboardKpiCard label="Conversion" :value="kpis.conversionRate" format="percent" />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardTrafficChart :data="trafficData" />
      <DashboardFunnelChart :data="eventsData" />
    </div>

    <!-- Recent bookings -->
    <DashboardRecentBookings :bookings="bookings" />
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic, DailyEvent, ActivityBooking, KpiData } from '~/types'

const { range } = useDateRange()
const { fetchDailyTraffic, fetchDailyEvents, aggregateTraffic } = useTraffic()
const { fetchBookings, calculateCommission } = useEarnings()

const trafficData = ref<DailyTraffic[]>([])
const eventsData = ref<DailyEvent[]>([])
const bookings = ref<ActivityBooking[]>([])

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

async function loadData() {
  const [traffic, events, bk] = await Promise.all([
    fetchDailyTraffic(range.value),
    fetchDailyEvents(range.value),
    fetchBookings(range.value),
  ])
  trafficData.value = traffic
  eventsData.value = events
  bookings.value = bk
}

watch(range, loadData, { immediate: true })
</script>
