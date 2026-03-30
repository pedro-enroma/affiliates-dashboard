<template>
  <header class="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
    <!-- Mobile menu button -->
    <button class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100" @click="$emit('toggle-sidebar')">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Page title -->
    <h2 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h2>

    <div class="flex-1" />

    <!-- Sign out -->
    <button
      class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      @click="signOut"
    >
      Sign out
    </button>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const client = useSupabaseClient()

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

async function signOut() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
