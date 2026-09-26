# -*- coding: utf-8 -*-
"""生成 tabBar 图标 PNG（纯标准库，无需 PIL）。
用法: python tools/gen_icons.py
输出: miniprogram/assets/icons/*.png  81x81 RGBA
"""
import os
import struct
import zlib

SIZE = 81
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'miniprogram', 'assets', 'icons')
NORMAL = (0x99 / 255, 0x99 / 255, 0x9E / 255)
ACTIVE = (0x2B / 255, 0x6C / 255, 0xF6 / 255)  # 主题蓝


class Canvas:
    def __init__(self, size):
        self.size = size
        self.px = [[(0.0, 0.0, 0.0, 0.0)] * size for _ in range(size)]

    def _blend(self, x, y, c, a):
        if a <= 0:
            return
        r0, g0, b0, a0 = self.px[y][x]
        na = a + a0 * (1 - a)
        if na <= 0:
            return
        r = (c[0] * a + r0 * a0 * (1 - a)) / na
        g = (c[1] * a + g0 * a0 * (1 - a)) / na
        b = (c[2] * a + b0 * a0 * (1 - a)) / na
        self.px[y][x] = (r, g, b, na)

    def rect(self, x0, y0, x1, y1, color, radius=0):
        x0, x1 = max(0, min(x0, x1)), min(self.size - 1, max(x0, x1))
        y0, y1 = max(0, min(y0, y1)), min(self.size - 1, max(y0, y1))
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if radius:
                    cx = x0 + radius if x < x0 + radius else (x1 - radius if x > x1 - radius else x)
                    cy = y0 + radius if y < y0 + radius else (y1 - radius if y > y1 - radius else y)
                    dx, dy = x - cx, y - cy
                    d = (dx * dx + dy * dy) ** 0.5
                    if d > radius:
                        continue
                    self._blend(x, y, color, min(1.0, radius - d + 0.5))
                else:
                    self._blend(x, y, color, 1.0)

    def circle(self, cx, cy, r, color):
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if 0 <= x < self.size and 0 <= y < self.size:
                    d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                    if d <= r:
                        self._blend(x, y, color, min(1.0, r - d + 0.5))

    def triangle(self, p1, p2, p3, color):
        xs = [p1[0], p2[0], p3[0]]
        ys = [p1[1], p2[1], p3[1]]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            for x in range(int(min(xs)), int(max(xs)) + 1):
                if 0 <= x < self.size and 0 <= y < self.size and _in_tri(x + .5, y + .5, p1, p2, p3):
                    self._blend(x, y, color, 1.0)

    def ring(self, cx, cy, r, w, color):
        for y in range(int(cy - r - 2), int(cy + r + 3)):
            for x in range(int(cx - r - 2), int(cx + r + 3)):
                if 0 <= x < self.size and 0 <= y < self.size:
                    d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                    if abs(d - r) <= w / 2:
                        self._blend(x, y, color, min(1.0, w / 2 - abs(d - r) + 0.5))

    def line(self, x0, y0, x1, y1, w, color):
        steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(steps + 1):
            t = i / steps
            self.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, color)

    def save(self, path):
        raw = bytearray()
        for y in range(self.size):
            raw.append(0)
            for x in range(self.size):
                r, g, b, a = self.px[y][x]
                raw += bytes((int(r * 255), int(g * 255), int(b * 255), int(a * 255)))
        comp = zlib.compress(bytes(raw), 9)

        def chunk(tag, data):
            c = struct.pack('>I', len(data)) + tag + data
            return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

        png = (b'\x89PNG\r\n\x1a\n'
               + chunk(b'IHDR', struct.pack('>IIBBBBB', self.size, self.size, 8, 6, 0, 0, 0))
               + chunk(b'IDAT', comp)
               + chunk(b'IEND', b''))
        with open(path, 'wb') as f:
            f.write(png)


def _in_tri(px, py, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
    d1, d2, d3 = sign((px, py), a, b), sign((px, py), b, c), sign((px, py), c, a)
    has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    return not (has_neg and has_pos)


def icon_home(c, col):
    c.triangle((40, 12), (72, 42), (8, 42), col)
    c.rect(16, 40, 64, 70, col, radius=4)


def icon_card(c, col):
    c.rect(12, 14, 68, 66, col, radius=6)
    # 内部三条横线：挖空为透明
    for (y0, x1) in ((28, 59), (40, 51), (52, 43)):
        for y in range(y0, y0 + 5):
            for x in range(22, x1):
                c.px[y][x] = (0, 0, 0, 0)


def icon_pen(c, col):
    c.triangle((58, 12), (70, 24), (46, 50), col)
    c.line(46, 50, 18, 72, 9, col)
    c.line(14, 68, 24, 78, 9, col)


def icon_mine(c, col):
    c.circle(40, 26, 13, col)     # 头
    c.circle(40, 78, 26, col)     # 肩（下半圆超出画布自动裁剪）


ICONS = {'home': icon_home, 'card': icon_card, 'pen': icon_pen, 'mine': icon_mine}

if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, fn in ICONS.items():
        for suffix, col in (('', NORMAL), ('-active', ACTIVE)):
            c = Canvas(SIZE)
            fn(c, col + (1.0,))
            c.save(os.path.join(OUT_DIR, f'{name}{suffix}.png'))
    print('icons generated ->', os.path.abspath(OUT_DIR))
