<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600/75" />
    </div>

    <!-- Sidebar -->
    <UiSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <main class="lg:ml-64 min-h-screen relative">
      <UiTopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="pt-32 pb-20 px-10 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
