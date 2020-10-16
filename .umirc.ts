import { defineConfig } from 'umi';
import define from './src/constants/constant'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  layout: false,
  hash: true,
  mountElementId: 'website__entrypoint',
  inlineLimit: 25000,
  define: define,
  history: {
    type: 'memory'
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  proxy: {
    '/kucoin_api': {
      target: 'https://api.kucoin.com',
      pathRewrite: { '^/kucoin_api': '' },
      changeOrigin: true
    }
  }
});
