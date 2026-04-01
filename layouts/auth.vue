<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-2">
          <img src="/images/enroma-logo.png" alt="EnRoma.com" class="h-12 w-auto" />
        </div>
        <h1 class="text-3xl font-bold text-on-surface font-headline">EnRoma.com</h1>
        <p class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mt-1">{{ $t('brand_sub_affiliate') }}</p>
      </div>
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(25,28,28,0.03)] p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
