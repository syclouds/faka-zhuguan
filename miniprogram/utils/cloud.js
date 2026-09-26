// utils/cloud.js — 云开发能力封装（进度同步 / 备份还原）
// 未开通云开发时全部方法静默降级，不阻断本地功能
const store = require('./store');

/** 云开发不可用时的提示语，仅用于「我的」页面显式同步操作 */
const CLOUD_TIP = '当前为本地模式：在微信开发者工具中开通云开发并创建 login、progress 云函数后即可多设备同步';

function callable() {
  return typeof wx !== 'undefined' && !!wx.cloud;
}

module.exports.CLOUD_TIP = CLOUD_TIP;

/** 拉取云端进度并合并到本地（取每张卡 lastAt 较新的记录） */
async function pullProgress() {
  if (!callable()) return null;
  try {
    const res = await wx.cloud.callFunction({
      name: 'progress',
      data: { action: 'get' }
    });
    const remote = (res && res.result && res.result.progress) || null;
    if (!remote) return null;

    const local = store.get('progress', {}) || {};
    let changed = 0;
    Object.keys(remote).forEach((id) => {
      const r = remote[id];
      const l = local[id];
      if (!l || (r.lastAt || 0) > (l.lastAt || 0)) {
        local[id] = r;
        changed += 1;
      }
    });
    if (changed) store.set('progress', local);

    const remoteWrong = (res.result && res.result.wrongList) || [];
    if (remoteWrong.length) {
      const set = new Set((store.get('wrongList', []) || []).concat(remoteWrong));
      store.set('wrongList', Array.from(set));
    }
    return { merged: changed, total: Object.keys(remote).length };
  } catch (err) {
    console.warn('[cloud] 拉取进度失败', err);
    return null;
  }
}

/** 推送本地进度到云端（首次全量，之后增量合并由云函数处理） */
async function pushProgress() {
  if (!callable()) return null;
  try {
    const res = await wx.cloud.callFunction({
      name: 'progress',
      data: {
        action: 'sync',
        progress: store.get('progress', {}),
        wrongList: store.get('wrongList', []),
        stats: store.get('stats', {})
      }
    });
    return (res && res.result) || null;
  } catch (err) {
    console.warn('[cloud] 同步进度失败', err);
    return null;
  }
}

module.exports = { pullProgress, pushProgress, CLOUD_TIP };