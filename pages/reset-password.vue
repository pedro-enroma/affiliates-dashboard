<template>
  <div>
    <NuxtLayout name="auth">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Set new password</h2>

      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Repeat password"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">Password updated. Redirecting...</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Updating...' : 'Update password' }}
        </button>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)

async function handleUpdate() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  const { error: updateError } = await client.auth.updateUser({
    password: password.value,
  })

  if (updateError) {
    error.value = updateError.message
  } else {
    success.value = true
    setTimeout(() => navigateTo('/'), 2000)
  }
  loading.value = false
}
</script>
