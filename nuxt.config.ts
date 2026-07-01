// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@nuxt/eslint'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  shadcn: {
    /**
     * Prefix for all the imported components
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui'
  },

  colorMode: {
    classSuffix: ''
  },

  runtimeConfig: {
    adminUser: process.env.ADMIN_USERNAME || process.env.ADMIN_USER || 'admin',
    adminPass: process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'admin123',
    jwtSecret: process.env.JWT_SECRET || 'secret-key'
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
        }
      }
    }
  },

  content: {
    highlight: {
      theme: 'github-dark'
    }
  },

  mdc: {
    highlight: {
      theme: 'github-dark'
    },
    remarkPlugins: {
      // Add remark plugins here if needed
    },
    rehypePlugins: {
      'rehype-raw': {}
    }
  },

  compatibilityDate: '2024-04-03',
})
