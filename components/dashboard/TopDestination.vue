<template>
  <div class="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between overflow-hidden relative group min-h-[420px]">
    <!-- Background image -->
    <img
      v-if="imageExists"
      :src="imageSrc"
      alt=""
      class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700"
    />

    <template v-if="campaign">
      <div class="relative z-10">
        <span class="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Top Destination
        </span>
        <h3 class="text-2xl font-bold mt-4 leading-tight text-on-surface font-headline">
          {{ campaign.campaign_name }}
        </h3>
        <p class="mt-2 text-on-surface-variant text-sm">
          Your most profitable campaign this month with a {{ conversionRate }}% conversion rate.
        </p>
      </div>

      <div class="relative z-10 mt-8">
        <div class="flex justify-between text-xs font-bold mb-2">
          <span>Campaign Health</span>
          <span>{{ healthPercent }}%</span>
        </div>
        <div class="h-2 w-full bg-surface-container-highest rounded-full">
          <div
            class="h-full bg-primary rounded-full"
            :style="{ width: healthPercent + '%' }"
          />
        </div>
        <NuxtLink
          to="/campaigns"
          class="mt-6 w-full py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-sm hover:shadow-md transition-shadow block text-center"
        >
          View Campaign Details
        </NuxtLink>
      </div>
    </template>

    <div v-else class="relative z-10 flex items-center justify-center h-full text-zinc-400 text-sm">
      No campaign data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AffiliateCampaign } from '~/types'

defineProps<{
  campaign: AffiliateCampaign | null
  revenue: number
  conversionRate: number
  healthPercent: number
}>()

const imageSrc = '/images/destination-placeholder.jpg'
const imageExists = ref(false)
onMounted(() => {
  const img = new Image()
  img.onload = () => { imageExists.value = true }
  img.onerror = () => { imageExists.value = false }
  img.src = imageSrc
})
</script>
