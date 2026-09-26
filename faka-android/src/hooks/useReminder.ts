import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAppStore } from '../state/useAppStore.ts';
import { todayCount } from '../core/review.ts';

const REMIND_ID = 20260926;
const CHANNEL_ID = 'daily-remind';

/**
 * 每日背诵提醒（T05.3，C-5）：settings.remind/remindAt 变化 → 取消旧计划 → 注册每日本地通知。
 * 非 native 环境（PWA/Node）LocalNotifications 调用可能 reject，静默降级不影响 UI。
 */
export function useReminder(): void {
  const remind = useAppStore((s) => s.settings.remind);
  const remindAt = useAppStore((s) => s.settings.remindAt);

  const remindRef = useRef(remind);
  remindRef.current = remind;
  const atRef = useRef(remindAt);
  atRef.current = remindAt;

  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      try {
        // 先取消旧计划，保证改时间后立即生效
        await LocalNotifications.cancel({ notifications: [{ id: REMIND_ID }] });

        if (!remind) return;

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(remindAt)) return;

        // 权限（首次触发系统授权弹窗；拒绝后静默，下次开启再请求）
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== 'granted') return;
        }

        // Android 13+ 建议显式建渠道（importance 3 = DEFAULT，visibility 1 = PUBLIC）
        await LocalNotifications.createChannel({
          id: CHANNEL_ID,
          name: '每日背诵提醒',
          importance: 3,
          visibility: 1
        });

        const [hh, mm] = remindAt.split(':').map(Number);

        await LocalNotifications.schedule({
          notifications: [
            {
              id: REMIND_ID,
              title: '法考背诵时间到 ⏰',
              body: `今天已背 ${todayCount()} 张，花 10 分钟把今天的任务清掉吧。`,
              // on: 每天 hh:mm 触发（ScheduleOn，省略 year/month/day = 每日匹配）
              schedule: {
                on: { hour: hh, minute: mm },
                allowWhileIdle: true
              },
              channelId: CHANNEL_ID,
              smallIcon: 'ic_launcher',
              largeIcon: 'ic_launcher'
            }
          ]
        });
      } catch {
        // 非 native / 用户拒绝权限：静默
      }
    };

    if (!cancelled) void apply();

    return () => {
      cancelled = true;
      // 卸载（含设置关闭）时兜底取消
      try {
        void LocalNotifications.cancel({ notifications: [{ id: REMIND_ID }] });
      } catch {
        /* ignore */
      }
    };
  }, [remind, remindAt]);
}
