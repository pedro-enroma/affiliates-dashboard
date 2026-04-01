<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-emerald-50/50 backdrop-blur-xl shadow-[20px_0_40px_rgba(25,28,28,0.03)] flex flex-col p-6 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex flex-col gap-1 mb-10">
      <div class="flex items-center gap-3">
        <img src="/images/enroma-logo.png" alt="EnRoma.com" class="h-10 w-auto" />
        <div>
          <h1 class="text-xl font-bold text-emerald-900 tracking-tight font-headline">EnRoma.com</h1>
          <div class="flex items-center gap-2">
            <p class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">{{ $t('brand_sub_admin') }}</p>
            <span class="bg-primary text-on-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Admin</span>
          </div>
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
        to="/admin/settings"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold tracking-tight transition-all active:scale-95 duration-200 mt-auto',
          isActive('/admin/settings')
            ? 'text-emerald-700 bg-white shadow-sm'
            : 'text-zinc-500 hover:bg-emerald-100/30',
        ]"
        @click="$emit('close')"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive('/admin/settings') ? `font-variation-settings: 'FILL' 1` : ''"
        >settings</span>
        <span>{{ $t('nav.settings') }}</span>
      </NuxtLink>
    </nav>

    <!-- User info + Sign out -->
    <div class="mt-6 pt-6 border-t border-outline-variant/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
          <span class="material-symbols-outlined text-sm">shield_person</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-on-surface truncate">Admin</p>
          <p class="text-xs text-zinc-500 truncate">{{ user?.email }}</p>
        </div>
      </div>

      <button
        class="w-full text-left text-sm text-zinc-500 hover:text-error transition-colors px-1"
        @click="signOut"
      >
        {{ $t('nav.sign_out') }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

const { t } = useI18n()

const mainNavItems = computed(() => [
  { path: '/admin', label: t('nav.dashboard'), icon: 'dashboard' },
  { path: '/admin/affiliates', label: t('nav.affiliates'), icon: 'group' },
  { path: '/admin/campaigns', label: t('nav.campaigns'), icon: 'campaign' },
])

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

async function signOut() {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
