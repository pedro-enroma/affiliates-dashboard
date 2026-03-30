<template>
  <section class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] overflow-hidden">
    <div class="p-8 border-b border-outline-variant/10 flex justify-between items-center">
      <h3 class="text-xl font-bold text-on-surface font-headline">Top Performing Campaigns</h3>
      <button
        class="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
        @click="exportCsv"
      >
        Export Report
        <span class="material-symbols-outlined text-sm">download</span>
      </button>
    </div>

    <div v-if="visibleCampaigns.length" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low/50">
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Campaign Name</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Traffic Source</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Click-Through</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Revenue</th>
            <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          <tr
            v-for="item in visibleCampaigns"
            :key="item.campaign.id"
            class="hover:bg-surface-container-low transition-colors"
          >
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <span class="material-symbols-outlined text-lg">{{ getCampaignIcon(item.campaign) }}</span>
                </div>
                <span class="font-bold text-on-surface">{{ item.campaign.campaign_name }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-sm text-on-surface-variant">{{ item.trafficSource }}</td>
            <td class="px-8 py-6 text-sm font-semibold">{{ item.clickThrough }}%</td>
            <td class="px-8 py-6 text-sm font-bold text-on-surface">{{ formatCurrency(item.revenue) }}</td>
            <td class="px-8 py-6">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  item.status === 'Active'
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
                ]"
              >
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-zinc-400 text-sm">
      No campaign data available
    </div>

    <div
      v-if="filteredCampaigns.length > displayCount"
      class="p-6 bg-surface-container-low/30 flex justify-center"
    >
      <button
        class="text-sm font-bold text-zinc-500 hover:text-primary transition-colors"
        @click="displayCount += 5"
      >
        Load More Campaigns
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CampaignPerformance } from '~/types'

const props = defineProps<{ campaigns: CampaignPerformance[] }>()

const searchQuery = useState<string>('campaignSearch', () => '')
const displayCount = ref(5)

const filteredCampaigns = computed(() => {
  if (!searchQuery.value) return props.campaigns
  const q = searchQuery.value.toLowerCase()
  return props.campaigns.filter((c) =>
    c.campaign.campaign_name.toLowerCase().includes(q),
  )
})

const visibleCampaigns = computed(() => filteredCampaigns.value.slice(0, displayCount.value))

function getCampaignIcon(campaign: { campaign_name: string; campaign_type: string }): string {
  const name = campaign.campaign_name.toLowerCase()
  if (name.includes('coast') || name.includes('boat') || name.includes('sea')) return 'sailing'
  if (name.includes('wine') || name.includes('tasting')) return 'wine_bar'
  if (name.includes('hik') || name.includes('mountain') || name.includes('adventure')) return 'hiking'
  if (name.includes('food') || name.includes('culinary')) return 'restaurant'
  if (name.includes('art') || name.includes('museum') || name.includes('history')) return 'museum'
  return 'campaign'
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)
}

function exportCsv() {
  const header = 'Campaign Name,Traffic Source,Click-Through,Revenue,Status'
  const rows = props.campaigns.map((c) =>
    `"${c.campaign.campaign_name}","${c.trafficSource}",${c.clickThrough}%,€${c.revenue.toFixed(2)},${c.status}`,
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'top-campaigns.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
