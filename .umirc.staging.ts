import { defineConfig } from 'umi';
import define from './src/constants/constant_staging';

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
    type: 'browser',
  },
  routes: [
    { path: '/', component: '@/pages/index', exact: true },
    {
      path: '/proof_of_assets',
      component: '@/pages/proof_of_assets',
      exact: true,
    },
  ],
  proxy: {
    '/kucoin_api': {
      target: 'https://api.kucoin.com',
      pathRewrite: { '^/kucoin_api': '' },
      changeOrigin: true,
    },
  },
  theme: {
    'primary-color': '#6955C0',
    'link-color': '#6955C0',
    'btn-primary-color': '#6955C0',
    'btn-primary-bg': '#6955C0',
  },
});
