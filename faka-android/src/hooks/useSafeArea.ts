/**
 * 安全区探测（ARCH §9.5）：env() 生效则直接用；不可用时用探针元素 JS 测量兜底，
 * 并把测量值写回 html 根变量，保证 AppBar/TabBar 高度正确。
 */
import { useEffect, useState } from 'react';

export interface SafeArea {
  top: number;
  bottom: number;
}

function measureWithProbe(): SafeArea {
  if (typeof document === 'undefined') return { top: 0, bottom: 0 };
  try {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
      'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const top = parseFloat(cs.paddingTop) || 0;
    const bottom = parseFloat(cs.paddingBottom) || 0;
    probe.remove();
    return { top, bottom };
  } catch {
    return { top: 0, bottom: 0 };
  }
}

export function useSafeArea(): SafeArea {
  const [area, setArea] = useState<SafeArea>({ top: 0, bottom: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detect = () => {
      try {
        const cs = getComputedStyle(document.documentElement);
        const envTop = parseFloat(cs.getPropertyValue('--safe-top')) || 0;
        const envBottom = parseFloat(cs.getPropertyValue('--safe-bottom')) || 0;
        if (envTop > 0 || envBottom > 0) {
          setArea({ top: envTop, bottom: envBottom });
          return;
        }
        // env() 不可用（旧内核）：探针测量 + 写回根变量
        const probed = measureWithProbe();
        if (probed.top > 0 || probed.bottom > 0) {
          document.documentElement.style.setProperty('--safe-top', `${probed.top}px`);
          document.documentElement.style.setProperty('--safe-bottom', `${probed.bottom}px`);
        }
        setArea(probed);
      } catch (err) {
        console.warn('[safe-area] 测量失败', err);
      }
    };
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  return area;
}
