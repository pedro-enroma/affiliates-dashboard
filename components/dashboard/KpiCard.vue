<template>
  <div
    :class="[
      'p-6 rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] border-none',
      highlight
        ? 'bg-primary-container text-on-primary'
        : 'bg-surface-container-lowest',
    ]"
  >
    <p
      :class="[
        'text-xs font-bold tracking-wider uppercase mb-2',
        highlight ? 'text-on-primary opacity-80' : 'text-on-surface-variant',
      ]"
    >
      {{ label }}
    </p>
    <div class="flex items-baseline gap-2">
      <h3
        :class="[
          'text-3xl font-extrabold font-headline',
          highlight ? '' : 'text-on-surface',
        ]"
      >
        {{ formattedValue }}
      </h3>
      <span
        v-if="change !== undefined"
        :class="[
          'text-xs font-bold',
          highlight
            ? 'bg-white/20 px-1.5 py-0.5 rounded'
            : change >= 0
              ? 'text-emerald-600'
              : 'text-error',
        ]"
      >
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
    </div>
    <div
      v-if="progress !== undefined"
      :class="[
        'mt-4 h-1 w-full rounded-full overflow-hidden',
        highlight ? 'bg-white/20' : 'bg-surface-container-high',
      ]"
    >
      <div
        :class="[
          'h-full rounded-full',
          highlight ? 'bg-white' : 'bg-primary-container',
        ]"
        :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  change?: number
  progress?: number
  highlight?: boolean
}>()

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(props.value)
    case 'percent':
      return `${props.value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(props.value))
  }
})
</script>
