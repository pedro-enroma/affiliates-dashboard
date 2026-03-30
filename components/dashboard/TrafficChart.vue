<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h3 class="text-sm font-medium text-gray-500 mb-4">Traffic Overview</h3>
    <div class="h-64">
      <ChartsLineChart
        v-if="labels.length"
        :labels="labels"
        :datasets="datasets"
        y-title="Count"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        No traffic data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyTraffic } from '~/types'

const props = defineProps<{ data: DailyTraffic[] }>()

// Aggregate by date across campaigns
const byDate = computed(() => {
  const map = new Map<string, { sessions: number; users: number; pageViews: number }>()
  for (const row of props.data) {
    const existing = map.get(row.date) || { sessions: 0, users: 0, pageViews: 0 }
    existing.sessions += row.sessions
    existing.users += row.total_users
    existing.pageViews += row.page_views
    map.set(row.date, existing)
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
})

const labels = computed(() => [...byDate.value.keys()])

const datasets = computed(() => [
  {
    label: 'Sessions',
    data: [...byDate.value.values()].map((v) => v.sessions),
    fill: true,
  },
  {
    label: 'Users',
    data: [...byDate.value.values()].map((v) => v.users),
  },
])
</script>
