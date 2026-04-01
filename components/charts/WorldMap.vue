<template>
  <div ref="container" class="w-full h-full">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { Chart, Tooltip, Legend } from 'chart.js'
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo'
import * as topojson from 'topojson-client'

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale, Tooltip, Legend)

const props = defineProps<{
  data: { country: string; sessions: number }[]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
let chart: Chart | null = null

// Country name → ISO mapping for matching topojson features
const countryNameMap: Record<string, string> = {
  'United States': 'United States of America',
  'United Kingdom': 'United Kingdom',
  'South Korea': 'South Korea',
  'Czech Republic': 'Czech Republic',
  'Dominican Republic': 'Dominican Rep.',
}

function matchCountry(featureName: string, dataCountries: string[]): string | undefined {
  // Direct match
  if (dataCountries.includes(featureName)) return featureName
  // Reverse map match
  for (const [dataName, topoName] of Object.entries(countryNameMap)) {
    if (featureName === topoName && dataCountries.includes(dataName)) return dataName
  }
  return undefined
}

async function renderMap() {
  if (!canvas.value) return

  // Fetch world topology
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  const world = await res.json()
  const countries = (topojson as any).feature(world, world.objects.countries).features

  // Build lookup from our data
  const sessionMap = new Map<string, number>()
  for (const d of props.data) {
    sessionMap.set(d.country, d.sessions)
  }
  const dataCountries = props.data.map((d) => d.country)

  // Map features to data
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
          if (val === 0) return '#e6e9e8'
          const max = Math.max(...props.data.map((d) => d.sessions), 1)
          const ratio = val / max
          if (ratio > 0.7) return '#006c45'
          if (ratio > 0.4) return '#1da76a'
          if (ratio > 0.2) return '#2dba7d'
          if (ratio > 0.05) return '#5ade9d'
          return '#a1d2b3'
        },
        borderColor: '#ffffff',
        borderWidth: 0.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      showOutline: true,
      showGraticule: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#191c1c',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx: any) => {
              const val = ctx.raw?.value || 0
              return val > 0 ? `${val.toLocaleString()} sessions` : 'No data'
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
