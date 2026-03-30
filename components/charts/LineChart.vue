<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }[]
  yTitle?: string
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.borderColor || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
    backgroundColor: ds.backgroundColor || ds.fill
      ? (['rgba(59,130,246,0.1)', 'rgba(16,185,129,0.1)', 'rgba(245,158,11,0.1)', 'rgba(239,68,68,0.1)'][i % 4])
      : 'transparent',
    fill: ds.fill || false,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 5,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: props.yTitle ? { display: true, text: props.yTitle } : undefined,
    },
  },
}))
</script>
