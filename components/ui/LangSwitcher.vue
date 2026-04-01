<template>
  <div class="relative">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
      @click="open = !open"
    >
      <span class="text-base">{{ currentFlag }}</span>
      <span class="uppercase text-xs">{{ locale }}</span>
      <span class="material-symbols-outlined text-sm">expand_more</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-outline-variant/10 z-50 overflow-hidden"
    >
      <button
        v-for="l in locales"
        :key="l.code"
        :class="[
          'w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors',
          locale === l.code ? 'bg-primary-container/10 text-primary font-bold' : 'hover:bg-surface-container-low',
        ]"
        @click="switchLang(l.code)"
      >
        <span class="text-base">{{ flags[l.code] }}</span>
        {{ l.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const open = ref(false)

const flags: Record<string, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  it: '🇮🇹',
}

const currentFlag = computed(() => flags[locale.value] || '🌍')

function switchLang(code: string) {
  setLocale(code)
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      open.value = false
    }
  })
})
</script>
