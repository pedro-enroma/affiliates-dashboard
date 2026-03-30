<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
  }[]
  horizontal?: boolean
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.backgroundColor || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
    borderRadius: 4,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? ('y' as const) : ('x' as const),
  plugins: {
    legend: { display: props.datasets.length > 1 },
  },
  scales: {
    y: { beginAtZero: true },
  },
}))
</script>
