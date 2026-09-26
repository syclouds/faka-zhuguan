#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
extract-pdf.py — 2026 备考资料结构化抽取（ARCH T03，pypdf 6.19.0，禁止 OCR/Pillow）

用法：
  python extract-pdf.py                # 抽取全部 5 份可读 PDF → raw/*.txt（分页标注）
  python extract-pdf.py <关键词>       # 只抽取文件名包含关键词的第一份

输出：raw/<slug>.txt，每页以 `=== [页码] ===` 分隔，供人工/脚本提炼为
shared/data/ 的自有表述内容（合规红线：raw/ 在 .gitignore，绝不入库）。
"""
import os
import sys

from pypdf import PdfReader

DESKTOP_DIR = r"C:/Users/1/Desktop/法考/2026"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "raw")

# 只处理有文本层的 5 份（PRD 第七节抽样结论；其余约 2/3 为扫描件，不做 OCR）
TARGETS = [
    ("2026向高甲刑诉背诵口诀(学生打印版）.pdf", "mnemonics-crim-proc"),
    ("【过渡版】2026年主观题采分有料·民法（张翔）.pdf", "cases-civil"),
    ("2026刑诉法 小案例_.pdf", "cases-crim-proc"),
    ("2026年真金题强训-刑诉法.pdf", "cases-crim-proc-gold"),
    ("8.6-主观题法治思想考点带背.pdf", "rule-law"),
]


def extract(pdf_name: str, slug: str) -> str:
    pdf_path = os.path.join(DESKTOP_DIR, pdf_name)
    if not os.path.exists(pdf_path):
        return f"[skip] 不存在: {pdf_path}"
    reader = PdfReader(pdf_path)
    pages_out = []
    text_pages = 0
    for i, page in enumerate(reader.pages):
        try:
            text = (page.extract_text() or "").strip()
        except Exception as e:  # 单页损坏不中断
            text = ""
            pages_out.append(f"=== [{i + 1}] (抽取异常: {e}) ===")
            continue
        if text:
            text_pages += 1
        pages_out.append(f"=== [{i + 1}] ===\n{text}")
    out_path = os.path.join(OUT_DIR, f"{slug}.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(pages_out))
    return f"[ok] {pdf_name} 共 {len(reader.pages)} 页（有文本 {text_pages} 页）→ raw/{slug}.txt"


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    keyword = sys.argv[1] if len(sys.argv) > 1 else None
    targets = TARGETS
    if keyword:
        targets = [t for t in TARGETS if keyword in t[0] or keyword in t[1]]
        if not targets:
            print(f"[skip] 无匹配文件: {keyword}")
            return
    for pdf_name, slug in targets:
        print(extract(pdf_name, slug))


if __name__ == "__main__":
    main()
