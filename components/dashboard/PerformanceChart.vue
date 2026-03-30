<template>
  <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
    <div class="flex justify-between items-end mb-10">
      <div>
        <h3 class="text-xl font-bold text-on-surface font-headline">Performance Over Time</h3>
        <p class="text-sm text-zinc-500">Revenue trends for the selected period</p>
      </div>
      <div class="flex bg-surface-container-low p-1 rounded-lg">
        <button
          v-for="p in periods"
          :key="p.value"
          :class="[
            'px-4 py-1.5 text-xs font-bold rounded-md transition-all',
            activePeriod === p.value ? 'bg-white shadow-sm text-on-surface' : 'text-zinc-500',
          ]"
          @click="activePeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    <div class="h-[300px]">
      <Line v-if="chartLabels.length" :data="chartData" :options="chartOptions" />
      <div v-else class="flex items-center justify-center h-full text-zinc-400 text-sm">
        No revenue data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import type { ActivityBooking } from '~/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const props = defineProps<{ bookings: ActivityBooking[] }>()

const periods = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
]

const activePeriod = ref('30d')

const periodDays = computed(() => {
  switch (activePeriod.value) {
    case '30d': return 30
    case '90d': return 90
    case '1y': return 365
    default: return 30
  }
})

const filteredBookings = computed(() => {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - periodDays.value)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return props.bookings.filter((b) => b.start_date_time.slice(0, 10) >= cutoffStr)
})

const revenueByDate = computed(() => {
  const map = new Map<string, number>()
  for (const b of filteredBookings.value) {
    const date = b.start_date_time.slice(0, 10)
    map.set(date, (map.get(date) || 0) + b.total_price)
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
})

const chartLabels = computed(() => [...revenueByDate.value.keys()])
const chartValues = computed(() => [...revenueByDate.value.values()])

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Revenue',
      data: chartValues.value,
      borderColor: '#006c45',
      backgroundColor: (ctx: any) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 300)
        gradient.addColorStop(0, 'rgba(0, 108, 69, 0.2)')
        gradient.addColorStop(1, 'rgba(0, 108, 69, 0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 3,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#191c1c',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => `€${ctx.parsed.y.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10, weight: 'bold' as const }, color: '#a1a1aa', maxTicksLimit: 6 },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(188, 202, 190, 0.1)' },
      ticks: {
        font: { size: 10 },
        color: '#a1a1aa',
        callback: (val: any) => `€${val.toLocaleString()}`,
      },
    },
  },
}))
</script>
