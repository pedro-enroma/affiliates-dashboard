<template>
  <div class="space-y-8">
    <!-- Campaign list -->
    <div v-if="campaigns.length" class="space-y-4">
      <div
        v-for="c in campaigns"
        :key="c.id"
        class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-on-surface font-headline text-lg">{{ c.campaign_name }}</h3>
            <div class="flex items-center gap-3 mt-2">
              <span class="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-wider">
                {{ c.campaign_type }}
              </span>
              <span class="text-sm text-on-surface-variant font-mono">{{ c.campaign_slug }}</span>
            </div>
          </div>
          <button
            class="p-2 text-zinc-400 hover:text-error transition-colors rounded-lg hover:bg-red-50"
            title="Delete"
            @click="handleDelete(c.id)"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>

        <!-- Generated link -->
        <div class="mt-4 p-4 bg-surface-container-low rounded-xl">
          <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Affiliate Link</p>
          <div class="flex items-center gap-3">
            <code class="flex-1 text-sm text-on-surface break-all font-mono">{{ getLink(c) }}</code>
            <button
              class="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1"
              @click="copyLink(c)"
            >
              <span class="material-symbols-outlined text-sm">content_copy</span>
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-16 text-center">
      <span class="material-symbols-outlined text-5xl text-zinc-300 mb-4">campaign</span>
      <p class="text-zinc-400 mb-4">No campaigns yet</p>
      <NuxtLink
        to="/campaigns/create"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        Create your first campaign
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AffiliateCampaign } from '~/types'

const { affiliate } = useAffiliate()
const { fetchCampaigns, deleteCampaign, generateLink } = useCampaigns()

const campaigns = ref<AffiliateCampaign[]>([])

function getLink(c: AffiliateCampaign) {
  if (!affiliate.value) return ''
  // campaign_slug format: "source_campaign" — split to extract utm_source and utm_campaign
  const parts = c.campaign_slug.split('_')
  const utmSource = parts[0] || c.campaign_slug
  const utmCampaign = parts.slice(1).join('_') || c.campaign_slug
  return generateLink(affiliate.value.affiliate_id, utmSource, utmCampaign, c.destination_url)
}

async function copyLink(c: AffiliateCampaign) {
  const link = getLink(c)
  await navigator.clipboard.writeText(link)
}

async function handleDelete(id: number) {
  if (!confirm('Delete this campaign?')) return
  await deleteCampaign(id)
  campaigns.value = campaigns.value.filter((c) => c.id !== id)
}

onMounted(async () => {
  const aid = affiliate.value?.affiliate_id
  if (aid) {
    campaigns.value = await fetchCampaigns(aid)
  }
})
</script>
