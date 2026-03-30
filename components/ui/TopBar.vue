<template>
  <header class="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-zinc-50/80 backdrop-blur-md flex justify-between items-center px-10 h-20 border-b border-outline-variant/10">
    <!-- Mobile menu button -->
    <button class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-container-high" @click="$emit('toggle-sidebar')">
      <span class="material-symbols-outlined">menu</span>
    </button>

    <!-- Page title -->
    <h2 class="font-headline text-2xl font-bold text-on-surface">{{ pageTitle }}</h2>

    <div class="flex items-center gap-6">
      <!-- Date Range Picker -->
      <UiDateRangePicker />

      <!-- Search -->
      <div class="relative w-64 hidden md:block">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
        <input
          :value="searchQuery"
          class="w-full pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-container transition-all font-body"
          placeholder="Search campaigns..."
          @input="onSearchInput"
        />
      </div>

      <!-- Notification & Help -->
      <div class="flex items-center gap-4">
        <div class="relative">
          <button
            class="p-2 text-zinc-500 hover:text-emerald-500 transition-colors active:opacity-80"
            @click="showNotifications = !showNotifications"
          >
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <div
            v-if="showNotifications"
            class="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-outline-variant/10 p-4 z-50"
          >
            <p class="text-sm text-zinc-400 text-center">No new notifications</p>
          </div>
        </div>
        <a
          href="https://enroma.com/help"
          target="_blank"
          class="p-2 text-zinc-500 hover:text-emerald-500 transition-colors active:opacity-80"
        >
          <span class="material-symbols-outlined">help</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const showNotifications = ref(false)

const searchQuery = useState<string>('campaignSearch', () => '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = val
  }, 300)
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/traffic': 'Traffic Analytics',
    '/earnings': 'Earnings',
    '/campaigns': 'Campaigns',
    '/campaigns/create': 'Create Campaign',
    '/settings': 'Settings',
  }
  return titles[route.path] || 'Dashboard'
})

// Close notifications dropdown on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showNotifications.value = false
    }
  })
})
</script>
