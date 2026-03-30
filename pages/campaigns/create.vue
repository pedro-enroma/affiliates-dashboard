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
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Campaign Slug</label>
        <input
          v-model="form.campaign_slug"
          required
          pattern="[a-z0-9-]+"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all font-mono"
          placeholder="e.g., summer-rome-blog"
        />
        <p class="text-xs text-zinc-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
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

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Type</label>
        <select
          v-model="form.campaign_type"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
        >
          <option value="link">Link</option>
          <option value="widget">Widget</option>
          <option value="banner">Banner</option>
        </select>
      </div>

      <!-- Preview -->
      <div v-if="previewLink" class="p-4 bg-surface-container-low rounded-xl">
        <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Generated Link Preview</p>
        <code class="text-sm text-on-surface break-all font-mono">{{ previewLink }}</code>
      </div>

      <!-- Widget embed code -->
      <div v-if="form.campaign_type === 'widget' && previewLink" class="p-4 bg-surface-container-low rounded-xl">
        <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Widget Embed Code</p>
        <pre class="text-sm text-on-surface font-mono whitespace-pre-wrap break-all">{{ widgetCode }}</pre>
        <button
          type="button"
          class="mt-2 text-sm text-primary font-bold hover:underline"
          @click="copyWidget"
        >
          Copy embed code
        </button>
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
  campaign_slug: '',
  destination_url: '',
  campaign_type: 'link',
})

const error = ref('')
const loading = ref(false)

const previewLink = computed(() => {
  if (!affiliate.value || !form.destination_url || !form.campaign_slug) return ''
  try {
    return generateLink(affiliate.value.affiliate_id, form.campaign_slug, form.destination_url)
  } catch {
    return ''
  }
})

const widgetCode = computed(() => {
  if (!previewLink.value) return ''
  return `<iframe src="${previewLink.value}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`
})

async function copyWidget() {
  await navigator.clipboard.writeText(widgetCode.value)
}

// Auto-generate slug from name
watch(() => form.campaign_name, (name) => {
  if (form.campaign_slug === '' || form.campaign_slug === slugify(form.campaign_name)) {
    form.campaign_slug = slugify(name)
  }
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function handleCreate() {
  error.value = ''
  loading.value = true

  try {
    await createCampaign({
      campaign_slug: form.campaign_slug,
      campaign_name: form.campaign_name,
      destination_url: form.destination_url,
      campaign_type: form.campaign_type,
    })
    router.push('/campaigns')
  } catch (e: any) {
    error.value = e.message
  }
  loading.value = false
}
</script>
