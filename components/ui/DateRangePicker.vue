<template>
  <div class="relative group">
    <button
      class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface-variant hover:border-primary transition-colors"
      @click="dropdownOpen = !dropdownOpen"
    >
      <span class="material-symbols-outlined text-lg">calendar_today</span>
      <span>{{ presetLabel }}</span>
      <span class="material-symbols-outlined text-lg">expand_more</span>
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline-variant/10 z-50 overflow-hidden"
    >
      <button
        v-for="preset in presets"
        :key="preset.value"
        :class="[
          'w-full px-4 py-2.5 text-left text-sm transition-colors',
          selectedPreset === preset.value
            ? 'bg-primary-container/10 text-primary font-bold'
            : 'hover:bg-surface-container-low',
        ]"
        @click="selectPreset(preset.value)"
      >
        {{ preset.label }}
      </button>

      <div v-if="selectedPreset === 'custom'" class="px-4 py-3 border-t border-outline-variant/10 space-y-2">
        <input
          type="date"
          :value="range.start"
          class="w-full px-3 py-2 text-sm border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary-container"
          @input="onCustomStart"
        />
        <input
          type="date"
          :value="range.end"
          class="w-full px-3 py-2 text-sm border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary-container"
          @input="onCustomEnd"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { range, setRange } = useDateRange()
const selectedPreset = ref('30d')
const dropdownOpen = ref(false)

const presets = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_quarter', label: 'Last quarter' },
  { value: 'custom', label: 'Custom range' },
]

const presetLabel = computed(() => {
  const found = presets.find((p) => p.value === selectedPreset.value)
  return found?.label || 'Last 30 days'
})

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
    case 'this_month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: s.toISOString().split('T')[0], end }
    }
    case 'last_quarter': {
      const s = new Date(now)
      s.setDate(s.getDate() - 89)
      return { start: s.toISOString().split('T')[0], end }
    }
    default:
      return range.value
  }
}

function selectPreset(preset: string) {
  selectedPreset.value = preset
  if (preset !== 'custom') {
    setRange(getPresetRange(preset))
    dropdownOpen.value = false
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

// Close dropdown on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      dropdownOpen.value = false
    }
  })
})
</script>
