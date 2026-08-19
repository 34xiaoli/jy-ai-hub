# -*- coding: utf-8 -*-
"""
把工作区已有的 Markdown 资料解析成前端可直接加载的数据文件。

输入:
  ../../AI资讯与免费API汇总.md      -> 「每日更新」区 (每日简报: 动态 + 免费API政策变动)
  ../../AI信息咨询简报*.md          -> 每期简报 (今日要闻 / 新工具 / 深度看点 / 行动建议)

输出:
  ../assets/data/news.js            -> window.__NEWS__ / window.__BRIEFS__
说明:
  输出为 .js 而非 .json, 这样双击 index.html (file://) 也能直接加载, 无需起服务器。
"""

import json
import os
import re
import glob
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "assets", "data"))

LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
BOLD_LEAD_RE = re.compile(r"^\*\*(.+?)\*\*[：:]\s*(.*)$", re.S)


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def strip_md(text):
    """去掉 markdown 链接/强调, 保留纯文本。"""
    text = LINK_RE.sub(r"\1", text)
    text = text.replace("**", "").replace("`", "")
    return re.sub(r"\s+", " ", text).strip()


def pull_links(text):
    seen, out = set(), []
    for label, url in LINK_RE.findall(text):
        if url in seen:
            continue
        seen.add(url)
        out.append({"label": strip_md(label)[:28], "url": url})
    return out


def split_title(body):
    """把 '**标题**：正文' 拆成 (标题, 正文)。"""
    m = BOLD_LEAD_RE.match(body.strip())
    if m:
        return strip_md(m.group(1)), m.group(2).strip()
    plain = strip_md(body)
    if "：" in plain[:60]:
        head, _, rest = plain.partition("：")
        return head.strip(), rest.strip()
    return plain[:40], plain


def classify(title, body):
    text = title + body
    rules = [
        ("安全", ["漏洞", "入侵", "攻破", "注入", "安全", "逃逸", "CVE"]),
        ("开源", ["开源", "开放权重", "权重", "Apache", "MIT", "HuggingFace", "Hugging Face"]),
        ("政策", ["监管", "备案", "网信办", "办法", "合规", "协定", "联名", "治理"]),
        ("模型", ["发布", "上线", "模型", "参数", "Gemini", "GPT", "Claude", "Kimi", "Qwen", "DeepSeek"]),
        ("资本", ["投资", "融资", "财报", "营收", "IPO", "亿美元"]),
    ]
    for label, kws in rules:
        if any(k in text for k in kws):
            return label
    return "行业"


def parse_daily(md):
    """解析『每日更新』区。"""
    zone = md
    if "<!-- DAILY_UPDATE_START -->" in md:
        zone = md.split("<!-- DAILY_UPDATE_START -->", 1)[1]
    if "<!-- DAILY_UPDATE_END -->" in zone:
        zone = zone.split("<!-- DAILY_UPDATE_END -->", 1)[0]

    days = []
    blocks = re.split(r"\n##\s+(\d{4}-\d{2}-\d{2})\s+每日简报\s*\n", "\n" + zone)
    for i in range(1, len(blocks), 2):
        date, body = blocks[i], blocks[i + 1]
        sec_a, sec_b = "", ""
        parts = re.split(r"\n###\s+\(([ab])\)[^\n]*\n", "\n" + body)
        for j in range(1, len(parts), 2):
            if parts[j] == "a":
                sec_a = parts[j + 1]
            else:
                sec_b = parts[j + 1]

        items = []
        for raw in re.findall(r"\n\d+\.\s+(.+?)(?=\n\d+\.\s|\n>|\n###|\Z)", "\n" + sec_a, re.S):
            title, rest = split_title(raw)
            items.append({
                "title": title,
                "summary": strip_md(rest).split("来源：")[0].strip(" ·"),
                "type": classify(title, rest),
                "links": pull_links(raw),
            })

        policy = []
        for raw in re.findall(r"\n-\s+(.+?)(?=\n-\s|\n###|\n##|\Z)", "\n" + sec_b, re.S):
            title, rest = split_title(raw)
            body_txt = strip_md(rest).split("来源：")[0].strip(" ·")
            changed = not any(k in title for k in ["无重要变动", "补充观察", "备注", "补充（"])
            policy.append({
                "title": title,
                "summary": body_txt,
                "changed": changed,
                "links": pull_links(raw),
            })

        if items or policy:
            days.append({"date": date, "items": items, "policy": policy})

    days.sort(key=lambda d: d["date"], reverse=True)
    return days


