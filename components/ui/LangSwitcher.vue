<template>
  <div class="relative">
    <button
      class="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
      @click="open = !open"
    >
      <span class="material-symbols-outlined text-lg">language</span>
      <span class="uppercase text-xs font-bold tracking-wide">{{ locale }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-outline-variant/10 z-50 overflow-hidden"
    >
      <div class="flex">
        <button
          v-for="l in availableLocales"
          :key="l.code"
          :class="[
            'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors',
            locale === l.code
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:bg-surface-container-low',
          ]"
          @click="switchLang(l.code)"
        >
          {{ l.code }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const open = ref(false)

const availableLocales = computed(() =>
  (locales.value as Array<{ code: string; name: string }>),
)

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
