<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-gray-500">Confirming...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

// Supabase auth redirect lands here with tokens in the hash.
// @nuxtjs/supabase handles the token exchange automatically.
// Once authenticated, redirect to dashboard.
const user = useSupabaseUser()

watch(user, (val) => {
  if (val) navigateTo('/')
}, { immediate: true })
</script>
