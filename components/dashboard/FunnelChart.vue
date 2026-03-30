<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h3 class="text-sm font-medium text-gray-500 mb-4">Conversion Funnel</h3>
    <div class="h-64">
      <ChartsBarChart
        v-if="labels.length"
        :labels="labels"
        :datasets="[{ label: 'Events', data: values, backgroundColor: '#3b82f6' }]"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        No funnel data available
      </div>
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

const aggregated = computed(() => {
  const map = new Map<string, number>()
  for (const row of props.data) {
    map.set(row.event_name, (map.get(row.event_name) || 0) + row.event_count)
  }
  return map
})

const labels = computed(() =>
  funnelOrder.filter((e) => aggregated.value.has(e)).map((e) => funnelLabels[e] || e),
)

const values = computed(() =>
  funnelOrder.filter((e) => aggregated.value.has(e)).map((e) => aggregated.value.get(e) || 0),
)
</script>
