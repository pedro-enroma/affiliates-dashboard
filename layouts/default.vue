<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600/75" />
    </div>

    <!-- Sidebar -->
    <UiSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="lg:pl-64">
      <UiTopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
