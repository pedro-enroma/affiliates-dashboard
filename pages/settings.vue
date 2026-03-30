<template>
  <div class="max-w-2xl space-y-8">
    <!-- Profile -->
    <form @submit.prevent="updateProfile" class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8 space-y-5">
      <h2 class="text-lg font-bold text-on-surface font-headline">Profile</h2>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Display Name</label>
        <input
          v-model="profileForm.display_name"
          required
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
        />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Website URL</label>
        <input
          v-model="profileForm.website_url"
          type="url"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="https://yourblog.com"
        />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Bio</label>
        <textarea
          v-model="profileForm.bio"
          rows="3"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <p v-if="profileMsg" :class="profileError ? 'text-error' : 'text-primary'" class="text-sm font-semibold">
        {{ profileMsg }}
      </p>

      <button
        type="submit"
        :disabled="profileLoading"
        class="py-2.5 px-6 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {{ profileLoading ? 'Saving...' : 'Save Profile' }}
      </button>
    </form>

    <!-- Change Password -->
    <form @submit.prevent="changePassword" class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8 space-y-5">
      <h2 class="text-lg font-bold text-on-surface font-headline">Change Password</h2>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">New Password</label>
        <input
          v-model="passwordForm.password"
          type="password"
          required
          minlength="8"
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Confirm Password</label>
        <input
          v-model="passwordForm.confirm"
          type="password"
          required
          class="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary-container transition-all"
          placeholder="Repeat password"
        />
      </div>

      <p v-if="passwordMsg" :class="passwordError ? 'text-error' : 'text-primary'" class="text-sm font-semibold">
        {{ passwordMsg }}
      </p>

      <button
        type="submit"
        :disabled="passwordLoading"
        class="py-2.5 px-6 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {{ passwordLoading ? 'Updating...' : 'Update Password' }}
      </button>
    </form>

    <!-- Account info (read-only) -->
    <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
      <h2 class="text-lg font-bold text-on-surface font-headline mb-6">Account Info</h2>
      <dl class="space-y-4 text-sm">
        <div class="flex justify-between py-2 border-b border-outline-variant/10">
          <dt class="text-on-surface-variant font-semibold">Affiliate ID</dt>
          <dd class="text-on-surface font-mono">{{ affiliate?.affiliate_id }}</dd>
        </div>
        <div class="flex justify-between py-2 border-b border-outline-variant/10">
          <dt class="text-on-surface-variant font-semibold">Email</dt>
          <dd class="text-on-surface">{{ affiliate?.email }}</dd>
        </div>
        <div class="flex justify-between py-2 border-b border-outline-variant/10">
          <dt class="text-on-surface-variant font-semibold">Commission Rate</dt>
          <dd class="text-on-surface font-bold">{{ commissionRate }}%</dd>
        </div>
        <div class="flex justify-between py-2">
          <dt class="text-on-surface-variant font-semibold">Member since</dt>
          <dd class="text-on-surface">{{ formatDate(affiliate?.created_at || '') }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const { affiliate, commissionRate, fetchProfile } = useAffiliate()
const { formatDate } = useFormatDate()

// Profile form
const profileForm = reactive({
  display_name: '',
  website_url: '',
  bio: '',
})
const profileLoading = ref(false)
const profileMsg = ref('')
const profileError = ref(false)

// Password form
const passwordForm = reactive({ password: '', confirm: '' })
const passwordLoading = ref(false)
const passwordMsg = ref('')
const passwordError = ref(false)

// Populate form when affiliate loads
watch(affiliate, (val) => {
  if (val) {
    profileForm.display_name = val.display_name
    profileForm.website_url = val.website_url || ''
    profileForm.bio = val.bio || ''
  }
}, { immediate: true })

async function updateProfile() {
  profileMsg.value = ''
  profileError.value = false
  profileLoading.value = true

  const { error } = await client
    .from('affiliates')
    .update({
      display_name: profileForm.display_name,
      website_url: profileForm.website_url || null,
      bio: profileForm.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', affiliate.value!.id)

  if (error) {
    profileMsg.value = error.message
    profileError.value = true
  } else {
    profileMsg.value = 'Profile updated'
    await fetchProfile()
  }
  profileLoading.value = false
}

async function changePassword() {
  passwordMsg.value = ''
  passwordError.value = false

  if (passwordForm.password !== passwordForm.confirm) {
    passwordMsg.value = 'Passwords do not match'
    passwordError.value = true
    return
  }

  passwordLoading.value = true
  const { error } = await client.auth.updateUser({ password: passwordForm.password })

  if (error) {
    passwordMsg.value = error.message
    passwordError.value = true
  } else {
    passwordMsg.value = 'Password updated'
    passwordForm.password = ''
    passwordForm.confirm = ''
  }
  passwordLoading.value = false
}
</script>
