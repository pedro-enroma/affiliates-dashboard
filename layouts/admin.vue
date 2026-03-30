<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600/75" />
    </div>

    <!-- Admin Sidebar -->
    <UiAdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <main class="lg:ml-64 min-h-screen relative">
      <UiTopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="pt-28 pb-20 px-6 lg:px-10">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
