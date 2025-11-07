// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss'],
  
  // Tailwind CSS configuration for SSR
  tailwindcss: {
    exposeConfig: false,
    injectPosition: 0,
    viewer: false,
  },
  
  // Ensure CSS is extracted for SSR
  css: [],
  
  // Experimental: Inline critical CSS for SSR
  experimental: {
    inlineSSRStyles: false, // Keep false to use extracted CSS
  },
  
  // SEO Configuration
  app: {
    head: {
      titleTemplate: '%s - Snappy Demo',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.svg' }
      ],
      style: [
        {
          children: `
            html, body { 
              background: linear-gradient(to bottom right, #667eea, #764ba2) !important;
              min-height: 100vh;
              margin: 0;
              padding: 0;
            }
            body > div#__nuxt {
              background: linear-gradient(to bottom right, #667eea, #764ba2);
              min-height: 100vh;
            }
          `
        }
      ]
    }
  },
  
  // Vercel deployment configuration
  nitro: {
    preset: 'vercel'
  }
})

