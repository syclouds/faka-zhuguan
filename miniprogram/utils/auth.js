// utils/auth.js — 静默登录：wx.login 拿 code，交给云函数换 openid
// ⚠️ 安全规范：code 必须在服务端换取 openid/session_key，前端不得存储 session_key
const store = require('./store');

let logging = null;

function ensureLogin() {
  const cached = store.get('openid');
  if (cached) {
    const app = getApp();
    if (app) app.globalData.openid = cached;
    return Promise.resolve(cached);
  }
  if (logging) return logging;

  logging = new Promise((resolve) => {
    wx.login({
      success: async ({ code }) => {
        if (!code) return resolve('');
        try {
          if (!wx.cloud) return resolve('');
          const res = await wx.cloud.callFunction({ name: 'login', data: { code } });
          const openid = (res && res.result && res.result.openid) || '';
          if (openid) {
            store.set('openid', openid);
            const app = getApp();
            if (app) app.globalData.openid = openid;
          }
          resolve(openid);
        } catch (err) {
          // 未开通云开发时静默降级，不影响本地功能
          console.warn('[auth] 云登录失败，使用本地模式', err);
          resolve('');
        }
      },
      fail: () => resolve('')
    });
  }).finally(() => {
    logging = null;
  });

  return logging;
}

module.exports = { ensureLogin };
