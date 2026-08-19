# -*- coding: utf-8 -*-
"""搜索本机 Ollama 安装位置与模型"""
import os

paths = [
    r"C:\Users\27265\AppData\Local\Programs\Ollama",
    r"C:\Program Files\Ollama",
    r"C:\Users\27265\AppData\Local\Ollama",
    r"C:\Users\27265\.ollama",
    r"D:\Ollama",
    r"D:\ollama",
    r"D:\Hermes\ollama",
]
print("=== 检查常见目录 ===")
for p in paths:
    exists = os.path.isdir(p)
    print(("存在: " if exists else "不存在: ") + p)
    if exists:
        try:
            for f in os.listdir(p)[:20]:
                print("   -", f)
        except Exception as e:
            print("   读取失败:", e)

print()
print("=== 搜索 ollama.exe (C盘+D盘, 限深6层) ===")
found = []
for root in [r"C:\\", r"D:\\"]:
    if not os.path.isdir(root):
        continue
    for dirpath, dirnames, filenames in os.walk(root):
        depth = dirpath[len(root):].count(os.sep)
        if depth > 6:
            dirnames[:] = []
            continue
        for f in filenames:
            if f.lower() == "ollama.exe":
                found.append(os.path.join(dirpath, f))
        if len(found) >= 10:
            break
    if len(found) >= 10:
        break

print("找到 %d 个 ollama.exe:" % len(found))
for f in found:
    print("  -", f)

print()
print("=== 搜索 ollama 模型 (manifest.json, 限深6层) ===")
found2 = []
for root in [r"C:\Users\27265\.ollama", r"D:\Ollama", r"C:\Users\27265\AppData\Local\Ollama"]:
    if not os.path.isdir(root):
        continue
    for dirpath, dirnames, filenames in os.walk(root):
        depth = dirpath[len(root):].count(os.sep)
        if depth > 6:
            dirnames[:] = []
            continue
        for f in filenames:
            if f == "manifest.json":
                found2.append(dirpath)
    if len(found2) >= 30:
        break
print("找到 %d 个模型 manifest:" % len(found2))
for f in found2[:30]:
    print("  -", f)
