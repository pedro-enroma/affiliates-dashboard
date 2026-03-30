<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Campaigns</h1>
      <NuxtLink
        to="/campaigns/create"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        Create Campaign
      </NuxtLink>
    </div>

    <!-- Campaign list -->
    <div v-if="campaigns.length" class="space-y-4">
      <div
        v-for="c in campaigns"
        :key="c.id"
        class="bg-white rounded-xl border border-gray-200 p-5"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium text-gray-900">{{ c.campaign_name }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {{ c.campaign_type }}
              </span>
              <span class="ml-2">{{ c.campaign_slug }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="text-sm text-red-500 hover:text-red-700"
              @click="handleDelete(c.id)"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Generated link -->
        <div class="mt-3 p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Affiliate Link</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 text-sm text-gray-700 break-all">{{ getLink(c) }}</code>
            <button
              class="text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
              @click="copyLink(c)"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <p class="text-gray-500">No campaigns yet</p>
      <NuxtLink
        to="/campaigns/create"
        class="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
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
  return generateLink(affiliate.value.affiliate_id, c.campaign_slug, c.destination_url)
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
  campaigns.value = await fetchCampaigns()
})
</script>
