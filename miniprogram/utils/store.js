// utils/store.js — 本地存储轻封装（统一 key 前缀 + 容错）
const { STORAGE_KEYS } = require('./constants');

const KEY_MAP = {
  progress: STORAGE_KEYS.progress,
  settings: STORAGE_KEYS.settings,
  stats: STORAGE_KEYS.stats,
  wrongList: STORAGE_KEYS.wrongList,
  favorites: STORAGE_KEYS.favorites,
  examDate: STORAGE_KEYS.examDate,
  cards: STORAGE_KEYS.cards,
  lastQueueDate: STORAGE_KEYS.lastQueueDate,
  openid: STORAGE_KEYS.openid
};

function resolveKey(key) {
  return KEY_MAP[key] || key;
}

function get(key, def = null) {
  try {
    const v = wx.getStorageSync(resolveKey(key));
    return v === '' || v === undefined || v === null ? def : v;
  } catch (err) {
    console.warn('[store] get 失败', key, err);
    return def;
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(resolveKey(key), value);
    return true;
  } catch (err) {
    console.warn('[store] set 失败', key, err);
    return false;
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(resolveKey(key));
  } catch (err) {
    console.warn('[store] remove 失败', key, err);
  }
}

module.exports = { get, set, remove };
