<template>
  <div class="max-w-2xl space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>

    <!-- Profile -->
    <form @submit.prevent="updateProfile" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 class="text-lg font-semibold text-gray-900">Profile</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input
          v-model="profileForm.display_name"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
        <input
          v-model="profileForm.website_url"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://yourblog.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          v-model="profileForm.bio"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      <p v-if="profileMsg" :class="profileError ? 'text-red-600' : 'text-green-600'" class="text-sm">
        {{ profileMsg }}
      </p>

      <button
        type="submit"
        :disabled="profileLoading"
        class="py-2.5 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {{ profileLoading ? 'Saving...' : 'Save Profile' }}
      </button>
    </form>

    <!-- Change Password -->
    <form @submit.prevent="changePassword" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 class="text-lg font-semibold text-gray-900">Change Password</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          v-model="passwordForm.password"
          type="password"
          required
          minlength="8"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          v-model="passwordForm.confirm"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Repeat password"
        />
      </div>

      <p v-if="passwordMsg" :class="passwordError ? 'text-red-600' : 'text-green-600'" class="text-sm">
        {{ passwordMsg }}
      </p>

      <button
        type="submit"
        :disabled="passwordLoading"
        class="py-2.5 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {{ passwordLoading ? 'Updating...' : 'Update Password' }}
      </button>
    </form>

    <!-- Account info (read-only) -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between">
          <dt class="text-gray-500">Affiliate ID</dt>
          <dd class="text-gray-900 font-mono">{{ affiliate?.affiliate_id }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Email</dt>
          <dd class="text-gray-900">{{ affiliate?.email }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Commission Rate</dt>
          <dd class="text-gray-900">{{ commissionRate }}%</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Member since</dt>
          <dd class="text-gray-900">{{ affiliate?.created_at?.split('T')[0] }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const { affiliate, commissionRate, fetchProfile } = useAffiliate()

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
