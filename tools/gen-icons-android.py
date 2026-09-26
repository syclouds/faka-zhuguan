# -*- coding: utf-8 -*-
"""
gen-icons-android.py — 生成安卓启动图标（U-9：几何图形设计，无外部依赖）

设计：蓝色圆角方形底（与 App 品牌色 #2B6CF6 一致）+ 三条白色横杠（书本/卡片意象，
与 App 内 Logo 一致）。圆形图标版本用圆形裁切。

输出：android/app/src/main/res/mipmap-{mdpi,hdpi,xhdp,xxhdpi,xxxhdpi}dpi/
      ic_launcher.png + ic_launcher_round.png

用法：python tools/gen-icons-android.py
（纯标准库：zlib + struct 手写 PNG，无需 Pillow；禁 pip install 环境约束下可用）
"""
import os
import struct
import zlib

SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

BG_TOP = (43, 108, 246)     # 品牌蓝上沿
BG_BOTTOM = (27, 78, 190)   # 深一档下沿（垂直渐变）
BAR = (255, 255, 255)       # 白色横杠

OUT_BASE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'faka-android', 'android', 'app', 'src', 'main', 'res'
)

# PWA 图标输出（manifest.webmanifest 引用）
PWA_OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'faka-android', 'public'
)
PWA_SIZES = {'icon-192.png': 192, 'icon-512.png': 512}


def rounded_rect_mask(x, y, w, h, radius):
    """点 (x, y) 是否在圆角矩形内（0..w-1 / 0..h-1 坐标系）"""
    if x < 0 or y < 0 or x >= w or y >= h:
        return False
    cx = min(x, w - 1 - x)
    cy = min(y, h - 1 - y)
    if cx >= radius or cy >= radius:
        return True
    dx, dy = radius - cx, radius - cy
    return dx * dx + dy * dy <= radius * radius


def circle_mask(x, y, w, h):
    r = w / 2.0
    dx = x + 0.5 - r
    dy = y + 0.5 - r
    return dx * dx + dy * dy <= r * r


def draw_icon(size, round_icon):
    """生成 size×size 的 RGBA 像素列表（row-major）"""
    pixels = []
    m = size / 192.0  # 以 192 为设计基准缩放

    # 底板圆角半径：方形版 22%，圆形版全圆
    if round_icon:
        base = lambda x, y: circle_mask(x, y, size, size)  # noqa: E731
        radius = 0
    else:
        radius = int(size * 0.22)
        base = lambda x, y: rounded_rect_mask(x, y, size, size, radius)  # noqa: E731

    # 三条横杠几何参数（设计稿 192 基准）：宽 88、高 16、圆角 8，左起 52
    bar_w = int(88 * m)
    bar_h = max(2, int(16 * m))
    bar_r = max(1, int(8 * m))
    bar_x0 = int(52 * m)
    bar_gap = int(20 * m)
    total_h = bar_h * 3 + bar_gap * 2
    bar_y0 = (size - total_h) // 2

    bars = []
    for i in range(3):
        y0 = bar_y0 + i * (bar_h + bar_gap)
        bars.append((bar_x0, y0, bar_x0 + bar_w, y0 + bar_h))

    for y in range(size):
        for x in range(size):
            if not base(x, y):
                pixels.append((0, 0, 0, 0))
                continue
            # 垂直渐变底
            t = y / max(1, size - 1)
            r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
            g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
            b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
            # 横杠（圆角矩形）
            for (x0, y0, x1, y1) in bars:
                if rounded_rect_mask(x - x0, y - y0, x1 - x0, y1 - y0, bar_r):
                    r, g, b = BAR
                    break
            pixels.append((r, g, b, 255))
    return pixels


def write_png(path, size, pixels):
    """手写 PNG（RGBA8，非隔行）：签名 + IHDR + IDAT(zlib) + IEND"""
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type 0 (None)
        row = pixels[y * size:(y + 1) * size]
        for (r, g, b, a) in row:
            raw.extend(struct.pack('4B', r, g, b, a))

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        c += struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)
        return c

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(png)


def write_png_rgb(path, w, h):
    """启动图：垂直渐变纯色 PNG（RGB8，color type 2），无前景图案"""
    rows = bytearray()
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        rows.append(0)  # filter type 0
        rows.extend(bytes((r, g, b)) * w)

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        c += struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)
        return c

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(bytes(rows), 9))
    png += chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(png)


def main():
    for density, size in SIZES.items():
        for name, round_icon in (('ic_launcher.png', False), ('ic_launcher_round.png', True)):
            path = os.path.join(OUT_BASE, f'mipmap-{density}', name)
            pixels = draw_icon(size, round_icon)
            write_png(path, size, pixels)
            print(f'[gen-icons] {density} {name} {size}x{size} -> {path}')
        # 自适应图标前景（Android 8+ mipmap-anydpi-v26 引用）：复用方形图标
        fg = os.path.join(OUT_BASE, f'mipmap-{density}', 'ic_launcher_foreground.png')
        write_png(fg, size, draw_icon(size, False))
        print(f'[gen-icons] {density} ic_launcher_foreground.png {size}x{size}')

    # 启动图（splash）：品牌蓝垂直渐变，竖屏/横屏各 5 密度 + drawable 兜底
    SPLASH = {
        'mdpi': (320, 480), 'hdpi': (480, 800), 'xhdpi': (720, 1280),
        'xxhdpi': (960, 1600), 'xxxhdpi': (1280, 1920),
    }
    for density, (pw, ph) in SPLASH.items():
        write_png_rgb(os.path.join(OUT_BASE, f'drawable-port-{density}', 'splash.png'), pw, ph)
        write_png_rgb(os.path.join(OUT_BASE, f'drawable-land-{density}', 'splash.png'), ph, pw)
        print(f'[gen-icons] splash {density} {pw}x{ph} port/land')
    write_png_rgb(os.path.join(OUT_BASE, 'drawable', 'splash.png'), 480, 800)

    # PWA 图标（方形圆角版本）
    for name, size in PWA_SIZES.items():
        path = os.path.join(PWA_OUT, name)
        pixels = draw_icon(size, False)
        write_png(path, size, pixels)
        print(f'[gen-icons] pwa {name} {size}x{size} -> {path}')

    print('[gen-icons] done: 5 densities x 2 variants + 2 pwa icons')


if __name__ == '__main__':
    main()
