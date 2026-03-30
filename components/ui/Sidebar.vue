<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-emerald-50/50 backdrop-blur-xl shadow-[20px_0_40px_rgba(25,28,28,0.03)] flex flex-col p-6 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex flex-col gap-1 mb-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">explore</span>
        </div>
        <div>
          <h1 class="text-xl font-bold text-emerald-900 tracking-tight font-headline">NUMAtours</h1>
          <p class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Affiliate Portal</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-2 flex-grow">
      <NuxtLink
        v-for="item in mainNavItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200',
          isActive(item.path)
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive(item.path) ? `font-variation-settings: 'FILL' 1` : ''"
        >{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>

      <!-- Settings pushed to bottom -->
      <NuxtLink
        to="/settings"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200 mt-auto',
          isActive('/settings')
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive('/settings') ? `font-variation-settings: 'FILL' 1` : ''"
        >settings</span>
        <span>Settings</span>
      </NuxtLink>
    </nav>

    <!-- User info -->
    <div class="mt-6 pt-6 border-t border-outline-variant/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-sm font-bold">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-on-surface truncate">{{ affiliate?.display_name || 'Loading...' }}</p>
          <p class="text-xs text-zinc-500 truncate">{{ affiliate?.email }}</p>
        </div>
      </div>

      <!-- Sign out -->
      <button
        class="w-full text-left text-sm text-zinc-500 hover:text-error transition-colors mb-4 px-1"
        @click="signOut"
      >
        Sign out
      </button>

      <!-- New Campaign button -->
      <NuxtLink
        to="/campaigns/create"
        class="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        New Campaign
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const client = useSupabaseClient()
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

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/traffic', label: 'Traffic', icon: 'analytics' },
  { path: '/earnings', label: 'Earnings', icon: 'payments' },
  { path: '/campaigns', label: 'Campaigns', icon: 'campaign' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function signOut() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
