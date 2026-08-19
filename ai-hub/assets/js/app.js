/* ============================================================
   JY AI 资源站 — 前端逻辑 v2（原生 JS，无依赖、file:// 可直接打开）
   增强：数字滚动 · 环形评分 · 鼠标追踪光效 · 入场动画 · 粒子背景
   ============================================================ */
(function () {
  'use strict';

  // ---------- 数据引用 ----------
  var CATS = window.__CATS__ || [];
  var APIS = window.__APIS__ || [];
  var TOOLS = window.__TOOLS__ || [];
  var SOURCES = window.__SOURCES__ || [];
  var LEARN = window.__LEARN__ || [];
  var SCN = window.__SCENARIOS__ || [];
  var NEWS = window.__NEWS__ || [];
  var BRIEFS = window.__BRIEFS__ || [];
  var BUILT_AT = window.__BUILT_AT__ || '';

  var API_BY_ID = {};
  APIS.forEach(function (a) { API_BY_ID[a.id] = a; });
  var TOOL_BY_ID = {};
  TOOLS.forEach(function (t) { TOOL_BY_ID[t.id] = t; });

  function resolveHit(id) {
    if (API_BY_ID[id]) return { kind: 'api', data: API_BY_ID[id] };
    if (TOOL_BY_ID[id]) return { kind: 'tool', data: TOOL_BY_ID[id] };
    return null;
  }

  // ---------- 工具函数 ----------
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtNum(n) {
    if (n == null) return '未公布';
    if (n >= 10000) return (n / 10000) + ' 万';
    return String(n);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------- 白嫖指数（运行时计算，规则公开可复核） ----------
  function score(a) {
    var s = 0, parts = [];
    var p = a.pricing;
    if (p === 'local') { s += 45; parts.push(['本机部署 · 无限免费', 45]); }
    else if (p === 'free') { s += 38; parts.push(['完全免费 / 开源', 38]); }
    else { s += 18; parts.push(['有限免费额度', 18]); }
    if (a.keyless) { s += 10; parts.push(['免 Key', 10]); }
    if (!a.card) { s += 8; parts.push(['无需信用卡', 8]); }
    if (a.cors) { s += 7; parts.push(['支持 CORS · 浏览器直连', 7]); }
    if (!a.expire) { s += 7; parts.push(['额度不过期', 7]); }
    if (a.generous) { s += 10; parts.push(['额度慷慨', 10]); }
    if (a.rpm && a.rpm >= 30) { s += 5; parts.push(['限速宽松 (RPM≥30)', 5]); }
    if (a.rpd && a.rpd >= 10000) { s += 3; parts.push(['日额度高 (RPD≥1万)', 3]); }
    s = Math.min(100, s);
    return { total: s, parts: parts };
  }
  function scoreColor(s) {
    if (s >= 80) return 'var(--free)';
    if (s >= 60) return 'var(--tier)';
    if (s >= 40) return 'var(--cn)';
    return 'var(--danger)';
  }
  function scoreHex(s) {
    if (s >= 80) return '#2deb9a';
    if (s >= 60) return '#4f8fff';
    if (s >= 40) return '#ff9f43';
    return '#ff5e6c';
  }
  function scoreLabel(s) {
    if (s >= 80) return '极佳';
    if (s >= 60) return '优秀';
    if (s >= 40) return '可用';
    return '一般';
  }

  // 环形评分 SVG
  function scoreRing(s, size) {
    size = size || 38;
    var r = (size - 6) / 2;
    var circ = 2 * Math.PI * r;
    var offset = circ * (1 - s / 100);
    var c = scoreHex(s);
    return '<span class="score-ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle class="bg" cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '"/>' +
      '<circle class="fg" cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" ' +
      'stroke="' + c + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"/>' +
      '</svg>' +
      '<span class="val" style="color:' + c + '">' + s + '</span>' +
      '</span>';
  }

  // ---------- 数字滚动动画 ----------
  function animateNumber(el, target, dur) {
    dur = dur || 1200;
    var start = 0;
    var startTime = null;
    function tick(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / dur, 1);
      // easeOutExpo
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateStats() {
    $all('.stat .num').forEach(function (el) {
      var target = parseInt(el.textContent, 10);
      if (!isNaN(target)) {
        el.textContent = '0';
        setTimeout(function () { animateNumber(el, target, 1400); }, 100);
      }
    });
  }

  // ---------- 应用状态 ----------
  var state = {
    view: 'home',
    cat: 'all',
    pricing: [],
    region: [],
    flags: [],
    q: '',
    sort: 'score',
    scenarioMemo: null,
    compare: []
  };

  var view = $('#view');

  // ============================================================
  //  路由
  // ============================================================
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var qIdx = h.indexOf('?');
    var path = qIdx >= 0 ? h.slice(0, qIdx) : h;
    var qs = qIdx >= 0 ? h.slice(qIdx + 1) : '';
    var params = {};
    qs.split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { path: path || 'home', params: params };
  }

  function navigate(path) {
    if (location.hash === '#/' + path) { route(); }
    else { location.hash = '#/' + path; }
  }

  function route() {
    var r = parseHash();
    state.view = r.path;
    if (r.params.q != null) { state.q = r.params.q; }
    if (state.view === 'catalog' && r.params.q != null) {
      state.cat = 'all'; state.pricing = []; state.region = []; state.flags = [];
    }
    setActiveNav();
    renderWithSkeleton();
  }

  function setActiveNav() {
    $all('.nav-link').forEach(function (n) {
      n.classList.toggle('active', n.getAttribute('data-nav') === state.view);
    });
  }

  // ============================================================
  //  渲染框架（含骨架）
  // ============================================================
  function renderWithSkeleton() {
    var sk = skeletonFor(state.view);
    view.innerHTML = sk;
    view.classList.remove('view-transition');
    void view.offsetWidth; // 触发 reflow
    view.classList.add('view-transition');
    setTimeout(function () {
      if (state.view === 'home') renderHome();
      else if (state.view === 'catalog') renderCatalog();
      else if (state.view === 'news') renderNews();
      else if (state.view === 'tools') renderTools();
      else renderHome();
      bindViewEvents();
    }, 180);
  }

  function skeletonFor(v) {
    if (v === 'catalog') {
      return '<div class="catalog-layout"><div class="sidebar"><div class="sk sk-card" style="height:220px"></div></div>' +
        '<div class="card-grid">' + repeat('<div class="sk sk-card"></div>', 8) + '</div></div>';
    }
    if (v === 'home') {
      return '<div class="hero"><div class="sk sk-line" style="width:60%;height:32px"></div>' +
        '<div class="sk sk-line" style="width:42%"></div><div class="sk sk-card" style="height:58px"></div></div>' +
        '<div class="stat-row">' + repeat('<div class="sk sk-card" style="height:82px"></div>', 4) + '</div>' +
        '<div class="scenarios">' + repeat('<div class="sk sk-card" style="height:100px"></div>', 6) + '</div>';
    }
    return '<div class="card-grid">' + repeat('<div class="sk sk-card"></div>', 9) + '</div>';
  }
  function repeat(s, n) { var o = ''; for (var i = 0; i < n; i++) o += s; return o; }

  // ============================================================
  //  首页
  // ============================================================
  function renderHome() {
    var freeCnt = APIS.filter(function (a) { return a.pricing !== 'tier'; }).length;
    var localCnt = APIS.filter(function (a) { return a.region === 'local'; }).length;
    var top = APIS.slice().sort(function (a, b) { return score(b).total - score(a).total; }).slice(0, 4);
    var latestNews = NEWS.slice().sort(function (a, b) { return b.date > a.date ? 1 : -1; }).slice(0, 4);

    var html = '';
    html += '<section class="hero anim-fade-up">' +
      '<canvas class="hero-canvas" id="heroCanvas"></canvas>' +
      '<h1>免费 AI 能力，<span class="hl">选型直达</span>。<br>面向数据合规的 API 与工具中心。</h1>' +
      '<p>复刻主流 AI 工具目录站的交互逻辑，立足会计师事务所「敏感数据不出境」的底线：免费额度看板、数据合规筛选、场景一键直达。</p>' +
      '<form class="hero-search" id="heroForm">' +
      '<input id="heroInput" type="text" placeholder="我要做什么？例如：审计底稿不能出本机 / 要最快的推理" autocomplete="off" />' +
      '<button class="btn primary" type="submit">开始选型</button>' +
      '</form></section>';

    html += '<div class="stat-row stagger">' +
      statCol(APIS.length, '收录免费 / 开源 API') +
      statCol(freeCnt, '完全免费或本地部署') +
      statCol(localCnt, '数据不出本机的本地方案') +
      statCol(SCN.length, '「我要做什么」场景直达') +
      '</div>';

    html += '<div class="section-title anim-fade-up"><span class="bar"></span>场景直达 · 我要做什么？</div>';
    html += '<div class="scenarios stagger">';
    SCN.forEach(function (s) {
      html += '<div class="scenario" data-q="' + esc(s.q) + '">' +
        '<div class="q">' + esc(s.q) + '</div>' +
        '<div class="note">' + esc(s.note) + '</div>' +
        '<div class="hit-tags">' + s.hit.slice(0, 4).map(function (id) {
          var r = resolveHit(id);
          return r ? '<span class="badge tag">' + esc(r.data.name.replace(/（本地）/, '')) + '</span>' : '';
        }).join('') + '</div>' +
        '</div>';
    });
    html += '</div>';

    html += '<div class="section-title anim-fade-up"><span class="bar"></span>白嫖指数 · 免费额度看板' +
      '<a class="more" href="#/catalog">查看全部 →</a></div>';
    html += '<div class="board-preview stagger">';
    top.forEach(function (a) {
      var sc = score(a);
      html += '<div class="board-card" data-api="' + a.id + '">' +
        '<div class="bc-top"><span class="bc-name">' + esc(a.name) + '</span>' +
        pricingBadge(a.pricing) + '</div>' +
        '<div class="bc-quota">' + esc(a.quota) + '</div>' +
        '<div class="bc-score">' + scoreRing(sc.total, 42) + '<span style="font-size:12px;color:var(--text-2)">' + scoreLabel(sc.total) + '</span></div>' +
        '</div>';
    });
    html += '</div>';

    html += '<div class="section-title anim-fade-up"><span class="bar"></span>最新资讯' +
      '<a class="more" href="#/news">进入资讯流 →</a></div>';
    html += '<div class="feed stagger">';
    latestNews.forEach(function (d) {
      var first = d.items && d.items[0];
      if (!first) return;
      html += '<div class="feed-item"><div class="fi-top"><span class="fi-date">' + esc(d.date) + '</span>' +
        (first.type ? '<span class="badge tag">' + esc(first.type) + '</span>' : '') + '</div>' +
        '<div class="fi-title">' + esc(first.title) + '</div>' +
        '<div class="fi-sum">' + esc(first.summary) + '</div></div>';
    });
    html += '</div>';

    view.innerHTML = html;
    initHeroCanvas();
    animateStats();
  }

  function statCol(num, lbl) {
    return '<div class="stat anim-fade-up"><div class="num">' + num + '</div><div class="lbl">' + esc(lbl) + '</div></div>';
  }

  // ============================================================
  //  Hero 粒子背景
  // ============================================================
  function initHeroCanvas() {
    var cv = $('#heroCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    function resize() {
      var rect = cv.parentElement.getBoundingClientRect();
      cv.width = rect.width;
      cv.height = rect.height;
    }
    resize();

    var particles = [];
    var PARTICLE_COUNT = Math.min(50, Math.floor(cv.width * cv.height / 12000));

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.4 + 0.1
      });
    }

    var animId;
    var running = true;

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, cv.width, cv.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cv.width;
        if (p.x > cv.width) p.x = 0;
        if (p.y < 0) p.y = cv.height;
        if (p.y > cv.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79,143,255,' + p.a + ')';
        ctx.fill();
      }

      // 连线
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(79,143,255,' + (0.08 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    // 鼠标交互
    cv.parentElement.addEventListener('mousemove', function (e) {
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      for (var i = 0; i < particles.length; i++) {
        var dx = particles[i].x - mx;
        var dy = particles[i].y - my;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          var force = (100 - dist) / 100 * 0.02;
          particles[i].vx += dx * force * 0.01;
          particles[i].vy += dy * force * 0.01;
        }
      }
    });

    // 离开页面时停止
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; cancelAnimationFrame(animId); }
      else if (!running && state.view === 'home') { running = true; draw(); }
    });

    //  resize
    var to;
    window.addEventListener('resize', function () {
      clearTimeout(to);
      to = setTimeout(resize, 200);
    });
  }

  // ============================================================
  //  API 目录
  // ============================================================
  function renderCatalog() {
    var html = '';
    if (state.scenarioMemo) {
      html += '<div class="warn-box anim-fade-up" style="margin-bottom:18px;background:var(--brand-soft);color:var(--brand-ink)">' +
        '场景：<b>' + esc(state.scenarioMemo.q) + '</b> — ' + esc(state.scenarioMemo.note) +
        ' <a href="#/catalog" style="float:right" id="clearScenario">清除</a></div>';
    }

    html += '<div class="catalog-layout"><aside class="sidebar">';

    html += '<div class="side-block"><div class="side-h">分类</div><div class="cat-list">';
    html += catItem('all', '全部', countByCat('all'));
    CATS.forEach(function (c) { html += catItem(c.id, c.name, countByCat(c.id), c.icon); });
    html += '</div></div>';

    html += '<div class="side-block"><div class="side-h">价格模式</div><div class="facet">';
    html += facetChip('pricing', 'free', '完全免费');
    html += facetChip('pricing', 'tier', '有限免费额度');
    html += facetChip('pricing', 'local', '本机部署');
    html += '</div></div>';

    html += '<div class="side-block"><div class="side-h">数据合规</div><div class="facet">';
    html += facetChip('region', 'cn', '国内节点');
    html += facetChip('region', 'local', '数据不出本机');
    html += facetChip('flags', 'keyless', '免 Key');
    html += facetChip('flags', 'cors', '支持 CORS');
    html += facetChip('flags', 'nocard', '无需信用卡');
    html += facetChip('flags', 'noexpire', '额度不过期');
    html += facetChip('flags', 'generous', '额度慷慨');
    html += '</div></div>';

    html += '</aside><section style="min-width:0">';

    html += '<div class="toolbar">' +
      '<div class="search-inline"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input id="catSearch" type="text" placeholder="搜索名称 / 厂商 / 用途 / 标签" value="' + esc(state.q) + '" /></div>' +
      '<select class="select" id="catSort">' +
      '<option value="score">白嫖指数 ↓</option>' +
      '<option value="rpm">限速高（RPM）</option>' +
      '<option value="name">名称 A→Z</option>' +
      '<option value="verified">核验日期新</option>' +
      '</select>' +
      '<span class="result-count" id="catCount"></span>' +
      '</div>';

    html += '<div class="card-grid stagger" id="catGrid"></div>';
    html += '</section></div>';

    view.innerHTML = html;
    $('#catSort').value = state.sort;
    paintCatalogGrid();
  }

  function catItem(id, name, cnt, icon) {
    var ic = icon ? '<svg viewBox="0 0 24 24">' + icon + '</svg>' : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>';
    return '<div class="cat-item ' + (state.cat === id ? 'active' : '') + '" data-cat="' + id + '">' +
      ic + '<span>' + esc(name) + '</span><span class="cnt">' + cnt + '</span></div>';
  }
  function facetChip(group, val, label) {
    var on = state[group].indexOf(val) >= 0;
    return '<span class="chip ' + (on ? 'active' : '') + '" data-facet-group="' + group + '" data-facet-val="' + val + '">' + esc(label) + '</span>';
  }
  function countByCat(id) {
    if (id === 'all') return APIS.length;
    return APIS.filter(function (a) { return a.cat === id; }).length;
  }

  function filteredAPIs() {
    var q = state.q.trim().toLowerCase();
    var list = APIS.filter(function (a) {
      if (state.cat !== 'all' && a.cat !== state.cat) return false;
      if (state.pricing.length && state.pricing.indexOf(a.pricing) < 0) return false;
      if (state.region.length && state.region.indexOf(a.region) < 0) return false;
      if (state.flags.indexOf('keyless') >= 0 && !a.keyless) return false;
      if (state.flags.indexOf('cors') >= 0 && !a.cors) return false;
      if (state.flags.indexOf('nocard') >= 0 && a.card) return false;
      if (state.flags.indexOf('noexpire') >= 0 && a.expire) return false;
      if (state.flags.indexOf('generous') >= 0 && !a.generous) return false;
      if (q) {
        var hay = (a.name + ' ' + a.vendor + ' ' + a.desc + ' ' + a.use + ' ' + (a.tags || []).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    if (state.sort === 'score') list.sort(function (a, b) { return score(b).total - score(a).total; });
    else if (state.sort === 'rpm') list.sort(function (a, b) { return (b.rpm || -1) - (a.rpm || -1); });
    else if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); });
    else if (state.sort === 'verified') list.sort(function (a, b) { return (b.verified || '').localeCompare(a.verified || ''); });
    return list;
  }

  function paintCatalogGrid() {
    var grid = $('#catGrid');
    if (!grid) return;
    var list = filteredAPIs();
    var cnt = $('#catCount');
    if (cnt) cnt.textContent = '共 ' + list.length + ' 个';
    if (!list.length) { grid.innerHTML = '<div class="empty">没有匹配的 API，试试放宽筛选条件。</div>'; return; }
    grid.innerHTML = list.map(function (a) {
      var sc = score(a);
      var inCmp = state.compare.indexOf(a.id) >= 0;
      return '<article class="api-card anim-fade-up" data-api="' + a.id + '">' +
        '<div class="ac-top"><div><div class="ac-name">' + esc(a.name) + '</div>' +
        '<div class="ac-vendor">' + esc(a.vendor) + '</div></div>' +
        pricingBadge(a.pricing) + '</div>' +
        '<div class="ac-desc">' + esc(a.desc) + '</div>' +
        '<div class="ac-quota">🎁 ' + esc(a.quota) + '</div>' +
        '<div class="ac-flags">' + flagBadges(a) + '</div>' +
        '<div class="ac-foot">' +
          '<label class="ac-score" style="cursor:pointer">' +
            '<input type="checkbox" class="cmp-chk" data-cmp="' + a.id + '"' + (inCmp ? ' checked' : '') + ' />' +
            '<span style="font-size:11.5px;color:var(--text-3)">对比</span>' +
          '</label>' +
          scoreRing(sc.total, 38) +
          '<span style="font-size:11px;color:var(--text-3)">' + scoreLabel(sc.total) + '</span>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  // ---------- 徽章 ----------
  function pricingBadge(p) {
    if (p === 'free') return '<span class="badge pricing-free">完全免费</span>';
    if (p === 'tier') return '<span class="badge pricing-tier">免费额度</span>';
    if (p === 'local') return '<span class="badge pricing-local">本地部署</span>';
    return '';
  }
  function regionBadge(r) {
    if (r === 'cn') return '<span class="badge region-cn">国内</span>';
    if (r === 'local') return '<span class="badge region-local">本机</span>';
    return '<span class="badge region-global">全球</span>';
  }
  function flagBadges(a) {
    var out = '';
    out += regionBadge(a.region);
    if (a.keyless) out += '<span class="badge flag on">免Key</span>';
    if (a.cors) out += '<span class="badge flag on">CORS</span>';
    if (!a.card) out += '<span class="badge flag on">无信用卡</span>';
    if (!a.expire) out += '<span class="badge flag on">不过期</span>';
    if (a.generous) out += '<span class="badge flag on">额度慷慨</span>';
    return out;
  }

  // ============================================================
  //  资讯流
  // ============================================================
  function renderNews() {
    var html = '';
    html += '<div class="tabs" id="newsTabs">' +
      '<div class="tab active" data-tab="brief">深度简报（' + BRIEFS.length + '）</div>' +
      '<div class="tab" data-tab="daily">每日速览（' + NEWS.length + '）</div>' +
      '</div>';
    html += '<div id="newsBody"></div>';
    view.innerHTML = html;
    paintNews('brief');
  }

  function paintNews(tab) {
    var body = $('#newsBody');
    if (!body) return;
    if (tab === 'brief') {
      var list = BRIEFS.slice().sort(function (a, b) { return b.date > a.date ? 1 : -1; });
      var h = '<div class="timeline">';
      list.forEach(function (d) {
        h += '<div class="news-day anim-fade-up"><div class="nd-date">' + esc(d.date) +
          ' <span class="nd-tag">深度简报</span></div>';
        if (d.headlines && d.headlines.length) {
          h += '<div class="news-list">';
          d.headlines.forEach(function (it) {
            h += '<div class="news-item"><span class="ni-type">' + esc(it.type || '资讯') + '</span>' +
              '<div class="ni-main"><div class="ni-title">' + esc(it.text) + '</div></div></div>';
          });
          h += '</div>';
        }
        if (d.deepTitle || d.deepBody) {
          h += '<div class="nd-deep"><div class="dt">' + esc(d.deepTitle || '深度聚焦') + '</div>' +
            '<p>' + esc(d.deepBody || '').replace(/\n/g, '<br>') + '</p></div>';
        }
        if (d.tools && d.tools.length) {
          h += '<div class="nd-tools"><div class="nd-date" style="margin-bottom:6px">🔧 本期工具</div>';
          d.tools.forEach(function (tl) {
            h += '<div class="tool-row"><span class="tn">' + (tl.url ? '<a href="' + esc(tl.url) + '" target="_blank" rel="noopener">' + esc(tl.name) + '</a>' : esc(tl.name)) + '</span>' +
              '<span class="tt">' + esc(tl.note || '') + '</span></div>';
          });
          h += '</div>';
        }
        if (d.actions && d.actions.length) {
          h += '<div class="nd-actions"><div class="ah">今日 AI 行动建议</div><ul>' +
            d.actions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>';
        }
        h += '</div>';
      });
      h += '</div>';
      body.innerHTML = h;
    } else {
      var types = {};
      NEWS.forEach(function (d) { (d.items || []).forEach(function (it) { if (it.type) types[it.type] = 1; }); });
      var typeArr = Object.keys(types);
      var h2 = '<div class="toolbar" style="margin-bottom:16px"><div class="facet" id="feedTypes">' +
        '<span class="chip active" data-ftype="">全部</span>' +
        typeArr.map(function (t) { return '<span class="chip" data-ftype="' + esc(t) + '">' + esc(t) + '</span>'; }).join('') +
        '</div></div><div class="feed stagger" id="feedList"></div>';
      body.innerHTML = h2;
      paintFeed('');
    }
  }

  function paintFeed(ftype) {
    var box = $('#feedList');
    if (!box) return;
    var items = [];
    NEWS.slice().sort(function (a, b) { return b.date > a.date ? 1 : -1; }).forEach(function (d) {
      (d.items || []).forEach(function (it) {
        if (ftype && it.type !== ftype) return;
        items.push({ date: d.date, it: it });
      });
    });
    if (!items.length) { box.innerHTML = '<div class="empty">该类型暂无内容。</div>'; return; }
    box.innerHTML = items.map(function (x) {
      var it = x.it;
      var links = (it.links || []).map(function (l) {
        return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label || '链接') + ' ↗</a>';
      }).join('');
      return '<div class="feed-item anim-fade-up"><div class="fi-top"><span class="fi-date">' + esc(x.date) + '</span>' +
        (it.type ? '<span class="badge tag">' + esc(it.type) + '</span>' : '') + '</div>' +
        '<div class="fi-title">' + esc(it.title) + '</div>' +
        '<div class="fi-sum">' + esc(it.summary) + '</div>' +
        (links ? '<div class="ni-links">' + links + '</div>' : '') + '</div>';
    }).join('');
  }

  // ============================================================
  //  工具导航
  // ============================================================
  function renderTools() {
    var html = '';
    html += '<div class="tabs" id="toolTabs">' +
      '<div class="tab active" data-tab="tool">AI 工具（' + TOOLS.length + '）</div>' +
      '<div class="tab" data-tab="src">资讯源（' + SOURCES.length + '）</div>' +
      '<div class="tab" data-tab="learn">学习资源（' + LEARN.length + '）</div>' +
      '</div>';
    html += '<div id="toolBody"></div>';
    view.innerHTML = html;
    paintTools('tool');
  }

  function paintTools(tab) {
    var body = $('#toolBody');
    if (!body) return;
    if (tab === 'tool') {
      var groups = {};
      TOOLS.forEach(function (t) { (groups[t.group] = groups[t.group] || []).push(t); });
      var h = '';
      Object.keys(groups).forEach(function (g) {
        h += '<div class="tool-group"><h3>' + esc(g) + '</h3><div class="tool-grid stagger">';
        groups[g].forEach(function (t) {
          h += '<div class="tool-card anim-fade-up" data-tool="' + t.id + '">' +
            '<div class="tc-name">' + esc(t.name) + '</div>' +
            '<div class="tc-desc">' + esc(t.desc) + '</div>' +
            '<div class="tc-foot">' + regionBadge(t.region) +
            '<span class="badge tag">' + (t.tags || []).slice(0, 1).join('') + '</span></div>' +
            '</div>';
        });
        h += '</div></div>';
      });
      body.innerHTML = h;
    } else if (tab === 'src') {
      body.innerHTML = '<div class="res-list stagger">' + SOURCES.map(function (s) {
        return '<div class="res-card anim-fade-up"><div class="rc-name">' + esc(s.name) +
          ' <span class="rc-kind">' + esc(s.lang === 'zh' ? '中文' : 'EN') + '</span></div>' +
          '<div class="rc-desc">' + esc(s.desc) + '</div>' +
          '<div style="margin-top:9px"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">访问 ↗</a> · <span class="rc-kind">' + esc(s.kind) + '</span></div></div>';
      }).join('') + '</div>';
    } else {
      body.innerHTML = '<div class="res-list stagger">' + LEARN.map(function (s) {
        return '<div class="res-card anim-fade-up"><div class="rc-name">' + esc(s.name) + '</div>' +
          '<div class="rc-desc">' + esc(s.desc) + '</div>' +
          '<div style="margin-top:9px"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">开始学习 ↗</a></div></div>';
      }).join('') + '</div>';
    }
  }

  // ============================================================
  //  详情抽屉
  // ============================================================
  function openApi(id) {
    var a = API_BY_ID[id];
    if (!a) return;
    var sc = score(a);
    var inCmp = state.compare.indexOf(id) >= 0;
    var html = '';
    html += '<dl class="dl">' +
      '<dt>厂商</dt><dd>' + esc(a.vendor) + '</dd>' +
      '<dt>价格</dt><dd>' + pricingBadge(a.pricing) + ' ' + esc({ free: '完全免费 / 开源', tier: '有限免费额度', local: '本机部署' }[a.pricing]) + '</dd>' +
      '<dt>区域</dt><dd>' + regionBadge(a.region) + '</dd>' +
      '<dt>用途</dt><dd>' + esc(a.use || '') + '</dd>' +
      '<dt>免费额度</dt><dd>' + esc(a.quota) + '</dd>' +
      '<dt>限速 / 限制</dt><dd>' + esc(a.limit) + '</dd>' +
      '<dt>核验日期</dt><dd>' + esc(a.verified || '—') + '</dd>' +
      '</dl>';

    html += '<div class="drawer-section"><h4>白嫖指数 ' + sc.total + ' · ' + scoreLabel(sc.total) + '</h4>' +
      '<div style="display:flex;align-items:center;gap:16px;margin-top:10px">' +
      scoreRing(sc.total, 64) +
      '<div class="score-break" style="flex:1">' +
      sc.parts.map(function (p) { return '<div class="row"><span>' + esc(p[0]) + '</span><b>+' + p[1] + '</b></div>'; }).join('') +
      '<div class="row" style="border-top:1px solid var(--border);padding-top:7px"><span>合计</span><b>' + sc.total + ' / 100</b></div>' +
      '</div></div></div>';

    html += '<div class="drawer-section"><h4>数据合规清单</h4><div class="checklist">' +
      checkItem(a.keyless, '免 API Key，拿来即用') +
      checkItem(!a.card, '无需绑定信用卡') +
      checkItem(a.cors, '支持 CORS，纯前端可直连') +
      checkItem(!a.expire, '免费额度不过期') +
      checkItem(a.generous, '免费额度慷慨') +
      checkItem(a.region === 'local', '数据不出本机（本地部署）') +
      '</div></div>';

    html += '<div class="drawer-section"><h4>说明</h4><p style="font-size:13px;color:var(--text-2);margin:0">' + esc(a.desc) + '</p></div>';

    if (a.warn) html += '<div class="warn-box">⚠️ ' + esc(a.warn) + '</div>';

    if (a.links && a.links.length) {
      html += '<div class="drawer-section"><h4>官方链接</h4><div class="link-row">' +
        a.links.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>'; }).join('') +
        '</div></div>';
    }

    html += '<button class="btn ' + (inCmp ? '' : 'primary') + ' compare-add" data-cmp-toggle="' + a.id + '">' +
      (inCmp ? '✓ 已加入对比' : '+ 加入对比') + '</button>';

    showDrawer(a.name, html);
  }

  function openTool(id) {
    var t = TOOL_BY_ID[id];
    if (!t) return;
    var html = '';
    html += '<dl class="dl">' +
      '<dt>类别</dt><dd>' + esc(t.group) + '</dd>' +
      '<dt>区域</dt><dd>' + regionBadge(t.region) + '</dd>' +
      '<dt>标签</dt><dd>' + (t.tags || []).map(function (x) { return '<span class="badge tag">' + esc(x) + '</span>'; }).join(' ') + '</dd>' +
      '</dl>';
    html += '<div class="drawer-section"><h4>简介</h4><p style="font-size:13px;color:var(--text-2);margin:0">' + esc(t.desc) + '</p></div>';
    html += '<div class="drawer-section"><h4>访问</h4><div class="link-row"><a href="' + esc(t.url) + '" target="_blank" rel="noopener">打开 ' + esc(t.name) + ' ↗</a></div></div>';
    showDrawer(t.name, html);
  }

  function checkItem(on, label) {
    return '<div class="ci"><span class="mk ' + (on ? 'on' : 'off') + '">' + (on ? '✓' : '—') + '</span>' + esc(label) + '</div>';
  }

  function showDrawer(title, html) {
    $('#drawerTitle').textContent = title;
    $('#drawerBody').innerHTML = html;
    var dr = $('#drawer'), sc = $('#drawerScrim');
    dr.hidden = false; sc.hidden = false;
    requestAnimationFrame(function () { dr.classList.add('open'); });
    dr.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    var dr = $('#drawer'), sc = $('#drawerScrim');
    dr.classList.remove('open');
    dr.setAttribute('aria-hidden', 'true');
    setTimeout(function () { dr.hidden = true; sc.hidden = true; }, 250);
  }

  // ============================================================
  //  对比
  // ============================================================
  function toggleCompare(id) {
    var i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 4) { toast('最多对比 4 个'); return; } state.compare.push(id); }
    renderCompareTray();
    var chk = $('.cmp-chk[data-cmp="' + id + '"]');
    if (chk) chk.checked = state.compare.indexOf(id) >= 0;
    var tg = $('[data-cmp-toggle="' + id + '"]');
    if (tg) { var on = state.compare.indexOf(id) >= 0; tg.classList.toggle('primary', !on); tg.textContent = on ? '✓ 已加入对比' : '+ 加入对比'; }
  }

  function renderCompareTray() {
    var tray = $('#compareTray');
    if (!state.compare.length) { tray.hidden = true; return; }
    tray.hidden = false;
    $('#compareCount').textContent = '已选 ' + state.compare.length + ' 项';
    $('#compareChips').innerHTML = state.compare.map(function (id) {
      var a = API_BY_ID[id];
      return '<span class="cc">' + esc(a ? a.name : id) + '<button data-cmp-rm="' + id + '">✕</button></span>';
    }).join('');
    // 重新绑定芯片移除事件
    $all('#compareChips [data-cmp-rm]').forEach(function (el) {
      el.addEventListener('click', function () { toggleCompare(el.getAttribute('data-cmp-rm')); });
    });
  }

  function openCompare() {
    if (state.compare.length < 2) { toast('至少选择 2 个进行对比'); return; }
    var rows = [
      ['价格', function (a) { return pricingBadge(a.pricing); }],
      ['区域', function (a) { return regionBadge(a.region); }],
      ['白嫖指数', function (a) { var s = score(a).total; return scoreRing(s, 32) + ' <b style="color:' + scoreHex(s) + '">' + s + ' · ' + scoreLabel(s) + '</b>'; }],
      ['RPM', function (a) { return fmtNum(a.rpm); }],
      ['RPD', function (a) { return fmtNum(a.rpd); }],
      ['免 Key', function (a) { return a.keyless ? '✓' : '—'; }],
      ['CORS', function (a) { return a.cors ? '✓' : '—'; }],
      ['需信用卡', function (a) { return a.card ? '需' : '无需'; }],
      ['额度过期', function (a) { return a.expire ? '会过期' : '不过期'; }],
      ['额度慷慨', function (a) { return a.generous ? '✓' : '—'; }],
      ['免费额度', function (a) { return esc(a.quota); }],
      ['限速 / 限制', function (a) { return esc(a.limit); }],
      ['适用', function (a) { return esc(a.use); }]
    ];
    var head = '<thead><tr><th></th>' + state.compare.map(function (id) {
      var a = API_BY_ID[id];
      return '<th class="cmp-name">' + esc(a ? a.name : id) + '</th>';
    }).join('') + '</tr></thead>';
    var body = '<tbody>' + rows.map(function (r) {
      return '<tr><th>' + esc(r[0]) + '</th>' + state.compare.map(function (id) {
        var a = API_BY_ID[id];
        return '<td>' + (a ? r[1](a) : '') + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';

    var links = '<tr><th>链接</th>' + state.compare.map(function (id) {
      var a = API_BY_ID[id];
      if (!a || !a.links) return '<td></td>';
      return '<td>' + a.links.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; }).join('<br>') + '</td>';
    }).join('') + '</tr>';

    showModal('并排对比（' + state.compare.length + '）', '<div style="overflow:auto"><table class="cmp-table">' + head + body + links + '</table></div>');
  }

  // ============================================================
  //  模态框 / 帮助 / Toast
  // ============================================================
  function showModal(title, html) {
    $('#helpModal').querySelector('.modal-head span').textContent = title;
    $('#helpBody').innerHTML = html;
    $('#helpModal').hidden = false; $('#helpScrim').hidden = false;
  }
  function closeModal() { $('#helpModal').hidden = true; $('#helpScrim').hidden = true; }

  function openHelp() {
    var rows = [
      ['1 / 2 / 3 / 4', '切换到 首页 / 目录 / 资讯 / 工具'],
      ['/', '聚焦搜索框'],
      ['t', '切换深 / 浅色'],
      ['?', '打开本帮助'],
      ['Esc', '关闭抽屉 / 弹窗'],
      ['点击卡片', '查看详情 / 白嫖指数拆解']
    ];
    var html = '<div class="kbd-list">' + rows.map(function (r) {
      return '<div class="kr"><span>' + esc(r[1]) + '</span><span class="kbd">' + esc(r[0]) + '</span></div>';
    }).join('') + '</div>';
    showModal('键盘快捷键', html);
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2000);
  }

  // ============================================================
  //  主题
  // ============================================================
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('kaiqiao-theme'); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('kaiqiao-theme', next); } catch (e) {}
  }

  // ============================================================
  //  鼠标追踪光效
  // ============================================================
  function trackMouseLight(el) {
    if (!el) return;
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      var my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      el.style.setProperty('--mx', mx + '%');
      el.style.setProperty('--my', my + '%');
    });
  }

  function bindMouseTracking() {
    $all('.api-card, .scenario, .board-card').forEach(function (el) {
      trackMouseLight(el);
    });
  }

  // ============================================================
  //  事件绑定
  // ============================================================
  function bindViewEvents() {
    var heroForm = $('#heroForm');
    if (heroForm) heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#heroInput').value.trim();
      if (!v) { navigate('catalog'); return; }
      state.q = v; state.scenarioMemo = null;
      location.hash = '#/catalog?q=' + encodeURIComponent(v);
    });

    // 场景直达
    $all('.scenario').forEach(function (el) {
      el.addEventListener('click', function () {
        var q = el.getAttribute('data-q');
        el.parentElement.querySelectorAll('.scenario').forEach(function (s) {}); // 确保数据
        // 从 SCN 里找对应场景
        var matched = SCN.filter(function (s) { return s.q === q; })[0];
        if (matched) {
          state.q = matched.q; state.scenarioMemo = { q: matched.q, note: matched.note };
          location.hash = '#/catalog?q=' + encodeURIComponent(matched.q);
        }
      });
    });

    $all('[data-api]').forEach(function (el) {
      if (el.classList.contains('board-card')) el.addEventListener('click', function () { openApi(el.getAttribute('data-api')); });
    });

    // 目录
    var catSearch = $('#catSearch');
    if (catSearch) {
      catSearch.addEventListener('input', function () { state.q = catSearch.value; paintCatalogGrid(); });
      catSearch.addEventListener('keydown', function (e) { if (e.key === 'Escape') { state.q = ''; catSearch.value = ''; paintCatalogGrid(); } });
      // 自动聚焦
      if (state.q) setTimeout(function () { catSearch.focus(); }, 250);
    }

    var catSort = $('#catSort');
    if (catSort) catSort.addEventListener('change', function () { state.sort = catSort.value; paintCatalogGrid(); });

    $all('.cat-item').forEach(function (el) {
      el.addEventListener('click', function () { state.cat = el.getAttribute('data-cat'); renderCatalog(); });
    });

    $all('.chip[data-facet-group]').forEach(function (el) {
      el.addEventListener('click', function () {
        var g = el.getAttribute('data-facet-group'), v = el.getAttribute('data-facet-val');
        var arr = state[g];
        var i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
        paintCatalogGrid();
        el.classList.toggle('active');
      });
    });

    var cs = $('#clearScenario');
    if (cs) cs.addEventListener('click', function (e) {
      e.preventDefault(); state.scenarioMemo = null; state.q = ''; navigate('catalog');
    });

    // 卡片点击
    $all('.api-card').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.classList.contains('cmp-chk')) return;
        if (e.target.closest('.cmp-chk')) return;
        openApi(el.getAttribute('data-api'));
      });
      // 鼠标追踪
      trackMouseLight(el);
    });

    $all('.cmp-chk').forEach(function (el) {
      el.addEventListener('change', function () { toggleCompare(el.getAttribute('data-cmp')); });
    });

    $all('[data-cmp-toggle]').forEach(function (el) {
      el.addEventListener('click', function () { toggleCompare(el.getAttribute('data-cmp-toggle')); });
    });

    // 资讯 tabs
    $all('#newsTabs .tab').forEach(function (el) {
      el.addEventListener('click', function () {
        $all('#newsTabs .tab').forEach(function (t) { t.classList.remove('active'); });
        el.classList.add('active');
        paintNews(el.getAttribute('data-tab'));
      });
    });

    $all('#feedTypes .chip').forEach(function (el) {
      el.addEventListener('click', function () {
        $all('#feedTypes .chip').forEach(function (c) { c.classList.remove('active'); });
        el.classList.add('active');
        paintFeed(el.getAttribute('data-ftype'));
      });
    });

    // 工具 tabs
    $all('#toolTabs .tab').forEach(function (el) {
      el.addEventListener('click', function () {
        $all('#toolTabs .tab').forEach(function (t) { t.classList.remove('active'); });
        el.classList.add('active');
        paintTools(el.getAttribute('data-tab'));
      });
    });

    $all('.tool-card').forEach(function (el) {
      el.addEventListener('click', function () { openTool(el.getAttribute('data-tool')); });
      trackMouseLight(el);
    });

    // 卡片入场增强
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      $all('.anim-fade-up').forEach(function (el) {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
      });
    } else {
      $all('.anim-fade-up').forEach(function (el) {
        el.style.animationPlayState = 'running';
      });
    }
  }

  // 全局事件（一次性绑定）
  function bindGlobal() {
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#helpBtn').addEventListener('click', openHelp);
    $('#helpClose').addEventListener('click', closeModal);
    $('#helpScrim').addEventListener('click', closeModal);
    $('#drawerClose').addEventListener('click', closeDrawer);
    $('#drawerScrim').addEventListener('click', closeDrawer);

    var compareClear = $('#compareClear');
    if (compareClear) compareClear.addEventListener('click', function () { state.compare = []; renderCompareTray(); paintCatalogGrid(); });
    var compareOpen = $('#compareOpen');
    if (compareOpen) compareOpen.addEventListener('click', openCompare);

    $all('.nav-link, .brand').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); navigate(el.getAttribute('data-nav')); });
    });

    // 键盘
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if (e.key === 'Escape') {
        if (!$('#helpModal').hidden) closeModal();
        else if (!$('#drawer').hidden) closeDrawer();
        return;
      }
      if (typing) return;
      if (e.key === '/') { e.preventDefault(); var inp = $('#catSearch') || $('#heroInput'); if (inp) inp.focus(); }
      else if (e.key === '1') navigate('home');
      else if (e.key === '2') navigate('catalog');
      else if (e.key === '3') navigate('news');
      else if (e.key === '4') navigate('tools');
      else if (e.key === 't' || e.key === 'T') toggleTheme();
      else if (e.key === '?') openHelp();
    });

    window.addEventListener('hashchange', route);
  }

  // ============================================================
  //  启动
  // ============================================================
  function init() {
    initTheme();
    var ba = $('#builtAt');
    if (ba) ba.textContent = '数据构建于 ' + BUILT_AT + ' · 共 ' + APIS.length + ' 个 API / ' + TOOLS.length + ' 个工具 / ' + (NEWS.length + BRIEFS.length) + ' 期简报';
    bindGlobal();
    if (!location.hash) location.hash = '#/home';
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
