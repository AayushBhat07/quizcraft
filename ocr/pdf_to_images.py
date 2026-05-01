#!/usr/bin/env python3
"""Convert PDF pages to images for OCR."""

import fitz  # PyMuPDF
import os

src_dir = "/Users/aayush07/Desktop"
out_dir = "/Users/aayush07/.openclaw/workspace/study-platform/ocr"
os.makedirs(out_dir, exist_ok=True)

pdfs = ["firstPDF.pdf", "secondPDF.pdf"]

for pdf_name in pdfs:
    src_path = os.path.join(src_dir, pdf_name)
    pdf = fitz.open(src_path)
    pages = len(pdf)
    print(f"Processing {pdf_name}: {pages} pages")

    for i, page in enumerate(pdf):
        pix = page.get_pixmap(dpi=200)
        out_path = os.path.join(out_dir, f"{pdf_name.replace('.pdf','')}_page{i+1}.png")
        pix.save(out_path)
        print(f"  Saved page {i+1} -> {out_path}")

    pdf.close()

print("Done.")
