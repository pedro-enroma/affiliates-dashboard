<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">NUMAtours</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.path)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
          @click="$emit('close')"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User info -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ affiliate?.display_name || 'Loading...' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ affiliate?.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const { affiliate } = useAffiliate()

const initials = computed(() => {
  const name = affiliate.value?.display_name || ''
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const navItems = [
  { path: '/', label: 'Dashboard', icon: '\u{1F4CA}' },
  { path: '/traffic', label: 'Traffic', icon: '\u{1F310}' },
  { path: '/earnings', label: 'Earnings', icon: '\u{1F4B0}' },
  { path: '/campaigns', label: 'Campaigns', icon: '\u{1F517}' },
  { path: '/settings', label: 'Settings', icon: '\u{2699}\u{FE0F}' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
