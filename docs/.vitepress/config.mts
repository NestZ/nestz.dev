import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nestz.dev",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Shits', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Shits',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'Dependency Injection', link: '/dependency-injection'},
          { text: 'UTF-8 vs ASCII vs Others', link: 'utf-8-and-ascii'},
          { text: 'OS Signals', link: '/os-signal'},
          { text: 'GRPC in the nutshell', link: '/grpc'},
          { text: 'Microservices', link: '/microservices'},
          { text: 'Database Index', link: '/database-index'},
          { text: 'Git hooks', link: '/git-hooks'},
          { text: 'Linux scheduler', link: '/linux-cfs'},
          { text: 'Language server protocol', link: '/lsp'},
          { text: 'Distributed locking', link: '/distributed-locking'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NestZ' }
    ]
  }
})
