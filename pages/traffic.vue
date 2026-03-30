<template>
  <div class="space-y-8">
    <!-- Traffic over time -->
    <DashboardTrafficChart :data="trafficData" />

    <!-- Demographics row -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Country breakdown -->
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
        <h3 class="text-lg font-bold text-on-surface font-headline mb-6">Top Countries</h3>
        <div class="h-64">
          <ChartsDoughnutChart
            v-if="countryLabels.length"
            :labels="countryLabels"
            :data="countryValues"
          />
          <div v-else class="flex items-center justify-center h-full text-zinc-400 text-sm">
            No country data
          </div>
        </div>
      </div>

      <!-- Device breakdown -->
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
        <h3 class="text-lg font-bold text-on-surface font-headline mb-6">Devices</h3>
        <div class="h-64">
          <ChartsBarChart
            v-if="deviceLabels.length"
            :labels="deviceLabels"
            :datasets="[{ label: 'Sessions', data: deviceValues, backgroundColor: '#2dba7d' }]"
          />
          <div v-else class="flex items-center justify-center h-full text-zinc-400 text-sm">
            No device data
          </div>
        </div>
      </div>
    </section>

    <!-- Traffic table -->
    <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
      <div class="p-8 border-b border-outline-variant/10">
        <h3 class="text-lg font-bold text-on-surface font-headline">Daily Breakdown</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low/50">
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Sessions</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Users</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">New Users</th>
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Page Views</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            <tr
              v-for="(row, i) in dailyRows"
              :key="row.date"
              :class="['hover:bg-primary-container/5 transition-colors', i % 2 === 1 ? 'bg-surface-container-low/30' : '']"
            >
              <td class="px-8 py-5 text-sm">{{ row.date }}</td>
              <td class="px-8 py-5 text-sm text-right font-semibold">{{ row.sessions.toLocaleString() }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ row.users.toLocaleString() }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ row.newUsers.toLocaleString() }}</td>
              <td class="px-8 py-5 text-sm text-right">{{ row.pageViews.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic } from '~/types'

const { range } = useDateRange()
const { affiliate } = useAffiliate()
const { fetchDailyTraffic, fetchDemographics, aggregateDemographics } = useTraffic()

const trafficData = ref<DailyTraffic[]>([])
const countryData = ref<{ label: string; sessions: number; users: number }[]>([])
const deviceData = ref<{ label: string; sessions: number; users: number }[]>([])

const countryLabels = computed(() => countryData.value.slice(0, 10).map((d) => d.label))
const countryValues = computed(() => countryData.value.slice(0, 10).map((d) => d.sessions))
const deviceLabels = computed(() => deviceData.value.map((d) => d.label))
const deviceValues = computed(() => deviceData.value.map((d) => d.sessions))

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
  const aid = affiliate.value?.affiliate_id
  if (!aid) return

  const [traffic, countries, devices] = await Promise.all([
    fetchDailyTraffic(range.value, aid),
    fetchDemographics(range.value, 'country', aid),
    fetchDemographics(range.value, 'device_category', aid),
  ])
  trafficData.value = traffic
  countryData.value = aggregateDemographics(countries)
  deviceData.value = aggregateDemographics(devices)
}

watch([range, () => affiliate.value?.affiliate_id], loadData, { immediate: true })
</script>
