<template>
  <div class="max-w-2xl space-y-8">
    <div class="flex items-center gap-4">
      <NuxtLink to="/campaigns" class="text-zinc-400 hover:text-primary transition-colors">
        <span class="material-symbols-outlined">arrow_back</span>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-on-surface font-headline">Create Campaign</h1>
    </div>

    <form @submit.prevent="handleCreate" class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8 space-y-5">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Campaign Name</label>
        <input
          v-model="form.campaign_name"
          required
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="e.g., Summer Rome Blog Post"
        />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
          Source (utm_source)
        </label>
        <input
          v-model="form.utm_source"
          required
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="e.g., myblog.com, instagram, youtube"
        />
        <p class="text-xs text-zinc-400 mt-1">Website or platform where the link will be shown.</p>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Destination URL</label>
        <input
          v-model="form.destination_url"
          required
          type="url"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="https://enroma.com/tours/colosseum-guided-tour"
        />
      </div>

      <!-- UTM Preview -->
      <div class="p-4 bg-surface-container-low rounded-xl space-y-3">
        <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">UTM Parameters</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span class="text-on-surface-variant">affiliate_id</span>
          <span class="font-mono text-on-surface">{{ affiliate?.affiliate_id || '...' }}</span>
          <span class="text-on-surface-variant">utm_medium</span>
          <span class="font-mono text-on-surface">affiliate</span>
          <span class="text-on-surface-variant">utm_source</span>
          <span class="font-mono text-on-surface">{{ form.utm_source ? form.utm_source.toLowerCase().trim() : '...' }}</span>
          <span class="text-on-surface-variant">utm_campaign</span>
          <span class="font-mono text-on-surface">{{ utmCampaign || '...' }}</span>
        </div>
      </div>

      <!-- Generated Link Preview -->
      <div v-if="previewLink" class="p-4 bg-surface-container-low rounded-xl">
        <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Generated Link</p>
        <code class="text-sm text-on-surface break-all font-mono">{{ previewLink }}</code>
      </div>

      <p v-if="error" class="text-sm text-error">{{ error }}</p>

      <div class="flex gap-3 pt-2">
        <NuxtLink
          to="/campaigns"
          class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 bg-surface-container-low hover:bg-surface-container-high transition-colors text-center"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {{ loading ? 'Creating...' : 'Create Campaign' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { affiliate } = useAffiliate()
const { createCampaign, generateLink } = useCampaigns()

const form = reactive({
  campaign_name: '',
  utm_source: '',
  destination_url: '',
})

const error = ref('')
const loading = ref(false)

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const utmCampaign = computed(() => slugify(form.campaign_name))

const previewLink = computed(() => {
  if (!affiliate.value || !form.destination_url || !form.campaign_name || !form.utm_source) return ''
  try {
    return generateLink(
      affiliate.value.affiliate_id,
      form.utm_source.toLowerCase().trim(),
      utmCampaign.value,
      form.destination_url,
    )
  } catch {
    return ''
  }
})

async function handleCreate() {
  error.value = ''
  loading.value = true

  const campaignSlug = form.utm_source.toLowerCase().trim() + '_' + utmCampaign.value

  try {
    await createCampaign({
      campaign_slug: campaignSlug,
      campaign_name: form.campaign_name,
      destination_url: form.destination_url,
      campaign_type: 'link',
    })
    router.push('/campaigns')
  } catch (e: any) {
    error.value = e.message
  }
  loading.value = false
}
</script>