def parse_brief(path):
    """解析单期《AI信息咨询简报》。"""
    md = read(path)
    md = re.sub(r"^---\nAIGC:.*?\n---\n", "", md, flags=re.S)

    m = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(path))
    if not m:
        return None
    date = m.group(1)

    # 各期简报标题风格不一：可能带「一、」中文序号，「今日 AI 行动建议」中间可能有空格
    ORD = r"(?:[一二三四五六七八九十]+、\s*)?"

    def section(name):
        mm = re.search(r"\n##\s+" + ORD + name + r"[^\n]*\n(.*?)(?=\n##\s|\Z)", md, re.S)
        return mm.group(1) if mm else ""

    headlines = []
    for row in re.findall(r"\n\|\s*(\d+)\s*\|(.+?)\|(.+?)\|", section("今日要闻")):
        headlines.append({
            "text": strip_md(row[1]),
            "type": strip_md(row[2]) or "动态",
        })

    tools = []
    for row in re.findall(r"\n\|\s*(\d+)\s*\|(.+?)\|(.+?)\|", section("新工具/资源推荐")):
        link = LINK_RE.search(row[1])
        tools.append({
            "name": strip_md(row[1]),
            "note": strip_md(row[2]),
            "url": link.group(2) if link else "",
        })

    dm = re.search(r"\n##\s+" + ORD + r"(深度看点[^\n]*)\n(.*?)(?=\n##\s|\Z)", md, re.S)
    deep_title, deep_body = "", ""
    if dm:
        deep_title = strip_md(dm.group(1)).replace("深度看点：", "").replace("深度看点:", "").strip()
        deep_body = "\n".join(
            strip_md(x) for x in dm.group(2).strip().split("\n")
            if x.strip() and not x.startswith("|") and not x.startswith("---")
        )

    actions = []
    for row in re.findall(r"\n\d+\.\s+(.+)", section(r"今日\s*AI\s*行动建议")):
        actions.append(strip_md(row))

    # 兜底：部分期次不用表格，而是「## N. 标题」逐条成章
    if not headlines:
        for num, title, body in re.findall(r"\n##\s+(\d+)\.\s+([^\n]+)\n(.*?)(?=\n##\s|\Z)", md, re.S):
            first = next((strip_md(l) for l in body.split("\n")
                          if l.strip() and not l.startswith(("|", "-", ">", "#"))), "")
            headlines.append({
                "text": strip_md(title) + ("：" + first[:120] if first else ""),
                "type": classify(title, body),
            })

    if not (headlines or tools or actions):
        return None
    return {
        "date": date,
        "headlines": headlines,
        "tools": tools,
        "deepTitle": deep_title,
        "deepBody": deep_body[:900],
        "actions": actions,
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    hub_md = os.path.join(ROOT, "AI资讯与免费API汇总.md")
    news = parse_daily(read(hub_md)) if os.path.exists(hub_md) else []

    briefs = []
    for p in glob.glob(os.path.join(ROOT, "AI信息咨询简报*.md")):
        b = parse_brief(p)
        if b:
            briefs.append(b)
    briefs.sort(key=lambda b: b["date"], reverse=True)

    payload = (
        "// 由 build/build_data.py 自动生成，请勿手改\n"
        "window.__NEWS__ = %s;\n"
        "window.__BRIEFS__ = %s;\n"
        "window.__BUILT_AT__ = %s;\n"
    ) % (
        json.dumps(news, ensure_ascii=False, indent=1),
        json.dumps(briefs, ensure_ascii=False, indent=1),
        json.dumps(datetime.now().strftime("%Y-%m-%d %H:%M")),
    )

    out = os.path.join(OUT_DIR, "news.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write(payload)

    n_items = sum(len(d["items"]) for d in news)
    n_policy = sum(len(d["policy"]) for d in news)
    print("每日简报 %d 期 / 动态 %d 条 / 政策 %d 条" % (len(news), n_items, n_policy))
    print("深度简报 %d 期" % len(briefs))
    print("写入 -> %s (%.1f KB)" % (out, os.path.getsize(out) / 1024))


if __name__ == "__main__":
    main()
