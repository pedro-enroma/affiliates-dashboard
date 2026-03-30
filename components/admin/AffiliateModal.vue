<template>
  <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center">
    <div class="fixed inset-0 bg-black/50" @click="$emit('close')" />
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8 z-10">
      <h2 class="text-xl font-bold text-on-surface font-headline mb-6">
        {{ mode === 'invite' ? 'Invite Affiliate' : 'Edit Affiliate' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            :disabled="mode === 'edit'"
            :class="[
              'w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all',
              mode === 'edit' ? 'bg-surface-container-low text-zinc-400' : '',
            ]"
            placeholder="affiliate@example.com"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Display Name</label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            placeholder="John's Travel Blog"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Affiliate ID</label>
          <input
            v-model="form.affiliateId"
            type="text"
            required
            :disabled="mode === 'edit'"
            :class="[
              'w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all font-mono',
              mode === 'edit' ? 'bg-surface-container-low text-zinc-400' : '',
            ]"
            placeholder="johns-travel-blog"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Commission %</label>
          <input
            v-model.number="form.commissionPercentage"
            type="number"
            required
            min="0"
            max="100"
            step="0.1"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Website URL</label>
          <input
            v-model="form.websiteUrl"
            type="url"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
            placeholder="https://example.com"
          />
        </div>

        <div v-if="mode === 'edit'">
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Bio</label>
          <textarea
            v-model="form.bio"
            rows="3"
            class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all resize-none"
            placeholder="Short bio..."
          />
        </div>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 bg-surface-container-low hover:bg-surface-container-high transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold text-on-primary bg-primary hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ saving ? 'Saving...' : mode === 'invite' ? 'Send Invite' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Affiliate } from '~/types'

const props = defineProps<{
  open: boolean
  mode: 'invite' | 'edit'
  affiliate?: Affiliate
  commission?: number
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { updateAffiliate, updateAffiliateCommission } = useAdminData()

const form = reactive({
  email: '',
  displayName: '',
  affiliateId: '',
  commissionPercentage: 10,
  websiteUrl: '',
  bio: '',
})

const error = ref('')
const saving = ref(false)

watch(() => props.open, (isOpen) => {
  if (isOpen && props.mode === 'edit' && props.affiliate) {
    form.email = props.affiliate.email
    form.displayName = props.affiliate.display_name
    form.affiliateId = props.affiliate.affiliate_id
    form.commissionPercentage = props.commission || 0
    form.websiteUrl = props.affiliate.website_url || ''
    form.bio = props.affiliate.bio || ''
  } else if (isOpen && props.mode === 'invite') {
    form.email = ''
    form.displayName = ''
    form.affiliateId = ''
    form.commissionPercentage = 10
    form.websiteUrl = ''
    form.bio = ''
  }
  error.value = ''
})

async function handleSubmit() {
  error.value = ''
  saving.value = true

  try {
    if (props.mode === 'invite') {
      await inviteAffiliate()
    } else {
      await editAffiliate()
    }
    emit('saved')
    emit('close')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Something went wrong'
  } finally {
    saving.value = false
  }
}

async function inviteAffiliate() {
  const session = useSupabaseSession()
  const token = session.value?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await $fetch('/api/admin/invite-affiliate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      email: form.email,
      displayName: form.displayName,
      affiliateId: form.affiliateId,
      commissionPercentage: form.commissionPercentage,
      websiteUrl: form.websiteUrl || undefined,
    },
  })

  if (!(res as any).success) {
    throw new Error((res as any).error || 'Invite failed')
  }
}

async function editAffiliate() {
  if (!props.affiliate) return

  await updateAffiliate(props.affiliate.id, {
    display_name: form.displayName,
    website_url: form.websiteUrl || null,
    bio: form.bio || null,
  })

  await updateAffiliateCommission(props.affiliate.affiliate_id, form.commissionPercentage)
}
</script>
