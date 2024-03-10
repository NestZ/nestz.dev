import { defineConfig } from 'vitepress'
import markdownItTextualUml from 'markdown-it-textual-uml';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nestz.dev",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/microservices/distributed-locking' }
    ],

    sidebar: [
      // {
      //   text: 'Adhocs',
      //   items: [
      //     { text: 'Markdown Examples', link: '/markdown-examples' },
      //     { text: 'Runtime API Examples', link: '/api-examples' },
      //     { text: 'Dependency Injection', link: '/adhocs/dependency-injection'},
      //     { text: 'UTF-8 vs ASCII vs Others', link: '/adhocs/utf-8-and-ascii'},
      //     { text: 'OS Signals', link: '/adhocs/os-signal'},
      //     { text: 'GRPC in the nutshell', link: '/adhocs/grpc'},
      //     { text: 'Git hooks', link: '/adhocs/git-hooks'},
      //     { text: 'Linux scheduler', link: '/adhocs/linux-cfs'},
      //     { text: 'Language server protocol', link: '/adhocs/lsp'},
      //   ]
      // },
      // {
      //   text: 'Database',
      //   items: [
      //     { text: 'Database Index', link: '/database/database-index'},
      //     { text: 'Optimistic lock', link: '/database/optimistic-lock'},
      //     { text: 'Pessimistic lock', link: '/database/pessimistic-lock'},
      //   ]
      // },
      {
        text: 'Microservices',
        items: [
          // { text: 'Microservices', link: '/microservices/microservices'},
          // { text: 'Distributed transaction', link: '/microservices/distributed-transaction'},
          { text: 'Distributed locking', link: '/microservices/distributed-locking'},
          // { text: 'Two phase locking (2PL)', link: '/microservices/2pl'},
          // { text: 'Two phase commit (2PC)', link: '/microservices/2pc'},
          // { text: 'Two generals problem', link: '/microservices/two-generals-problem'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NestZ' }
    ]
  },

  markdown: {
    config(md) {
      md.use(markdownItTextualUml)
    }
  }
})
