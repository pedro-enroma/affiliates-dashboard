<template>
  <div class="max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/campaigns" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Create Campaign</h1>
    </div>

    <form @submit.prevent="handleCreate" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
        <input
          v-model="form.campaign_name"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Summer Rome Blog Post"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Slug</label>
        <input
          v-model="form.campaign_slug"
          required
          pattern="[a-z0-9-]+"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., summer-rome-blog"
        />
        <p class="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only. Used in the URL.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
        <input
          v-model="form.destination_url"
          required
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://enroma.com/tours/colosseum-guided-tour"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          v-model="form.campaign_type"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="link">Link</option>
          <option value="widget">Widget</option>
          <option value="banner">Banner</option>
        </select>
      </div>

      <!-- Preview -->
      <div v-if="previewLink" class="p-4 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Generated Link Preview</p>
        <code class="text-sm text-gray-700 break-all">{{ previewLink }}</code>
      </div>

      <!-- Widget embed code -->
      <div v-if="form.campaign_type === 'widget' && previewLink" class="p-4 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Widget Embed Code</p>
        <pre class="text-sm text-gray-700 whitespace-pre-wrap break-all">{{ widgetCode }}</pre>
        <button
          type="button"
          class="mt-2 text-sm text-primary-600 hover:text-primary-700"
          @click="copyWidget"
        >
          Copy embed code
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {{ loading ? 'Creating...' : 'Create Campaign' }}
      </button>
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
