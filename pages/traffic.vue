<template>
  <div class="space-y-8">
    <!-- Traffic over time -->
    <DashboardTrafficChart :data="trafficData" />

    <!-- Demographics row -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Country breakdown — heatmap style -->
      <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-on-surface font-headline">Top Countries</h3>
          <span v-if="countryData.length" class="text-xs text-on-surface-variant">{{ countryData.reduce((s, c) => s + c.sessions, 0).toLocaleString() }} total sessions</span>
        </div>
        <div v-if="countryData.length" class="space-y-3">
          <div
            v-for="(c, i) in countryData.slice(0, 12)"
            :key="c.label"
            class="group"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg w-7 text-center">{{ countryFlag(c.label) }}</span>
              <span class="text-sm font-semibold text-on-surface w-32 truncate">{{ c.label }}</span>
              <div class="flex-1 h-8 bg-surface-container-high/50 rounded-lg overflow-hidden relative">
                <div
                  class="h-full rounded-lg transition-all duration-1000 ease-out"
                  :style="{
                    width: `${Math.max(2, (c.sessions / maxCountrySessions) * 100)}%`,
                    backgroundColor: heatColor(c.sessions / maxCountrySessions),
                  }"
                />
                <span class="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-on-surface-variant">
                  {{ c.sessions.toLocaleString() }}
                </span>
              </div>
              <span class="text-xs text-on-surface-variant w-12 text-right">
                {{ ((c.sessions / totalCountrySessions) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-48 text-zinc-400 text-sm">
          No country data
        </div>
      </div>

      <!-- Device breakdown — donut with stats -->
      <div class="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8 flex flex-col">
        <h3 class="text-lg font-bold text-on-surface font-headline mb-6">Devices</h3>
        <div v-if="deviceData.length" class="flex-1 flex flex-col items-center justify-center">
          <div class="w-48 h-48 mb-6">
            <ChartsDoughnutChart
              :labels="deviceLabels"
              :data="deviceValues"
            />
          </div>
          <div class="w-full space-y-3">
            <div
              v-for="d in deviceData"
              :key="d.label"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg" :style="{ color: deviceIconColor(d.label) }">
                  {{ deviceIcon(d.label) }}
                </span>
                <span class="text-sm font-semibold text-on-surface capitalize">{{ d.label }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-on-surface">{{ d.sessions.toLocaleString() }}</span>
                <span class="text-xs text-on-surface-variant ml-1">
                  ({{ totalDeviceSessions > 0 ? ((d.sessions / totalDeviceSessions) * 100).toFixed(0) : 0 }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-zinc-400 text-sm">
          No device data
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
              <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Traffic Date</th>
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
              <td class="px-8 py-5 text-sm">{{ formatDate(row.date) }}</td>
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
const { formatDate } = useFormatDate()
const { fetchDailyTraffic, fetchDemographics, aggregateDemographics } = useTraffic()

const trafficData = ref<DailyTraffic[]>([])
const countryData = ref<{ label: string; sessions: number; users: number }[]>([])
const deviceData = ref<{ label: string; sessions: number; users: number }[]>([])

const deviceLabels = computed(() => deviceData.value.map((d) => d.label))
const deviceValues = computed(() => deviceData.value.map((d) => d.sessions))

const maxCountrySessions = computed(() => {
  if (!countryData.value.length) return 1
  return countryData.value[0].sessions || 1
})

const totalCountrySessions = computed(() =>
  countryData.value.reduce((sum, c) => sum + c.sessions, 0) || 1,
)

const totalDeviceSessions = computed(() =>
  deviceData.value.reduce((sum, d) => sum + d.sessions, 0),
)

function heatColor(ratio: number): string {
  // Green heat gradient: low = light emerald, high = deep emerald
  if (ratio > 0.8) return '#006c45'
  if (ratio > 0.6) return '#0d8a58'
  if (ratio > 0.4) return '#1da76a'
  if (ratio > 0.2) return '#2dba7d'
  if (ratio > 0.1) return '#5ade9d'
  return '#a1d2b3'
}

const countryFlags: Record<string, string> = {
  'Spain': '🇪🇸', 'Mexico': '🇲🇽', 'Argentina': '🇦🇷', 'Colombia': '🇨🇴', 'Chile': '🇨🇱',
  'Peru': '🇵🇪', 'Italy': '🇮🇹', 'United States': '🇺🇸', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Brazil': '🇧🇷', 'United Kingdom': '🇬🇧', 'Portugal': '🇵🇹', 'Ecuador': '🇪🇨', 'Venezuela': '🇻🇪',
  'Uruguay': '🇺🇾', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾', 'Costa Rica': '🇨🇷', 'Panama': '🇵🇦',
  'Dominican Republic': '🇩🇴', 'Guatemala': '🇬🇹', 'Honduras': '🇭🇳', 'El Salvador': '🇸🇻',
  'Nicaragua': '🇳🇮', 'Cuba': '🇨🇺', 'Puerto Rico': '🇵🇷', 'Canada': '🇨🇦', 'Australia': '🇦🇺',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'India': '🇮🇳', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
  'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Ireland': '🇮🇪', 'Singapore': '🇸🇬', 'South Korea': '🇰🇷',
  'Russia': '🇷🇺', 'Poland': '🇵🇱', 'Czech Republic': '🇨🇿', 'Romania': '🇷🇴', 'Turkey': '🇹🇷',
  'Israel': '🇮🇱', 'South Africa': '🇿🇦', 'Philippines': '🇵🇭', 'Thailand': '🇹🇭', 'Malaysia': '🇲🇾',
}

function countryFlag(name: string): string {
  return countryFlags[name] || '🌍'
}

function deviceIcon(label: string): string {
  const l = label.toLowerCase()
  if (l === 'desktop') return 'computer'
  if (l === 'mobile') return 'smartphone'
  if (l === 'tablet') return 'tablet'
  return 'devices'
}

function deviceIconColor(label: string): string {
  const l = label.toLowerCase()
  if (l === 'desktop') return '#006c45'
  if (l === 'mobile') return '#2dba7d'
  if (l === 'tablet') return '#5ade9d'
  return '#a1d2b3'
}

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
