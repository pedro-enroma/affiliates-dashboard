<template>
  <div ref="container" class="w-full h-full relative">
    <canvas ref="canvas" />
    <!-- Color legend -->
    <div class="absolute bottom-2 left-4 flex items-center gap-2">
      <span class="text-[10px] text-on-surface-variant font-semibold">Less</span>
      <div class="flex h-2 rounded-full overflow-hidden">
        <div class="w-6 bg-[#e6e9e8]" />
        <div class="w-6 bg-[#c8eed8]" />
        <div class="w-6 bg-[#78fbb8]" />
        <div class="w-6 bg-[#5ade9d]" />
        <div class="w-6 bg-[#2dba7d]" />
        <div class="w-6 bg-[#1da76a]" />
        <div class="w-6 bg-[#006c45]" />
      </div>
      <span class="text-[10px] text-on-surface-variant font-semibold">More</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, Tooltip } from 'chart.js'
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo'
import * as topojson from 'topojson-client'

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale, Tooltip)

const props = defineProps<{
  data: { country: string; sessions: number }[]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
let chart: Chart | null = null
let worldData: any = null

const countryNameMap: Record<string, string> = {
  'United States': 'United States of America',
  'Dominican Republic': 'Dominican Rep.',
  'Czech Republic': 'Czechia',
  'South Korea': 'Korea',
  'North Korea': 'Dem. Rep. Korea',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Central African Republic': 'Central African Rep.',
  'Ivory Coast': "Côte d'Ivoire",
  'Democratic Republic of the Congo': 'Dem. Rep. Congo',
  'Republic of the Congo': 'Congo',
  'Equatorial Guinea': 'Eq. Guinea',
  'Solomon Islands': 'Solomon Is.',
  'South Sudan': 'S. Sudan',
  'Western Sahara': 'W. Sahara',
}

function matchCountry(featureName: string, dataCountries: string[]): string | undefined {
  if (dataCountries.includes(featureName)) return featureName
  for (const [dataName, topoName] of Object.entries(countryNameMap)) {
    if (featureName === topoName && dataCountries.includes(dataName)) return dataName
  }
  return undefined
}

function interpolateColor(ratio: number): string {
  // Smooth gradient from light to dark emerald
  const stops = [
    { pos: 0,    r: 200, g: 238, b: 216 }, // #c8eed8
    { pos: 0.15, r: 120, g: 251, b: 184 }, // #78fbb8
    { pos: 0.3,  r: 90,  g: 222, b: 157 }, // #5ade9d
    { pos: 0.5,  r: 45,  g: 186, b: 125 }, // #2dba7d
    { pos: 0.7,  r: 29,  g: 167, b: 106 }, // #1da76a
    { pos: 1,    r: 0,   g: 108, b: 69  }, // #006c45
  ]

  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i].pos && ratio <= stops[i + 1].pos) {
      const t = (ratio - stops[i].pos) / (stops[i + 1].pos - stops[i].pos)
      const r = Math.round(stops[i].r + t * (stops[i + 1].r - stops[i].r))
      const g = Math.round(stops[i].g + t * (stops[i + 1].g - stops[i].g))
      const b = Math.round(stops[i].b + t * (stops[i + 1].b - stops[i].b))
      return `rgb(${r},${g},${b})`
    }
  }
  return 'rgb(0,108,69)'
}

async function renderMap() {
  if (!canvas.value) return

  if (!worldData) {
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    worldData = await res.json()
  }

  const countries = (topojson as any).feature(worldData, worldData.objects.countries).features

  const sessionMap = new Map<string, number>()
  for (const d of props.data) {
    sessionMap.set(d.country, d.sessions)
  }
  const dataCountries = props.data.map((d) => d.country)
  const maxSessions = Math.max(...props.data.map((d) => d.sessions), 1)

  const dataset = countries.map((f: any) => {
    const name = f.properties.name
    const matched = matchCountry(name, dataCountries)
    return {
      feature: f,
      value: matched ? (sessionMap.get(matched) || 0) : 0,
    }
  })

  if (chart) chart.destroy()

  chart = new Chart(canvas.value, {
    type: 'choropleth' as any,
    data: {
      labels: countries.map((f: any) => f.properties.name),
      datasets: [{
        label: 'Sessions',
        data: dataset,
        backgroundColor: (ctx: any) => {
          const val = ctx.raw?.value || 0
          if (val === 0) return '#f2f4f3'
          return interpolateColor(val / maxSessions)
        },
        borderColor: '#ffffff',
        borderWidth: 0.3,
        hoverBorderColor: '#006c45',
        hoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
      },
      showOutline: true,
      showGraticule: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#191c1c',
          titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' as const },
          bodyFont: { family: 'Manrope', size: 12 },
          titleColor: '#ffffff',
          bodyColor: '#a1d2b3',
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title: (items: any[]) => items[0]?.label || '',
            label: (ctx: any) => {
              const val = ctx.raw?.value || 0
              if (val === 0) return 'No sessions'
              const pct = ((val / maxSessions) * 100).toFixed(1)
              return `${val.toLocaleString()} sessions (${pct}%)`
            },
          },
        },
      },
      scales: {
        projection: {
          axis: 'x',
          projection: 'equalEarth',
        } as any,
        color: {
          axis: 'x',
          display: false,
        } as any,
      },
    } as any,
  })
}

watch(() => props.data, () => {
  if (props.data.length) renderMap()
}, { deep: true })

onMounted(() => {
  if (props.data.length) renderMap()
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
