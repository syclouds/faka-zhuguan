// cloudfunctions/login/index.js — 静默登录：返回 openid
// ⚠️ 安全规范：session_key 绝不返回给前端；openid 仅用于数据归属标识
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID, UNIONID, APPID } = cloud.getWXContext();
  if (!OPENID) {
    return { code: -1, msg: '未获取到 openid，请检查小程序 AppID 配置' };
  }

  // 首次登录写入用户记录（存在则更新登录时间）
  try {
    const users = db.collection('users');
    const existed = await users.where({ openid: OPENID }).count();
    if (existed.total === 0) {
      await users.add({
        data: {
          openid: OPENID,
          unionid: UNIONID || '',
          appid: APPID || '',
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate()
        }
      });
    } else {
      await users.where({ openid: OPENID }).update({
        data: { lastLoginAt: db.serverDate() }
      });
    }
  } catch (err) {
    // 集合不存在等情况不影响登录，仅记录日志
    console.warn('[login] 用户记录写入失败（可先创建 users 集合）', err.message);
  }

  return {
    code: 0,
    openid: OPENID,
    unionid: UNIONID || ''
  };
};
