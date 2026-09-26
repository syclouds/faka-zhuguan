import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

/**
 * 入口：挂载 → App 内 store.init() hydrate。
 * PWA：注册手写 sw.js（仅浏览器环境；Capacitor 原生 WebView 跳过，
 * 原生侧资源直接打包在 APK 内，无需离线缓存层）。
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 注册（PWA 兜底；原生环境跳过）
if ('serviceWorker' in navigator) {
  const isNative = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    ?.isNativePlatform?.();
  if (!isNative) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('[pwa] Service Worker 注册失败（不影响应用使用）', err);
      });
    });
  }
}
