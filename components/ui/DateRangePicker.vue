<template>
  <div class="flex items-center gap-2">
    <select
      v-model="selectedPreset"
      class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      @change="onPresetChange"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="this_month">This month</option>
      <option value="last_month">Last month</option>
      <option value="custom">Custom</option>
    </select>

    <template v-if="selectedPreset === 'custom'">
      <input
        type="date"
        :value="range.start"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        @input="onCustomStart"
      />
      <span class="text-gray-400">to</span>
      <input
        type="date"
        :value="range.end"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        @input="onCustomEnd"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const { range, setRange } = useDateRange()
const selectedPreset = ref('30d')

function getPresetRange(preset: string): { start: string; end: string } {
  const now = new Date()
  const end = now.toISOString().split('T')[0]

  switch (preset) {
    case '7d': {
      const s = new Date(now)
      s.setDate(s.getDate() - 6)
      return { start: s.toISOString().split('T')[0], end }
    }
    case '30d': {
      const s = new Date(now)
      s.setDate(s.getDate() - 29)
      return { start: s.toISOString().split('T')[0], end }
    }
    case '90d': {
      const s = new Date(now)
      s.setDate(s.getDate() - 89)
      return { start: s.toISOString().split('T')[0], end }
    }
    case 'this_month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: s.toISOString().split('T')[0], end }
    }
    case 'last_month': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] }
    }
    default:
      return range.value
  }
}

function onPresetChange() {
  if (selectedPreset.value !== 'custom') {
    setRange(getPresetRange(selectedPreset.value))
  }
}

function onCustomStart(e: Event) {
  const val = (e.target as HTMLInputElement).value
  setRange({ ...range.value, start: val })
}

function onCustomEnd(e: Event) {
  const val = (e.target as HTMLInputElement).value
  setRange({ ...range.value, end: val })
}
</script>
