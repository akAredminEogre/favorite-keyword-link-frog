import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['contextMenus'],
  },
  dev: {
    server: {
      hostname: 'localhost',
      port: 3000,
    }
  },
  runner: {
    disabled: true,
  },
  vite:() =>  ({
    server: {
      host: 'localhost',
      port: 3000,
      strictPort: true, 
      hmr: {
        port: 3000,
      }
    }
  }),
});
