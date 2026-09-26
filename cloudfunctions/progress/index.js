// cloudfunctions/progress/index.js — 学习进度读写
// action: 'get' 拉取 | 'sync' 推送合并
// ⚠️ 安全规范：所有读写以 cloud.getWXContext().OPENID 为数据归属，前端无法伪造
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const COLLECTION = 'study_progress';

/** 校验单条进度记录结构，防止脏数据写库 */
function sanitizeRecord(rec) {
  if (!rec || typeof rec !== 'object') return null;
  const level = [0, 1, 2].includes(rec.level) ? rec.level : 0;
  return {
    level,
    stage: Number(rec.stage) || 0,
    due: Number(rec.due) || 0,
    lastAt: Number(rec.lastAt) || 0,
    wrong: Number(rec.wrong) || 0,
    seen: Number(rec.seen) || 0
  };
}

/** 只取较新的记录合并 */
function mergeRecords(local, remote) {
  const out = Object.assign({}, remote || {});
  Object.keys(local || {}).forEach((id) => {
    const l = sanitizeRecord(local[id]);
    if (!l) return;
    const r = out[id];
    if (!r || l.lastAt >= (r.lastAt || 0)) out[id] = l;
  });
  return out;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { code: -1, msg: '未获取到用户标识' };

  const { action = 'get' } = event;
  const col = db.collection(COLLECTION);

  /** ---------- 拉取 ---------- */
  if (action === 'get') {
    try {
      const res = await col.where({ openid: OPENID }).limit(1).get();
      if (!res.data.length) return { code: 0, progress: null, wrongList: [] };
      const doc = res.data[0];
      return {
        code: 0,
        progress: doc.progress || {},
        wrongList: doc.wrongList || [],
        stats: doc.stats || {},
        updatedAt: doc.updatedAt
      };
    } catch (err) {
      // 集合不存在时视为无数据，不报错
      return { code: 0, progress: null, wrongList: [], note: `集合读取失败：${err.message}` };
    }
  }

  /** ---------- 推送合并 ---------- */
  if (action === 'sync') {
    const localProgress = event.progress || {};
    const localWrong = Array.isArray(event.wrongList) ? event.wrongList.slice(0, 500) : [];
    const localStats = event.stats || {};

    try {
      const res = await col.where({ openid: OPENID }).limit(1).get();

      if (!res.data.length) {
        // 首次同步：直接建档
        await col.add({
          data: {
            openid: OPENID,
            progress: localProgress,
            wrongList: localWrong,
            stats: localStats,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        });
        return { code: 0, action: 'created', count: Object.keys(localProgress).length };
      }

      // 已有记录：以 lastAt 较新者为准合并
      const doc = res.data[0];
      const merged = mergeRecords(localProgress, doc.progress);
      const wrongSet = new Set((doc.wrongList || []).concat(localWrong));

      await col.doc(doc._id).update({
        data: {
          progress: merged,
          wrongList: Array.from(wrongSet).slice(0, 500),
          stats: localStats,
          updatedAt: db.serverDate()
        }
      });

      return { code: 0, action: 'merged', count: Object.keys(merged).length };
    } catch (err) {
      return { code: -1, msg: `同步失败：${err.message}` };
    }
  }

  /** ---------- 清空 ---------- */
  if (action === 'clear') {
    try {
      await col.where({ openid: OPENID }).remove();
      return { code: 0, action: 'cleared' };
    } catch (err) {
      return { code: -1, msg: err.message };
    }
  }

  return { code: -1, msg: `未知操作：${action}` };
};

// 说明：本云函数仅使用 wx-server-sdk；_ 未直接使用时可删除下行以避免 lint 警告
void _;
