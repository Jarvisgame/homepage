// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'marquee'
    }
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    },
    storage: {
      cache: {
        driver: 'cloudflare-kv-binding',
        binding: 'CACHE'
      }
    },
    cache: {
      driver: 'kv'
    }
  },
  routeRules: {
    '/': { swr: 300 },
    '/p/**': { swr: 3600 },
    '/api/posts': { swr: 300 },
    '/api/page/**': { swr: 3600 }
  }
})
