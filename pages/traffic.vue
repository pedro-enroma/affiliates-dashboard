<template>
  <div class="space-y-6">
    <!-- Page content (date picker is in TopBar) -->

    <!-- Traffic over time -->
    <DashboardTrafficChart :data="trafficData" />

    <!-- Demographics row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Country breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Top Countries</h3>
        <div class="h-64">
          <ChartsDoughnutChart
            v-if="countryLabels.length"
            :labels="countryLabels"
            :data="countryValues"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
            No country data
          </div>
        </div>
      </div>

      <!-- Device breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Devices</h3>
        <div class="h-64">
          <ChartsBarChart
            v-if="deviceLabels.length"
            :labels="deviceLabels"
            :datasets="[{ label: 'Sessions', data: deviceValues, backgroundColor: '#3b82f6' }]"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
            No device data
          </div>
        </div>
      </div>
    </div>

    <!-- Traffic table -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h3 class="text-sm font-medium text-gray-500 mb-4">Daily Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100">
              <th class="pb-2 font-medium">Date</th>
              <th class="pb-2 font-medium text-right">Sessions</th>
              <th class="pb-2 font-medium text-right">Users</th>
              <th class="pb-2 font-medium text-right">New Users</th>
              <th class="pb-2 font-medium text-right">Page Views</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dailyRows" :key="row.date" class="border-b border-gray-50">
              <td class="py-2 text-gray-600">{{ row.date }}</td>
              <td class="py-2 text-right">{{ row.sessions.toLocaleString() }}</td>
              <td class="py-2 text-right">{{ row.users.toLocaleString() }}</td>
              <td class="py-2 text-right">{{ row.newUsers.toLocaleString() }}</td>
              <td class="py-2 text-right">{{ row.pageViews.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic } from '~/types'

const { range } = useDateRange()
const { fetchDailyTraffic, fetchDemographics, aggregateDemographics } = useTraffic()

const trafficData = ref<DailyTraffic[]>([])
const countryData = ref<{ label: string; sessions: number; users: number }[]>([])
const deviceData = ref<{ label: string; sessions: number; users: number }[]>([])

const countryLabels = computed(() => countryData.value.slice(0, 10).map((d) => d.label))
const countryValues = computed(() => countryData.value.slice(0, 10).map((d) => d.sessions))
const deviceLabels = computed(() => deviceData.value.map((d) => d.label))
const deviceValues = computed(() => deviceData.value.map((d) => d.sessions))

// Aggregate daily rows (across campaigns)
const dailyRows = computed(() => {
  const map = new Map<string, { sessions: number; users: number; newUsers: number; pageViews: number }>()
  for (const row of trafficData.value) {
    const existing = map.get(row.date) || { sessions: 0, users: 0, newUsers: 0, pageViews: 0 }
    existing.sessions += row.sessions
    existing.users += row.total_users
    existing.newUsers += row.new_users
    existing.pageViews += row.page_views
    map.set(row.date, existing)
  }
  return [...map.entries()]
    .map(([date, val]) => ({ date, ...val }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

async function loadData() {
  const [traffic, countries, devices] = await Promise.all([
    fetchDailyTraffic(range.value),
    fetchDemographics(range.value, 'country'),
    fetchDemographics(range.value, 'device_category'),
  ])
  trafficData.value = traffic
  countryData.value = aggregateDemographics(countries)
  deviceData.value = aggregateDemographics(devices)
}

watch(range, loadData, { immediate: true })
</script>
