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
