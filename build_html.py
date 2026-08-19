import re
import pathlib
import markdown
from markdown.extensions import tables, fenced_code, toc

SRC = pathlib.Path(r"D:\桌面\每日咨询\AI资讯与免费API汇总.md")
OUT = pathlib.Path(r"D:\桌面\每日咨询\AI资讯与免费API汇总.html")

text = SRC.read_text(encoding="utf-8")

md = markdown.Markdown(extensions=[
    tables.makeExtension(),
    fenced_code.makeExtension(),
    toc.makeExtension(toc_depth="2-3"),
])
body = md.convert(text)

toc_html = getattr(md, "toc", "")
m = re.search(r"<ul>.*</ul>", toc_html, re.S)
nav_ul = m.group(0) if m else ""

TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>免费 AI 资讯 & 免费 API 资源中心</title>
<style>
  :root {
    --fg:#1f2933; --muted:#5b6776; --bg:#ffffff; --panel:#fbfcfe; --accent:#2563eb;
    --code:#f4f6f8; --border:#e4e7eb; --chip:#eef3ff; --chip-fg:#2563eb;
    --badge-green:#16a34a; --badge-green-bg:#dcfce7;
    --badge-amber:#b45309; --badge-amber-bg:#fef3c7;
    --badge-blue:#1d4ed8; --badge-blue-bg:#dbeafe;
    --badge-purple:#7c3aed; --badge-purple-bg:#ede9fe;
    --topbar-h:58px; --chipbar-h:46px;
  }
  [data-theme="dark"] {
    --fg:#e6eaf0; --muted:#9aa6b5; --bg:#0f141b; --panel:#161c26; --accent:#6ea8fe;
    --code:#11161f; --border:#283142; --chip:#1d2735; --chip-fg:#9ec5ff;
    --badge-green:#4ade80; --badge-green-bg:#13351f;
    --badge-amber:#fbbf24; --badge-amber-bg:#3a2c0c;
    --badge-blue:#93c5fd; --badge-blue-bg:#16263f;
    --badge-purple:#c4b5fd; --badge-purple-bg:#2a2140;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
         color: var(--fg); background: var(--bg); margin: 0; line-height: 1.7; }

  /* Top bar */
  .topbar { position: fixed; top: 0; left: 0; right: 0; height: var(--topbar-h);
            display: flex; align-items: center; gap: 14px; padding: 0 18px;
            background: var(--panel); border-bottom: 1px solid var(--border); z-index: 30; }
  .topbar .brand { font-weight: 700; font-size: 16px; color: var(--accent); white-space: nowrap; }
  .topbar .brand small { color: var(--muted); font-weight: 400; font-size: 12px; display:block; }
  .search { flex: 1; max-width: 520px; position: relative; }
  .search input { width: 100%; padding: 9px 12px 9px 34px; border: 1px solid var(--border);
                  border-radius: 8px; background: var(--bg); color: var(--fg); font-size: 14px; outline: none; }
  .search input:focus { border-color: var(--accent); }
  .search::before { content: "🔍"; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity:.6; }
  .theme-btn { border: 1px solid var(--border); background: var(--bg); color: var(--fg);
               border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 13px; white-space: nowrap; }
  .theme-btn:hover { border-color: var(--accent); }

  /* Chip filter bar */
  .chipbar { position: fixed; top: var(--topbar-h); left: 0; right: 0; height: var(--chipbar-h);
             display: flex; align-items: center; gap: 8px; padding: 0 18px; overflow-x: auto;
             background: var(--panel); border-bottom: 1px solid var(--border); z-index: 29; }
  .chipbar .stat { color: var(--muted); font-size: 12.5px; white-space: nowrap; margin-right: 4px; }
  .chip { border: 1px solid var(--border); background: var(--chip); color: var(--chip-fg);
          border-radius: 999px; padding: 5px 12px; font-size: 12.5px; cursor: pointer; white-space: nowrap; user-select: none; }
  .chip:hover { border-color: var(--accent); }
  .chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .chip .cnt { opacity: .7; font-size: 11px; }

  /* Sidebar TOC */
  .sidebar { position: fixed; top: calc(var(--topbar-h) + var(--chipbar-h)); left: 0; width: 270px;
             height: calc(100vh - var(--topbar-h) - var(--chipbar-h)); overflow-y: auto;
             border-right: 1px solid var(--border); background: var(--panel); padding: 20px 16px; }
  .sidebar h4 { margin: 0 0 10px; font-size: 12px; letter-spacing: .08em; color: var(--muted); text-transform: uppercase; }
  .sidebar ul { list-style: none; margin: 0; padding: 0; }
  .sidebar li { margin: 2px 0; }
  .sidebar li a { display: block; padding: 5px 8px; border-radius: 6px; color: var(--muted);
                  text-decoration: none; font-size: 13.5px; }
  .sidebar li a:hover { background: var(--chip); color: var(--accent); }
  .sidebar li.toc-h2 a { font-weight: 600; color: var(--fg); }
  .sidebar li.toc-h3 a { padding-left: 22px; font-size: 13px; }

  /* Main content */
  .content { margin-left: 270px; margin-top: calc(var(--topbar-h) + var(--chipbar-h));
             padding: 28px 36px 90px; max-width: 1040px; }
  h1 { font-size: 26px; border-bottom: 3px solid var(--accent); padding-bottom: 10px; }
  h2 { font-size: 21px; margin-top: 40px; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 6px; }
  h3 { font-size: 17px; margin-top: 28px; }
  blockquote { border-left: 4px solid var(--accent); background: var(--chip); margin: 14px 0; padding: 11px 15px; color: var(--muted); border-radius: 4px; font-size: 13.5px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 13.5px; }
  th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: var(--code); font-weight: 600; }
  tr:nth-child(even) td { background: var(--panel); }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { background: var(--code); padding: 2px 6px; border-radius: 4px; font-size: 12.5px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 14px 16px; border-radius: 8px; overflow-x: auto; position: relative; }
  pre code { background: none; padding: 0; color: inherit; }
  hr { border: none; border-top: 1px solid var(--border); margin: 30px 0; }
  .foot { margin-top: 44px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 14px; }

  /* Tag pills */
  .tag { display: inline-block; border-radius: 6px; padding: 2px 8px; margin: 2px 3px 2px 0;
         font-size: 11.5px; line-height: 1.6; white-space: nowrap; }
  .tag.green { color: var(--badge-green); background: var(--badge-green-bg); }
  .tag.amber { color: var(--badge-amber); background: var(--badge-amber-bg); }
  .tag.blue  { color: var(--badge-blue);  background: var(--badge-blue-bg); }
  .tag.purple{ color: var(--badge-purple);background: var(--badge-purple-bg); }

  /* Copy button */
  .copy-btn { position: absolute; top: 8px; right: 10px; border: 1px solid #334155; background: #1e293b;
              color: #cbd5e1; border-radius: 6px; padding: 3px 9px; font-size: 12px; cursor: pointer; }
  .copy-btn:hover { background: #334155; }

  .to-top { position: fixed; right: 20px; bottom: 22px; width: 42px; height: 42px; border-radius: 50%;
            border: 1px solid var(--border); background: var(--panel); color: var(--accent); cursor: pointer;
            font-size: 18px; display: none; z-index: 40; }
  .to-top.show { display: block; }

  .no-result { color: var(--muted); padding: 30px; text-align: center; display: none; }

  @media (max-width: 980px) {
    .sidebar { display: none; }
    .content { margin-left: 0; padding: 22px 16px 70px; }
    .topbar .brand small { display: none; }
  }
</style>
</head>
<body>
<header class="topbar">
  <div class="brand">免费 AI 资源中心<small>资讯 · 免费 API · 可筛选</small></div>
  <div class="search"><input id="q" type="text" placeholder="搜索模型 / API / 场景 / 标签…"></div>
  <button class="theme-btn" id="theme">🌙 深色</button>
</header>
<div class="chipbar" id="chipbar"><span class="stat" id="stat"></span></div>
<nav class="sidebar"><h4>目录</h4>__NAV__</nav>
<main class="content">
__BODY__
<div class="no-result" id="nores">没有匹配的结果，试试别的关键词或清除筛选。</div>
<div class="foot">本文档由 WorkBuddy 整理 · 免费额度与政策会变动，生产使用前请以官方最新文档为准。</div>
</main>
<button class="to-top" id="totop" title="返回顶部">↑</button>

<script>
(function(){
  var TAGCLASS = {
    "免费": "green", "本地": "green", "免Key": "green", "离线": "green",
    "免费档": "amber", "Freemium": "amber", "API Key": "amber", "登录": "amber",
    "多模态": "blue", "长上下文": "blue", "低延迟": "blue", "中文强": "blue", "代码强": "blue",
    "CORS": "purple", "国内": "purple", "发现": "purple"
  };

  // 1) Render tag pills + collect data-tags for every row that has a 标签 column
  var tables = document.querySelectorAll(".content table");
  var tagCount = {};
  var totalEntries = 0;
  tables.forEach(function(t){
    var headers = t.querySelectorAll("thead th");
    var tagIdx = -1;
    headers.forEach(function(h, i){ if(h.textContent.trim() === "标签") tagIdx = i; });
    if(tagIdx < 0) return;
    t.querySelectorAll("tbody tr").forEach(function(tr){
      var cell = tr.children[tagIdx];
      if(!cell) return;
      var raw = cell.textContent.trim();
      var tags = raw.split(/[·|]/).map(function(s){return s.trim();}).filter(Boolean);
      cell.innerHTML = "";
      tags.forEach(function(tg){
        var cls = TAGCLASS[tg] || "blue";
        var span = document.createElement("span");
        span.className = "tag " + cls;
        span.textContent = tg;
        cell.appendChild(span);
      });
      tr.setAttribute("data-tags", tags.join("|"));
      totalEntries++;
      tags.forEach(function(tg){ tagCount[tg] = (tagCount[tg]||0)+1; });
    });
  });

  // 2) Build filter chips
  var chipbar = document.getElementById("chipbar");
  var stat = document.getElementById("stat");
  stat.textContent = "共收录 " + totalEntries + " 个免费资源";
  var ordered = Object.keys(tagCount).sort(function(a,b){ return tagCount[b]-tagCount[a]; });
  var active = {};
  ordered.forEach(function(tg){
    var chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = tg + ' <span class="cnt">' + tagCount[tg] + '</span>';
    chip.onclick = function(){
      if(active[tg]){ delete active[tg]; chip.classList.remove("active"); }
      else { active[tg] = true; chip.classList.add("active"); }
      applyFilter();
    };
    chipbar.appendChild(chip);
  });

  // 3) Search + filter
  var q = document.getElementById("q");
  var nores = document.getElementById("nores");
  function applyFilter(){
    var kw = q.value.trim().toLowerCase();
    var activeTags = Object.keys(active);
    var anyTableHasRows = false;
    tables.forEach(function(t){
      var headers = t.querySelectorAll("thead th");
      var hasTag = false;
      headers.forEach(function(h){ if(h.textContent.trim()==="标签") hasTag = true; });
      var rows = t.querySelectorAll("tbody tr");
      var visibleInTable = 0;
      rows.forEach(function(tr){
        var tags = (tr.getAttribute("data-tags")||"").split("|");
        var text = tr.textContent.toLowerCase();
        var okTag = activeTags.every(function(at){ return tags.indexOf(at) >= 0; });
        var okKw = !kw || text.indexOf(kw) >= 0;
        // when chips active but table has no 标签 column, keep it visible
        if(activeTags.length && !hasTag){ tr.style.display = ""; visibleInTable++; return; }
        if(okTag && okKw){ tr.style.display = ""; visibleInTable++; }
        else { tr.style.display = "none"; }
      });
      if(visibleInTable > 0) anyTableHasRows = true;
      // hide table entirely if it has a 标签 column and all its rows are filtered out
      if(hasTag && visibleInTable === 0 && (activeTags.length || kw)){
        t.style.display = "none";
      } else {
        t.style.display = "";
      }
    });
    nores.style.display = anyTableHasRows ? "none" : "block";
  }
  q.addEventListener("input", applyFilter);

  // 4) Copy buttons on code blocks
  document.querySelectorAll(".content pre").forEach(function(pre){
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "复制";
    btn.onclick = function(){
      var code = pre.querySelector("code");
      var txt = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(txt).then(function(){
        btn.textContent = "已复制";
        setTimeout(function(){ btn.textContent = "复制"; }, 1200);
      });
    };
    pre.appendChild(btn);
  });

  // 5) External links open in new tab
  document.querySelectorAll('.content a[href^="http"]').forEach(function(a){
    a.target = "_blank"; a.rel = "noopener noreferrer";
  });

  // 6) Dark mode
  var html = document.documentElement;
  var themeBtn = document.getElementById("theme");
  function setTheme(t){
    html.setAttribute("data-theme", t);
    themeBtn.textContent = t === "dark" ? "☀️ 浅色" : "🌙 深色";
    try { localStorage.setItem("aihub-theme", t); } catch(e){}
  }
  try { var saved = localStorage.getItem("aihub-theme"); if(saved) setTheme(saved); } catch(e){}
  themeBtn.onclick = function(){
    setTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
  };

  // 7) Back to top
  var totop = document.getElementById("totop");
  window.addEventListener("scroll", function(){
    totop.classList.toggle("show", window.scrollY > 400);
  });
  totop.onclick = function(){ window.scrollTo({top:0, behavior:"smooth"}); };
})();
</script>
</body>
</html>
"""

html = TEMPLATE.replace("__BODY__", body).replace("__NAV__", nav_ul)
OUT.write_text(html, encoding="utf-8")
print("WROTE", OUT, len(html), "bytes; nav:", nav_ul.count("<li"), "; entries parsed at runtime via JS")
