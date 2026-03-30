export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/forgot-password', '/reset-password'],
      cookieRedirect: false,
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'https://enroma.com',
    },
  },

  devServer: {
    port: 6001,
  },

  app: {
    head: {
      title: 'NUMAtours Affiliate Dashboard',
      meta: [
        { name: 'description', content: 'Track your traffic, bookings, and commissions' },
      ],
    },
  },
})
