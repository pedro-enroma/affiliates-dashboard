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
      bookingsSupabaseUrl: process.env.BOOKINGS_SUPABASE_URL || '',
      bookingsSupabaseKey: process.env.BOOKINGS_SUPABASE_KEY || '',
    },
  },

  devServer: {
    port: 6500,
  },

  app: {
    head: {
      title: 'NUMAtours Affiliate Portal',
      meta: [
        { name: 'description', content: 'Track your traffic, bookings, and commissions' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        },
      ],
      style: [
        {
          children: `
            .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            body { font-family: 'Manrope', sans-serif; }
            h1, h2, h3, .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
          `,
        },
      ],
    },
  },
})
