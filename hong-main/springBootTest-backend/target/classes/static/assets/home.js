/* ============================================================
   星露谷物语 · 首页逻辑
   约定：
   1. 登录信息来自 localStorage["stardew_farmer"]（登录页写入）
   2. 搜索优先调用后端预留接口 GET /api/search?keyword=xxx
      后端尚未实现时自动回退到本地图鉴数据（仅前端，不报错）
   3. 退出登录 = 清除 stardew_farmer 并回到登录页
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 本地图鉴数据（回退用，纯前端） ---------- */
  var DATA = [
    { icon: '🥕', name: '防风草',  cat: '作物', desc: '春天最快的作物，4 天成熟', season: '春' },
    { icon: '🥔', name: '马铃薯',  cat: '作物', desc: '有几率一次挖出两个哦',     season: '春' },
    { icon: '🥦', name: '花椰菜',  cat: '作物', desc: '星露谷博览会的明星',       season: '春' },
    { icon: '🍓', name: '草莓',    cat: '作物', desc: '收获后还能再结果',         season: '春' },
    { icon: '🌽', name: '玉米',    cat: '作物', desc: '秋天跨季生长的宝贝',       season: '秋' },
    { icon: '🎃', name: '南瓜',    cat: '作物', desc: '丰收祭大胃王比赛的关键',   season: '秋' },
    { icon: '🍉', name: '甜瓜',    cat: '作物', desc: '夏天最甜的奖励',           season: '夏' },
    { icon: '🌻', name: '向日葵',  cat: '作物', desc: '朝向太阳，招人喜欢',       season: '夏' },
    { icon: '🐟', name: '沙丁鱼',  cat: '鱼类', desc: '海边最常见的鱼',           season: '全季' },
    { icon: '🐠', name: '红鲷鱼',  cat: '鱼类', desc: '鲜艳的珊瑚色，夏天出没',   season: '夏' },
    { icon: '🐡', name: '河豚',    cat: '鱼类', desc: '受到惊吓会鼓成球',         season: '夏' },
    { icon: '🦈', name: '鲶鱼',    cat: '鱼类', desc: '雨天夜里在河里游荡',       season: '全季' },
    { icon: '🐔', name: '鸡',      cat: '动物', desc: '每天下一个蛋，咕咕哒',     season: '—' },
    { icon: '🐄', name: '奶牛',    cat: '动物', desc: '挤牛奶全靠那把小手',       season: '—' },
    { icon: '🐑', name: '绵羊',    cat: '动物', desc: '羊毛长得飞快',             season: '—' },
    { icon: '🦆', name: '鸭子',    cat: '动物', desc: '偶尔会在池塘边下鸭蛋',     season: '—' },
    { icon: '🐰', name: '兔子',    cat: '动物', desc: '每四天掉一次兔子毛',       season: '—' },
    { icon: '🪓', name: '斧头',    cat: '工具', desc: '砍树、清木头，升级后更强', season: '—' },
    { icon: '⛏️', name: '镐子',    cat: '工具', desc: '敲石头、开矿道',           season: '—' },
    { icon: '🚿', name: '洒水器',  cat: '物品', desc: '早上自动帮四格作物浇水',   season: '—' },
    { icon: '🍯', name: '蜂房',    cat: '物品', desc: '每隔几天产一罐蜂蜜',       season: '—' },
    { icon: '🌲', name: '橡树树脂',cat: '采集', desc: '树液采集器的好朋友',       season: '全季' }
  ];

  /* 速览：默认展示前 8 条 */
  var FEATURED = DATA.slice(0, 8);

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 轻提示 ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  /* ---------- 登录状态 ---------- */
  function getFarmer() {
    try { return JSON.parse(localStorage.getItem('stardew_farmer') || 'null'); }
    catch (e) { return null; }
  }

  function renderUser() {
    var farmer = getFarmer();
    var navUser = $('navUser');

    if (farmer && farmer.farmerName) {
      var petIcon = { 'dog': '🐶', 'cat': '🐱' }[farmer.animal] || '🐣';
      navUser.innerHTML =
        '<span class="farmer-chip">' + petIcon + ' ' + escapeHtml(farmer.farmerName) + '</span>' +
        '<button class="sd-btn" id="logoutBtn">退出</button>';
      $('logoutBtn').addEventListener('click', function () {
        localStorage.removeItem('stardew_farmer');
        toast('👋 农夫再见，欢迎随时回农场～');
        setTimeout(function () { window.location.href = 'index.html'; }, 700);
      });

      var farm = farmer.farmName || '鹈鹕镇小屋';
      var pet = farmer.animal ? (' · 宠物：' + farmer.animal) : '';
      $('welcomePanel').innerHTML =
        '<h1>🌅 欢迎回来，' + escapeHtml(farmer.farmerName) + '！</h1>' +
        '<p>🏡 ' + escapeHtml(farm) + pet + '</p>' +
        '<p>今天也要努力种田～</p>';
    } else {
      navUser.innerHTML = '<a class="sd-btn go-login" href="index.html">登录</a>';
      $('welcomePanel').innerHTML =
        '<h1>🌾 旅人，欢迎来到星露谷！</h1>' +
        '<p>你还没有登录农场，先去找守门人罗宾登记一下吧。</p>' +
        '<a class="sd-btn go-login" href="index.html">去登录</a>';
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 搜索（预留后端接口 + 本地回退） ---------- */
  function searchLocal(kw) {
    kw = kw.toLowerCase();
    return DATA.filter(function (it) {
      return it.name.toLowerCase().indexOf(kw) !== -1 ||
             it.cat.toLowerCase().indexOf(kw) !== -1 ||
             it.desc.toLowerCase().indexOf(kw) !== -1;
    });
  }

  function doSearch(kw) {
    /* 预留接口：GET /api/search?keyword=xxx
       期望返回 { code: 200, data: [{icon,name,cat,desc}, ...] }
       后端未实现（404/网络错/非 200）时静默回退本地图鉴 */
    fetch('/api/search?keyword=' + encodeURIComponent(kw), { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('not-implemented');
        return res.json();
      })
      .then(function (j) {
        if (!j || j.code !== 200 || !Array.isArray(j.data)) throw new Error('bad-shape');
        render(j.data, '🔎 “' + kw + '” 的搜索结果（农场档案馆）');
        $('searchTip').textContent = '📡 已连接农场档案馆（后端接口）';
      })
      .catch(function () {
        var hits = searchLocal(kw);
        render(hits, '🔎 “' + kw + '” 的搜索结果');
        $('searchTip').textContent =
          hits.length ? '🛠️ 后端搜索接口尚未开放，先翻本地小图鉴～'
                      : '🛠️ 图鉴里没有找到相关条目，换个别名试试？';
      });
  }

  function render(items, title) {
    $('resultTitle').textContent = title;
    var grid = $('resultGrid');
    if (!items || items.length === 0) {
      grid.innerHTML = '<p class="empty-tip">🫧 一无所获……牧场主再换个词试试？</p>';
      return;
    }
    grid.innerHTML = items.map(function (it) {
      var icon = it.icon || '📦';
      var name = escapeHtml(it.name || '未知物品');
      var cat  = escapeHtml(it.cat  || '物品');
      var desc = escapeHtml(it.desc || '还没有记载');
      return '<div class="item-card">' +
               '<span class="item-icon">' + icon + '</span>' +
               '<div class="item-name">' + name + '</div>' +
               '<span class="item-cat">' + cat + '</span>' +
               '<div class="item-desc">' + desc + '</div>' +
             '</div>';
    }).join('');
  }

  /* ---------- 导航占位 ---------- */
  function bindNav() {
    var links = document.querySelectorAll('.nav-link');
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (a.classList.contains('active')) return;
        toast('⛏️ 「' + a.dataset.page + '」还在开垦中，敬请期待…');
      });
    });
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderUser();
    bindNav();
    render(FEATURED, '🌟 图鉴速览');

    $('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var kw = $('searchInput').value.trim();
      if (!kw) { toast('✋ 农夫，先写下要找的东西！'); return; }
      doSearch(kw);
    });
  });
})();
