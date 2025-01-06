import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],

  dev: {
    server: {
      hostname: 'localhost',
      port: 3000,      // ポート番号を設定（必要に応じて変更）
    }
  },
  runner: {
    disabled: true,
  },
  vite:() =>  ({
    server: {
      host: 'localhost', // サーバーのバインドアドレスを設定
      port: 3000,      // ポート番号を設定（必要に応じて変更）
      strictPort: false, // ポートが既に使用されている場合にエラーをスロー
      // hmr: {
      //   port: 3000,    // HMR が使用するポートを設定
      // }
    }
  }),
});
