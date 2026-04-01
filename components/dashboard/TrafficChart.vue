<template>
  <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h3 class="text-lg font-bold text-on-surface font-headline">{{ $t('dashboard.traffic_over_time') }}</h3>
        <p class="text-sm text-zinc-500">{{ $t('dashboard.comparing_sessions_users') }}</p>
      </div>
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-primary-container" />
          <span class="text-xs font-semibold text-zinc-600">{{ $t('dashboard.sessions_label') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-zinc-300" />
          <span class="text-xs font-semibold text-zinc-600">{{ $t('dashboard.users_label') }}</span>
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
        {{ $t('dashboard.no_traffic_data') }}
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
