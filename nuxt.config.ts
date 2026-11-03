// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
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
