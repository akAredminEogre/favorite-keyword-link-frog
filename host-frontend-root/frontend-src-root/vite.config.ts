import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),crx({ manifest })],
  server: {
    host: '0.0.0.0', // サーバーのバインドアドレスを設定
    port: 5173,      // ポート番号を設定（必要に応じて変更）
    strictPort: true, // ポートが既に使用されている場合にエラーをスロー
    hmr: {
      port: 5173,    // HMR が使用するポートを設定
    }
  }
})

