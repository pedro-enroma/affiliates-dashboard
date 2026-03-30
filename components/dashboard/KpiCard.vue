<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <p class="text-sm font-medium text-gray-500">{{ label }}</p>
    <p class="mt-1 text-2xl font-bold text-gray-900">{{ formattedValue }}</p>
    <p v-if="subtitle" class="mt-1 text-xs text-gray-400">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  subtitle?: string
}>()

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(props.value)
    case 'percent':
      return `${props.value.toFixed(2)}%`
    default:
      return new Intl.NumberFormat('en-US').format(props.value)
  }
})
</script>
