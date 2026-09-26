import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite 配置
 * - base './'：产物为相对路径，Capacitor 壳 / PWA / 单文件离线包三处通用
 * - build.target es2019：Android 8 WebView（Chromium 80+）兼容基线
 * - 别名：@ → src；@shared → 仓库根 shared/（双端共享数据源）
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url))
    }
  },
  server: {
    fs: {
      // dev 模式允许引用仓库根 shared/ 目录
      allow: [fileURLToPath(new URL('./', import.meta.url)), fileURLToPath(new URL('..', import.meta.url))]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: ['es2019', 'chrome80'],
    cssTarget: 'chrome80',
    sourcemap: false,
    reportCompressedSize: false,
    // 本机沙箱限制批量删除；旧 hash 产物由脚本单独清理（tools 脚本与 CI 内 emptyOutDir 不影响）
    emptyOutDir: false
  }
});
