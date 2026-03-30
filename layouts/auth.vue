<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">NUMAtours</h1>
        <p class="text-gray-500 mt-1">Affiliate Dashboard</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
