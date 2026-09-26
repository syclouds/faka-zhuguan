import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 配置
 * appId/appName 与 android/app/build.gradle、strings.xml 保持一致（T05.4 改壳时对齐）。
 * webDir 指向 vite 产物 dist/（已 commit 进仓库，CI 不再跑 build）。
 */
const config: CapacitorConfig = {
  appId: 'com.faka.zhuguan',
  appName: '法考主观题速记',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK'
    },
    LocalNotifications: {
      small: 'ic_stat_notify'
    }
  }
};

export default config;
