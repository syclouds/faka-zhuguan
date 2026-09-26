/**
 * Tailwind 配置 — rpx 等价改造（ARCH §9.4）
 *
 * 安卓 WebView 没有 rpx：以 375 设计稿为基准定义 CSS 变量 --rpx: calc(100vw / 375)，
 * spacing/fontSize 全部经生成器输出 calc(var(--rpx) * N)。
 * 对齐关系：spacing[N] = N*4 设计稿像素 → h-14 = 56dp（AppBar/底栏高）、min-h-12 = 48dp（触摸目标下限）。
 * fontSize 额外乘 var(--font-scale, 1)（A-10 字体缩放 0.9–1.3，只缩放文字不缩放布局）。
 * 深色模式：darkMode 'class'，根元素挂 .dark 类（设置页选择 system/light/dark）。
 */

const rpx = (n) => `calc(var(--rpx) * ${n})`;
/** 文字尺寸：rpx 基础上乘字体缩放系数 */
const rpxFont = (n) => `calc(var(--rpx) * ${n} * var(--font-scale, 1))`;

/** 1–96 全量生成（步长 4dp），另补半档 */
const spacingGen = () => {
  const map = { 0: '0px', px: '1px' };
  for (let i = 1; i <= 96; i++) map[`${i}`] = rpx(i * 4);
  map['0.5'] = rpx(2);
  map['1.5'] = rpx(6);
  map['2.5'] = rpx(10);
  map['3.5'] = rpx(14);
  return map;
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      spacing: spacingGen(),
      fontSize: {
        xs: rpxFont(12),
        sm: rpxFont(14),
        base: rpxFont(16),
        lg: rpxFont(18),
        xl: rpxFont(20),
        '2xl': rpxFont(24),
        '3xl': rpxFont(32),
        '4xl': rpxFont(40)
      },
      colors: {
        // 主题色（跟随深浅色切换，变量定义见 src/styles/index.css）
        primary: 'var(--c-primary)',
        'primary-weak': 'var(--c-primary-weak)',
        bg: 'var(--c-bg)',
        card: 'var(--c-card)',
        ink: 'var(--c-ink)',
        sub: 'var(--c-sub)',
        line: 'var(--c-line)',
        danger: 'var(--c-danger)',
        warn: 'var(--c-warn)',
        success: 'var(--c-success)',
        // 七科固定色（取自小程序 constants.SUBJECTS）
        'sub-rule-law': '#E8453C',
        'sub-criminal': '#2B6CF6',
        'sub-crim-proc': '#7C4DFF',
        'sub-civil': '#14B45F',
        'sub-civil-proc': '#0FA3B1',
        'sub-admin': '#FF8F1F',
        'sub-commercial': '#B85C00'
      }
    }
  },
  plugins: []
};
