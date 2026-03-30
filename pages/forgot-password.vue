<template>
  <div>
    <NuxtLayout name="auth">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Reset your password</h2>
      <p class="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

      <form v-if="!sent" @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="you@example.com"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>

      <div v-else class="text-center py-4">
        <p class="text-green-600 font-medium">Check your email</p>
        <p class="text-sm text-gray-500 mt-2">We sent a password reset link to {{ email }}</p>
      </div>

      <div class="mt-4 text-center">
        <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700">
          Back to sign in
        </NuxtLink>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleReset() {
  error.value = ''
  loading.value = true

  const { error: resetError } = await client.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (resetError) {
    error.value = resetError.message
  } else {
    sent.value = true
  }
  loading.value = false
}
</script>
