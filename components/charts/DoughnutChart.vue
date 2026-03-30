<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
}>()

const defaultColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors || defaultColors.slice(0, props.data.length),
      borderWidth: 2,
      borderColor: '#fff',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
  },
}
</script>
