/* ============================================================
 * 星露谷 · 首页逻辑（图鉴 / 社区中心 / 背包 / 设置 / 四季玩法）
 *
 * 本文件由 tools/build_home.py 生成：原有非玩法代码逐字保留，
 * 新增「四季农场 / 钓期钓鱼 / 商店 / 矿洞」玩法，命名、错误处理、
 * toast 提示、localStorage 缓存与 /api/progress 同步均沿用既有约定。
 * 依赖：/assets/stardew-catalog.js（季节 / 作物 / 鱼类 / 矿石 / 商品目录）
 * ============================================================ */
"use strict";

    // ===== 展示数据：优先从后端接口加载（后台管理可维护），失败时回退本地静态数据 =====
    const FALLBACK_ITEMS = [
      { icon: "🍓", name: "草莓", cat: "crop", description: "春季作物，可多次收获，镇长的最爱。" },
      { icon: "🍇", name: "蓝莓", cat: "crop", description: "夏季作物，产量高，制作果酱一流。" },
      { icon: "🌽", name: "玉米", cat: "crop", description: "夏秋两季均可种植，烘烤后更香甜。" },
      { icon: "🎃", name: "南瓜", cat: "crop", description: "秋季作物，万圣节必备，售价可观。" },
      { icon: "🍒", name: "樱桃", cat: "crop", description: "多年生果树，春季稳定产出。" },
      { icon: "🍺", name: "啤酒花", cat: "crop", description: "夏季攀藤作物，用于酿制淡啤酒。" },
      { icon: "🍞", name: "远古水果", cat: "crop", description: "传说作物，酿成酒价值连城。" },
      { icon: "🐔", name: "鸡", cat: "animal", description: "每天产蛋，金色母鸡更珍贵。" },
      { icon: "🐄", name: "奶牛", cat: "animal", description: "产出牛奶，可制作奶酪。" },
      { icon: "🐑", name: "羊", cat: "animal", description: "产出羊毛，梳毛后制成布料。" },
      { icon: "🐖", name: "猪", cat: "animal", description: "松露猎手，林间觅得松露。" },
      { icon: "🐎", name: "马", cat: "animal", description: "牧场好伙伴，提升移动速度。" },
      { icon: "👧", name: "阿比盖尔", cat: "villager", description: "鹈鹕镇少女，热爱矿物与冒险。" },
      { icon: "🧔", name: "塞巴斯蒂安", cat: "villager", description: "镇上的程序员，钟爱雨天。" },
      { icon: "👵", name: "艾芙琳", cat: "villager", description: "和蔼的祖母，擅长烘焙。" },
      { icon: "🧑‍🌾", name: "镇长刘易斯", cat: "villager", description: "鹈鹕镇镇长，关心小镇发展。" },
      { icon: "🐟", name: "鲈鱼", cat: "fish", description: "鹈鹕河里最常见的鱼，新手渔夫的起点。" },
      { icon: "🐠", name: "虹鳟", cat: "fish", description: "色彩斑斓的鳟鱼，在山间溪流中出没。" },
      { icon: "🐡", name: "鲶鱼", cat: "fish", description: "力气很大的深水鱼，咬钩时鱼竿都在颤抖。" },
      { icon: "🦈", name: "传说之鱼", cat: "fish", description: "只在月圆之夜现身的深海巨物，渔夫的终极梦想。" },
      { icon: "🔶", name: "铜矿石", cat: "ore", description: "矿洞浅层最常见的矿石，熔炼后用途广泛。" },
      { icon: "🔷", name: "铁矿石", cat: "ore", description: "埋藏在矿洞中层的闪亮矿石，锻制工具的必需品。" },
      { icon: "🥇", name: "金矿石", cat: "ore", description: "深层矿脉中泛着金光，价值不菲。" },
      { icon: "💎", name: "钻石", cat: "ore", description: "矿洞最深处才可能见到的稀世珍宝。" }
    ];

    // ===== 社区中心收集包定义：优先从后端接口加载（后台管理可维护），失败时回退本地静态数据 =====
    const FALLBACK_BUNDLES = [
      { id: "spring",  icon: "🌸", title: "春之收获包", desc: "献上春季的馈赠，唤醒沉睡的社区中心。", need: ["草莓", "樱桃"] },
      { id: "summer",  icon: "☀️", title: "夏之盛宴包", desc: "夏日丰饶，果蔬满仓。", need: ["蓝莓", "啤酒花", "玉米"] },
      { id: "autumn",  icon: "🍂", title: "秋之丰收包", desc: "金秋时节，谷仓飘香。", need: ["南瓜", "远古水果"] },
      { id: "animal",  icon: "🐮", title: "牧场情谊包", desc: "来自动物们的温柔陪伴。", need: ["鸡", "奶牛", "羊"] },
      { id: "fish",    icon: "🎣", title: "深海渔获包", desc: "江河湖海的礼物。", need: ["鲈鱼", "虹鳟", "鲶鱼", "传说之鱼"] },
      { id: "mine",    icon: "💎", title: "矿洞宝藏包", desc: "地心深处闪耀的珍宝。", need: ["铜矿石", "铁矿石", "金矿石", "钻石"] }
    ];
    let bundleDefs = FALLBACK_BUNDLES;

    async function loadBundleDefs() {
      try {
        const res = await fetch("/api/bundles");
        const body = await res.json();
        if (res.ok && body.code === 200 && Array.isArray(body.data) && body.data.length) {
          bundleDefs = body.data.map(b => ({
            id: String(b.id), icon: b.icon, title: b.title, desc: b.description, need: b.need || []
          }));
        }
      } catch (e) { /* 后端不可达，沿用本地静态数据 */ }
    }

    const CAT_LABEL = { crop: "作物", animal: "动物", villager: "村民", fish: "钓鱼", ore: "矿石" };

    /* ============================================================
     * 季节引擎 + 玩法总状态（沿用原有 localStorage /api/progress 约定）
     * ============================================================ */
    const SD = window.SD_CATALOG;
    const LS_GAME = "stardew_game";
    const MAX_ENERGY = 20;
    const ENERGY_REGEN_MS = 60 * 1000;   // 每 60 秒恢复 1 点体力（沿用原设定）
    const BASE_GROW_MS = 20 * 1000;      // 基础成熟时长 20 秒
    const DAY_GROW_MS = 4 * 1000;        // 游戏内每 1 天 ≈ 4 秒
    const WATER_BONUS_MS = 15 * 1000;    // 浇水提前 15 秒（沿用原设定）
    const PLOT_COUNT = 9;
    const STAGE_ICON = ["🌰", "🌱", "🌿", "🌾"];
    const STAGE_NAME = ["种子", "幼苗", "生长中", "成熟可收"];
    const DEFAUT_INV_CAP = 60;
    const BIG_INV_CAP = 120;

    // 修复：原页面 renderLog / openPlot 引用了未定义的 esc，导致玩法日志渲染中断
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[c]);
    }
    function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
    function isActive(page) {
      const el = document.getElementById("page-" + page);
      return !!(el && el.classList.contains("active"));
    }
    let gameToastTimer = null;
    function gameToast(msg) {
      const el = document.getElementById("gameToast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(gameToastTimer);
      gameToastTimer = setTimeout(() => el.classList.remove("show"), 2300);
    }

    function defaultGame() {
      return {
        gold: 50, energy: MAX_ENERGY, energyAt: Date.now(),
        plots: Array(PLOT_COUNT).fill(null),
        stats: { harvest: 0, casts: 0, caught: 0, digs: 0, ores: 0,
                 farmGold: 0, fishGold: 0, mineGold: 0,
                 planted: 0, sold: 0, bought: 0, sellGold: 0, buyGold: 0 },
        species: { fish: [], ore: [], crop: [] },
        logs: { farm: [], fishing: [], mining: [], shop: [] },
        seeds: {},        // { 作物名: 种子袋数 }  商店购买
        inventory: {},    // { 产物名: 数量 }      收获 / 钓获 / 挖矿产物，商店出售
        owned: {},        // { 商品id: 数量 }      已购商品 / 升级
        seasonKey: "",    // 上次进入的季节，用于换季枯萎判定
        mine: { last: "", at: 0, depth: 1 }
      };
    }
    function normalizeGame(raw) {
      const d = defaultGame();
      const g = Object.assign(d, (raw && typeof raw === "object") ? raw : {});
      g.stats = Object.assign(d.stats, (raw && raw.stats) || {});
      g.species = Object.assign(d.species, (raw && raw.species) || {});
      g.logs = Object.assign(d.logs, (raw && raw.logs) || {});
      g.mine = Object.assign(d.mine, (raw && raw.mine) || {});
      ["seeds", "inventory", "owned"].forEach(k => {
        if (!g[k] || typeof g[k] !== "object" || Array.isArray(g[k])) g[k] = {};
      });
      ["fish", "ore", "crop"].forEach(k => { if (!Array.isArray(g.species[k])) g.species[k] = []; });
      ["farm", "fishing", "mining", "shop"].forEach(k => { if (!Array.isArray(g.logs[k])) g.logs[k] = []; });
      // 兼容旧存档：地块数组长度不一致时保留已有地块并补空位，不整段丢弃
      if (!Array.isArray(g.plots)) g.plots = [];
      g.plots = g.plots.slice(0, PLOT_COUNT).map(p => {
        if (!p || typeof p !== "object") return null;
        const c = cropByName(p.name);
        return {
          name: String(p.name || "未知作物"),
          plantedAt: Number(p.plantedAt) || Date.now(),
          watered: !!p.watered,
          growMs: Number(p.growMs) || growMsFor(c),
          seasonKey: String(p.seasonKey || seasonNow().key)
        };
      });
      while (g.plots.length < PLOT_COUNT) g.plots.push(null);
      if (typeof g.gold !== "number" || !isFinite(g.gold)) g.gold = 50;
      if (typeof g.energy !== "number" || !isFinite(g.energy)) g.energy = MAX_ENERGY;
      if (typeof g.energyAt !== "number" || !isFinite(g.energyAt)) g.energyAt = Date.now();
      if (typeof g.seasonKey !== "string") g.seasonKey = "";
      Object.keys(d.stats).forEach(k => {
        if (typeof g.stats[k] !== "number" || !isFinite(g.stats[k])) g.stats[k] = 0;
      });
      return g;
    }
    let game = defaultGame();

    function loadGame() {
      try { game = normalizeGame(JSON.parse(localStorage.getItem(LS_GAME) || "null")); }
      catch (e) { game = defaultGame(); }
      regenEnergy();
    }
    function cacheGame() { localStorage.setItem(LS_GAME, JSON.stringify(game)); }
    function saveGame() { cacheGame(); syncProgress(); }

    function regenEnergy() {
      const now = Date.now();
      if (game.energy >= MAX_ENERGY) { game.energyAt = now; return; }
      const gained = Math.floor((now - (game.energyAt || now)) / ENERGY_REGEN_MS);
      if (gained > 0) {
        game.energy = Math.min(MAX_ENERGY, game.energy + gained);
        game.energyAt = now;
        cacheGame();
      }
    }
    function spendEnergy(n) {
      regenEnergy();
      if (game.energy < n) { gameToast("⚡ 体力不足，稍等片刻会自动恢复～"); return false; }
      if (game.energy >= MAX_ENERGY) game.energyAt = Date.now();
      game.energy -= n;
      return true;
    }
    function addLog(kind, text) {
      if (!game.logs[kind]) game.logs[kind] = [];
      game.logs[kind].unshift({ t: Date.now(), text: text });
      game.logs[kind] = game.logs[kind].slice(0, 6);
    }
    function renderLog(kind, elId) {
      const el = document.getElementById(elId);
      if (!el) return;
      const list = game.logs[kind] || [];
      el.innerHTML = '<div class="log-title">📜 最近记录</div>' + (list.length
        ? list.map(l => '<div class="log-line">' + esc(l.text) + '</div>').join("")
        : '<div class="log-empty">还没有记录，开始你的第一次尝试吧～</div>');
    }
    function addSpecies(kind, name) {
      if (!game.species[kind]) game.species[kind] = [];
      if (game.species[kind].indexOf(name) < 0) game.species[kind].push(name);
    }
    function fmtDuration(ms) {
      const s = Math.max(0, Math.ceil(ms / 1000));
      return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }
    function weightedPick(list, weightFn) {
      const total = list.reduce((s, it) => s + weightFn(it), 0);
      if (total <= 0) return null;
      let r = Math.random() * total;
      for (const it of list) { r -= weightFn(it); if (r <= 0) return it; }
      return list[list.length - 1];
    }
    function refreshLinked() {
      renderHome(); renderBag(); renderCodex(); renderCommunity();
    }

    /* ---------- 四季 / 钓期 ---------- */
    function mdNum(d) { return (d.getMonth() + 1) * 100 + d.getDate(); }
    function seasonNow(date) {
      const d = date || new Date(), m = d.getMonth() + 1;
      const key = (m >= 3 && m <= 5) ? "spring" : (m >= 6 && m <= 8) ? "summer"
                : (m >= 9 && m <= 11) ? "fall" : "winter";
      return SD.seasons.find(s => s.key === key) || SD.seasons[0];
    }
    function seasonLabel(key) {
      const s = SD.seasons.find(x => x.key === key);
      return s ? s.full : key;
    }
    function seasonWindow(s, date) {
      const d = date || new Date(), y = d.getFullYear();
      const startYear = (s.key === "winter" && d.getMonth() + 1 <= 2) ? y - 1 : y;
      const start = new Date(startYear, s.start[0] - 1, s.start[1]);
      let end;
      if (s.key === "winter") {
        const ey = startYear + 1;
        const leap = (ey % 4 === 0 && ey % 100 !== 0) || ey % 400 === 0;
        end = new Date(ey, 1, leap ? 29 : 28, 23, 59, 59, 999);
      } else {
        end = new Date(y, s.end[0] - 1, s.end[1], 23, 59, 59, 999);
      }
      const total = Math.max(1, Math.round((end - start) / 86400000));
      const elapsed = Math.max(0, (d - start) / 86400000);
      const day = Math.min(28, Math.max(1, Math.floor(elapsed / total * 28) + 1));
      const daysLeft = Math.max(0, Math.ceil((end - d) / 86400000));
      return { start: start, end: end, total: total, day: day, daysLeft: daysLeft };
    }
    function fishingOpenOn(s, date) {
      const d = date || new Date();
      const from = s.fish.from[0] * 100 + s.fish.from[1];
      const to = s.fish.to[0] * 100 + s.fish.to[1];
      const md = mdNum(d);
      return from <= to ? (md >= from && md <= to) : (md >= from || md <= to);
    }
    function fishingStatus(s, date) {
      const d = date || new Date();
      const open = fishingOpenOn(s, d);
      let daysLeft = 0;
      if (open) {
        const wrap = s.fish.from[0] > s.fish.to[0];
        const toYear = wrap && (d.getMonth() + 1 >= s.fish.from[0]) ? d.getFullYear() + 1 : d.getFullYear();
        const toDate = new Date(toYear, s.fish.to[0] - 1, s.fish.to[1], 23, 59, 59, 999);
        daysLeft = Math.max(0, Math.ceil((toDate - d) / 86400000));
      }
      let next = "";
      for (let i = 0; i < 370; i++) {
        const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
        const ts = seasonNow(t);
        if (fishingOpenOn(ts, t)) {
          next = (t.getMonth() + 1) + "月" + t.getDate() + "日 · " + ts.full + "钓期";
          break;
        }
      }
      return { open: open, label: s.fish.label, daysLeft: daysLeft, next: next };
    }
    // 换季结算：未收获作物枯萎（稻草人可保护），返回是否发生换季
    function syncSeasonChange() {
      const s = seasonNow(), key = s.key;
      if (!game.seasonKey) { game.seasonKey = key; cacheGame(); return false; }
      if (game.seasonKey === key) return false;
      const oldName = seasonLabel(game.seasonKey);
      const guarded = (game.owned.scarecrow || 0) > 0;
      let withered = 0;
      if (!guarded) {
        game.plots = game.plots.map(p => {
          if (p && p.seasonKey !== key) { withered++; return null; }
          return p;
        });
      }
      addLog("farm", "🍂 " + oldName + " → " + s.full + (withered
        ? "，" + withered + " 株未收获作物枯萎" : (guarded ? "，稻草人守护了田地" : "，田地安然无恙")));
      game.seasonKey = key;
      saveGame();
      return true;
    }
    function renderSeasonStrip(elId) {
      const el = document.getElementById(elId);
      if (!el) return;
      const cur = seasonNow(), w = seasonWindow(cur), fs = fishingStatus(cur);
      el.innerHTML = '<div class="season-strip">' + SD.seasons.map(s =>
        '<div class="season-cell' + (s.key === cur.key ? ' active' : '') + '" style="--s-color:' + s.color + '">' +
          '<div class="sc-icon">' + s.icon + '</div>' +
          '<div class="sc-name">' + s.full + (s.key === cur.key ? ' · 当前' : '') + '</div>' +
          '<div class="sc-window">' + s.window + '</div>' +
          '<div class="sc-meta">作物 ' + seasonCrops(s.key).length + ' 种 · ' + s.fish.label + '</div>' +
        '</div>').join("") + '</div>' +
        '<div class="season-summary">📅 ' + cur.full + ' 第 ' + w.day + ' / 28 日 · 本季剩余 ' + w.daysLeft + ' 天 ｜ ' +
        (fs.open ? '🎣 钓期开放中，剩余 ' + fs.daysLeft + ' 天' : '🎣 当前休渔 · 下一钓期 ' + fs.next) +
        (hasGreenhouse() ? ' ｜ 🏡 温室已解锁，全季作物可种' : '') + '</div>';
    }
    function renderSeasonBanner() {
      const el = document.getElementById("seasonBanner");
      if (!el) return;
      const s = seasonNow(), w = seasonWindow(s), fs = fishingStatus(s, curDate());
      const ripe = game.plots.filter(p => p && plotStage(p) === 3).length;
      const planted = game.plots.filter(Boolean).length;
      el.innerHTML =
        '<div class="sb-left"><div class="sb-icon">' + s.icon + '</div>' +
          '<div><div class="sb-title">' + esc(s.full) + ' · 第 ' + w.day + ' / 28 日</div>' +
          '<div class="sb-sub">' + s.window + ' · ' + esc(s.desc) + ' · 本季剩余 ' + w.daysLeft + ' 天</div></div></div>' +
        '<div class="sb-right">' +
          '<div class="sb-chip' + (fs.open ? ' ok' : ' off') + '">' + (fs.open ? '🎣 钓期开放 · 剩 ' + fs.daysLeft + ' 天' : '🎣 休渔中 · ' + fs.next) + '</div>' +
          '<div class="sb-chip">🌾 田地 ' + planted + '/' + PLOT_COUNT + (ripe ? ' · ✨ ' + ripe + ' 块待收' : '') + '</div>' +
          '<div class="sb-chip">📦 仓库 ' + invTotal() + '/' + capacity() + ' · 估值 ' + invValue() + 'g</div>' +
        '</div>';
    }
    function curDate() { return new Date(); }

    /* ---------- 目录 / 仓库 / 商品 ---------- */
    function cropByName(name) { return SD.crops.find(c => c.name === name); }
    function fishByName(name) { return SD.fish.find(f => f.name === name); }
    function oreByName(name)  { return SD.ores.find(o => o.name === name); }
    function seasonCrops(key) { return SD.crops.filter(c => c.seasons.indexOf(key) >= 0); }
    function hasGreenhouse()  { return (Number(game.owned.greenhouse) || 0) > 0; }
    function plantableCrops() { return hasGreenhouse() ? SD.crops.slice() : seasonCrops(seasonNow().key); }
    function growMsFor(c)     { return BASE_GROW_MS + (c ? c.days : 7) * DAY_GROW_MS; }
    function waterBonus()     { return (Number(game.owned.watering_can) || 0) > 0 ? WATER_BONUS_MS * 2 : WATER_BONUS_MS; }
    function capacity()       { return (Number(game.owned.backpack) || 0) > 0 ? BIG_INV_CAP : DEFAUT_INV_CAP; }
    function productInfo(name) {
      const c = cropByName(name); if (c) return { icon: c.icon, price: c.sell, kind: "crop" };
      const f = fishByName(name); if (f) return { icon: f.icon, price: f.price, kind: "fish" };
      const o = oreByName(name);  if (o) return { icon: o.icon, price: o.price, kind: "ore" };
      const it = itemByName(name);
      if (it) return { icon: it.icon || "📦", price: Math.max(5, Math.round((Number(it.sortOrder) || 20) / 2)), kind: "legacy" };
      return { icon: "📦", price: 10, kind: "other" };
    }
    function invTotal() {
      return Object.keys(game.inventory).reduce((s, k) => s + (Number(game.inventory[k]) || 0), 0);
    }
    function invValue() {
      return Object.keys(game.inventory).reduce((s, k) =>
        s + (Number(game.inventory[k]) || 0) * productInfo(k).price, 0);
    }
    // 产物统一入仓库（不直接发金币）；同时按既有约定同步图鉴背包 / 物种解锁
    function addHarvest(name, count, kind) {
      const space = capacity() - invTotal();
      if (space <= 0) { gameToast("📦 仓库已满，请先到商店出售产物"); return 0; }
      const n = Math.min(count, space);
      game.inventory[name] = (Number(game.inventory[name]) || 0) + n;
      addToBag(name, n);
      addSpecies(kind === "fish" ? "fish" : kind === "ore" ? "ore" : "crop", name);
      if (n < count) gameToast("📦 仓库空间不足，部分产物未入库");
      return n;
    }
    function goodsList() {
      const key = seasonNow().key, greenhouse = hasGreenhouse();
      const list = SD.goods.slice();
      const seeds = SD.crops.map(c => ({
        id: "seed:" + c.name, name: c.name + "种子", icon: c.icon, cat: "seed",
        price: c.seed, crop: c.name, seasons: c.seasons,
        locked: !greenhouse && c.seasons.indexOf(key) < 0,
        effect: c.seasons.map(seasonLabel).join("/") + " · " + c.days + " 日成熟 · 收获售价 " + c.sell + "g"
      }));
      // 当季可购种子排在前面，非当季（锁定）种子靠后
      seeds.sort((a, b) => (a.locked !== b.locked) ? (a.locked ? 1 : -1) : (a.price - b.price));
      seeds.forEach(s => list.push(s));
      return list;
    }
    // ===== 进度持久化：localStorage 作离线缓存，同时与后端按账号同步 =====
    const LS_BAG = "stardew_bag";        // { 名称: 数量 }
    const LS_BUNDLE = "stardew_bundles"; // { bundleId: [已捐赠名称...] }
    const LS_FARMER = "stardew_farmer";

    function getAccount() {
      try { return (JSON.parse(localStorage.getItem(LS_FARMER) || "{}").account) || ""; }
      catch (e) { return ""; }
    }
    function getToken() {
      try { return (JSON.parse(localStorage.getItem(LS_FARMER) || "{}").token) || ""; }
      catch (e) { return ""; }
    }
    function loadBag() {
      try { return JSON.parse(localStorage.getItem(LS_BAG)) || {}; } catch (e) { return {}; }
    }
    function loadBundles() {
      try { return JSON.parse(localStorage.getItem(LS_BUNDLE)) || {}; } catch (e) { return {}; }
    }
    // 写本地缓存
    function cacheBag() { localStorage.setItem(LS_BAG, JSON.stringify(state.bag)); }
    function cacheBundles() { localStorage.setItem(LS_BUNDLE, JSON.stringify(state.bundles)); }
    // 同步到后端（带用户令牌，按令牌账号存取），失败不阻塞，仅保留本地缓存
    function syncProgress() {
      const account = getAccount();
      const token = getToken();
      if (!account || !token) return;
      fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-User-Token": token },
        body: JSON.stringify({ account: account, bag: state.bag, bundles: state.bundles, gameplay: game })
      }).catch(() => {});
    }
    // 统一持久化：先写本地缓存，再同步后端
    function saveBag() { cacheBag(); syncProgress(); }
    function saveBundles() { cacheBundles(); syncProgress(); }

    const state = {
      items: [],
      bag: loadBag(),
      bundles: loadBundles(),
      currentCat: "all",
      searchQ: ""
    };

    // 启动时从后端拉取该账号进度（后端优先），覆盖本地缓存
    async function loadProgress() {
      const account = getAccount();
      const token = getToken();
      if (!account || !token) return;
      try {
        const res = await fetch("/api/progress?account=" + encodeURIComponent(account), {
          headers: { "X-User-Token": token }
        });
        const body = await res.json();
        if (res.ok && body.code === 200 && body.data) {
          if (body.data.bag && typeof body.data.bag === "object") state.bag = body.data.bag;
          if (body.data.bundles && typeof body.data.bundles === "object") state.bundles = body.data.bundles;
          // 后端玩法状态优先（跨设备同步），为空时沿用本地缓存
          if (body.data.gameplay && typeof body.data.gameplay === "object"
              && Object.keys(body.data.gameplay).length) {
            game = normalizeGame(body.data.gameplay);
            cacheGame();
            regenEnergy();
          }
          cacheBag(); cacheBundles();
        }
      } catch (e) { /* 后端不可达，沿用本地缓存 */ }
    }

    // ===== 数据加载 =====
    async function loadItems() {
      try {
        const res = await fetch("/api/items");
        const body = await res.json();
        if (res.ok && body.code === 200 && Array.isArray(body.data) && body.data.length) {
          state.items = body.data;
        } else {
          state.items = FALLBACK_ITEMS;
        }
      } catch (e) {
        state.items = FALLBACK_ITEMS;
      }
    }

    function itemByName(name) {
      return state.items.find(it => it.name === name);
    }

    /* ============================================================
     * 路由 + 首页（季节横幅 / 三大功能入口与状态 / 既有统计卡）
     * ============================================================ */
    const PAGES = ["home", "farm", "fishing", "shop", "mining", "codex", "community", "bag", "settings"];
    function go(page) {
      if (!PAGES.includes(page)) page = "home";
      location.hash = page;
    }
    function route() {
      const page = (location.hash || "#home").replace("#", "");
      const active = PAGES.includes(page) ? page : "home";
      PAGES.forEach(p => {
        const el = document.getElementById("page-" + p);
        if (el) el.classList.toggle("active", p === active);
      });
      document.querySelectorAll("#navLinks a").forEach(a => {
        a.classList.toggle("active", a.dataset.page === active);
      });
      if (active === "home") renderHome();
      if (active === "farm") renderFarm();
      if (active === "fishing") updateFishing();
      if (active === "shop") renderShop();
      if (active === "mining") renderMining();
      if (active === "codex") renderCodex();
      if (active === "community") renderCommunity();
      if (active === "bag") renderBag();
      if (active === "settings") renderSettings();
    }
    window.addEventListener("hashchange", route);

    const MODULES = [
      { page: "codex", icon: "📖", name: "作物图鉴", desc: "浏览全部作物、动物、村民、鱼类与矿石，点击收集入背包。" },
      { page: "community", icon: "🏠", name: "社区中心", desc: "用背包物品完成收集包捐赠，复兴小镇。" },
      { page: "bag", icon: "🎒", name: "背包", desc: "管理你收集到的物种，可移除或用于捐赠。" },
      { page: "settings", icon: "⚙️", name: "设置", desc: "编辑农夫资料，导出或重置本地进度。" }
    ];
    // 首页核心入口：农场 / 钓鱼 / 商店（+ 矿洞），每张卡片带实时状态
    const ENTRY_MODULES = [
      { page: "farm", icon: "🌾", name: "农场", theme: "farm",
        badge: () => seasonNow().icon + " " + seasonNow().full,
        desc: () => {
          const ripe = game.plots.filter(p => p && plotStage(p) === 3).length;
          const list = plantableCrops();
          return "当季可种 <b>" + list.length + "</b> 种作物 · 已播 <b>" + game.plots.filter(Boolean).length + "/" + PLOT_COUNT +
                 "</b> 块田" + (ripe ? " · <b>✨ " + ripe + " 块成熟待收</b>" : "") +
                 "<br/>种子在商店购买 → 播种 → 收获入仓库 → 商店出售换金币";
        } },
      { page: "fishing", icon: "🎣", name: "钓鱼", theme: "fish",
        badge: () => { const st = fishingStatus(seasonNow()); return st.open ? "🟢 钓期开放" : "🔴 休渔中"; },
        desc: () => {
          const st = fishingStatus(seasonNow());
          const n = SD.fish.filter(f => f.seasons.indexOf(seasonNow().key) >= 0).length;
          return (st.open ? "当前 " + esc(st.label) + "，剩余 <b>" + st.daysLeft + "</b> 天" :
                            "当前不在钓期，下一钓期 <b>" + esc(st.next) + "</b>") +
                 "<br/>当季可钓鱼种 <b>" + n + "</b> 种 · 已钓获 <b>" + game.stats.caught +
                 "</b> 条 · 渔获可在商店出售";
        } },
      { page: "shop", icon: "🛒", name: "商店", theme: "shop",
        badge: () => "💰 " + game.gold + "g",
        desc: () => "仓库 <b>" + invTotal() + "/" + capacity() + "</b> 格 · 产物估值 <b>" + invValue() +
                    "g</b><br/>出售全部收获换金币，购买当季种子、工具、食物、家具与动物" },
      { page: "mining", icon: "⛏️", name: "矿洞", theme: "mine",
        badge: () => "第 " + mineDepth() + " 层",
        desc: () => "挖掘 <b>" + game.stats.digs + "</b> 次 · 获得矿石 <b>" + game.stats.ores +
                    "</b> 块 · 体力 <b>" + game.energy + "/" + MAX_ENERGY +
                    "</b><br/>矿石入仓库，可在商店出售；越深稀有矿石越多" }
    ];

    function updateResourceBar() {
      regenEnergy();
      const gold = document.getElementById("resGold");
      if (!gold) return;
      gold.textContent = game.gold;
      setText("resEnergy", game.energy);
      const next = Math.max(0, ENERGY_REGEN_MS - (Date.now() - (game.energyAt || Date.now())));
      setText("resEnergyTip", "/ " + MAX_ENERGY +
        (game.energy < MAX_ENERGY ? " · " + Math.ceil(next / 1000) + "s 后 +1" : ""));
      const bar = document.getElementById("resEnergyBar");
      if (bar) bar.style.width = (game.energy / MAX_ENERGY * 100) + "%";
      setText("shopGold", game.gold);
      setText("shopCapacityChip", invTotal() + " / " + capacity());
    }

    function renderHome() {
      const ownedCount = Object.keys(state.bag).filter(k => state.bag[k] > 0).length;
      const totalSlots = bundleDefs.reduce((s, b) => s + b.need.length, 0);
      const filledSlots = bundleDefs.reduce((s, b) => s + ((state.bundles[b.id] || []).length), 0);
      const pct = totalSlots ? Math.round(filledSlots / totalSlots * 100) : 0;

      setText("statCodex", state.items.length);
      setText("statBag", ownedCount);
      setText("statBundlePct", pct + "%");
      const pbar = document.getElementById("statBundleBar");
      if (pbar) pbar.style.width = pct + "%";
      setText("statHarvest", game.stats.harvest + game.stats.caught + game.stats.ores);
      renderSeasonBanner();
      updateResourceBar();

      const ggrid = document.getElementById("gameModuleGrid");
      if (ggrid) {
        ggrid.innerHTML = ENTRY_MODULES.map(m =>
          '<div class="module-card entry-card entry-' + m.theme + '" data-page="' + m.page + '">' +
            '<div class="entry-badge">' + m.badge() + '</div>' +
            '<div class="m-icon">' + m.icon + '</div>' +
            '<div class="m-name">' + m.name + '</div>' +
            '<div class="m-desc">' + m.desc() + '</div>' +
            '<div class="entry-go">进入模块 →</div>' +
          '</div>').join("");
        ggrid.querySelectorAll(".entry-card").forEach(el => {
          el.addEventListener("click", () => go(el.dataset.page));
        });
      }

      const grid = document.getElementById("moduleGrid");
      if (grid) {
        grid.innerHTML = "";
        MODULES.forEach(m => {
          const el = document.createElement("div");
          el.className = "module-card";
          el.innerHTML = '<div class="m-icon">' + m.icon + '</div>' +
            '<div class="m-name">' + m.name + '</div>' +
            '<div class="m-desc">' + esc(m.desc) + '</div>';
          el.addEventListener("click", () => go(m.page));
          grid.appendChild(el);
        });
      }
    }
    /* ============================================================
     * 玩法一：农场 —— 当季作物 / 播种 / 生长 / 浇水 / 收获入仓库
     * ============================================================ */
    let seasonTab = "";
    function plotElapsed(plot) {
      return Date.now() - (plot.plantedAt || Date.now()) - (plot.watered ? waterBonus() : 0);
    }
    function plotStage(plot) {
      if (!plot) return -1;
      const total = Number(plot.growMs) || growMsFor(cropByName(plot.name));
      const elapsed = plotElapsed(plot);
      if (elapsed >= total) return 3;
      if (elapsed >= total * 2 / 3) return 2;
      if (elapsed >= total / 3) return 1;
      return 0;
    }
    function plotRemain(plot) {
      const total = Number(plot.growMs) || growMsFor(cropByName(plot.name));
      return Math.max(0, total - plotElapsed(plot));
    }
    function openGameModal(html) {
      document.getElementById("gameBox").innerHTML = html;
      document.getElementById("gameMask").classList.add("show");
    }
    function closeGameModal() { document.getElementById("gameMask").classList.remove("show"); }

    function renderFarm() {
      regenEnergy();
      renderSeasonStrip("farmSeasonStrip");
      const grid = document.getElementById("plotGrid");
      if (grid) {
        grid.innerHTML = "";
        game.plots.forEach((plot, idx) => {
          const el = document.createElement("div");
          el.dataset.idx = idx;
          if (!plot) {
            el.className = "plot empty";
            el.innerHTML = '<div class="p-icon">🟫</div><div class="p-name">空地</div><div class="p-timer">点击播种</div>';
          } else {
            const stage = plotStage(plot);
            const c = cropByName(plot.name);
            const ripe = stage === 3;
            el.className = "plot stage-" + stage + (ripe ? " ripe" : "");
            const icon = ripe ? (c ? c.icon : "🌾") : STAGE_ICON[stage];
            el.innerHTML =
              (plot.watered ? '<span class="p-water" title="已浇水">💧</span>' : '') +
              (ripe ? '<span class="p-badge">可收获</span>' : '') +
              '<div class="p-icon">' + esc(icon) + '</div>' +
              '<div class="p-name">' + esc(plot.name) + '</div>' +
              '<div class="p-timer">' + (ripe ? "✨ 点击收获"
                : STAGE_NAME[stage] + " · 还需 " + fmtDuration(plotRemain(plot))) + '</div>';
          }
          grid.appendChild(el);
        });
      }
      const ripe = game.plots.filter(p => p && plotStage(p) === 3).length;
      const growing = game.plots.filter(p => p && plotStage(p) < 3).length;
      setText("farmRipe", ripe);
      setText("farmGrowing", growing);
      setText("farmHarvest", game.stats.harvest);
      setText("farmStock", invTotal() + " / " + capacity());
      setText("farmSub", PLOT_COUNT + " 块田地 · 💰 " + game.gold + "g · 🌱 种子 " +
        Object.keys(game.seeds).reduce((s, k) => s + (Number(game.seeds[k]) || 0), 0) + " 袋 · " +
        (ripe ? ripe + " 块待收获" : "点击空地播种"));
      renderSeasonOverview();
      renderLog("farm", "farmLog");
      updateResourceBar();
    }

    // 四季作物总览：展示每季「所有作物」及当季 / 温室 / 锁定状态
    function renderSeasonOverview() {
      const key = seasonTab || seasonNow().key;
      const tabs = document.getElementById("seasonTabs");
      if (tabs) {
        tabs.innerHTML = SD.seasons.map(s =>
          '<span class="chip' + (s.key === key ? ' active' : '') + '" data-season="' + s.key + '">' +
          s.icon + ' ' + s.full + '（' + seasonCrops(s.key).length + ' 种）</span>').join("");
      }
      const list = document.getElementById("seasonCropList");
      if (!list) return;
      const cur = seasonNow().key, greenhouse = hasGreenhouse();
      list.innerHTML = seasonCrops(key).map(c => {
        const available = greenhouse || c.seasons.indexOf(cur) >= 0;
        const own = Number(game.seeds[c.name]) || 0;
        return '<div class="crop-card' + (available ? '' : ' locked') + '">' +
          '<div class="cc-icon">' + esc(c.icon) + '</div>' +
          '<div class="cc-name">' + esc(c.name) + '</div>' +
          '<div class="cc-meta">' + c.days + ' 日 · 种子 ' + c.seed + 'g · 售价 ' + c.sell + 'g</div>' +
          '<div class="cc-tag ' + (available ? 'ok' : 'off') + '">' + (available
            ? (greenhouse && c.seasons.indexOf(cur) < 0 ? '🏡 温室可种' : '✅ 当季可种') + (own ? ' · 种子 ×' + own : '')
            : '🔒 仅 ' + c.seasons.map(seasonLabel).join('/')) + '</div>' +
          '<div class="cc-note">' + esc(c.note) + '</div>' +
        '</div>';
      }).join("");
    }

    function openPlot(idx) {
      const plot = game.plots[idx];
      if (!plot) {
        const list = plantableCrops(), s = seasonNow();
        const html =
          '<div class="m-icon">🌱</div><div class="m-name">选择种子 · ' + s.icon + esc(s.full) + '</div>' +
          '<div class="m-desc">当季可种 <b>' + list.length + '</b> 种作物 · 每次播种消耗 1 袋种子（在商店购买）<br/>' +
          (hasGreenhouse() ? '🏡 温室已解锁：全部季节作物均可播种' : '仅可播种当季作物；换季后未收获作物会枯萎') + '</div>' +
          '<div class="seed-list">' + list.map((c, i) => {
            const own = Number(game.seeds[c.name]) || 0;
            return '<div class="seed-card' + (own ? '' : ' disabled') + '" data-seed="' + i + '">' +
              '<div class="s-icon">' + esc(c.icon) + '</div>' +
              '<div class="s-name">' + esc(c.name) + '</div>' +
              '<div class="s-cost">种子 ×' + own + ' · ' + c.days + '日</div></div>';
          }).join("") + '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn blue" id="gShop">🛒 去商店买种子</button>' +
            '<button class="btn ghost" id="gCancel">取消</button>' +
          '</div>';
        openGameModal(html);
        document.getElementById("gCancel").addEventListener("click", closeGameModal);
        document.getElementById("gShop").addEventListener("click", () => { closeGameModal(); go("shop"); });
        document.querySelectorAll("#gameBox .seed-card:not(.disabled)").forEach(el => {
          el.addEventListener("click", () => plant(idx, list[Number(el.dataset.seed)]));
        });
        return;
      }
      const stage = plotStage(plot);
      if (stage === 3) { harvest(idx); return; }
      const html =
        '<div class="m-icon">' + STAGE_ICON[stage] + '</div>' +
        '<div class="m-name">' + esc(plot.name) + '</div>' +
        '<div class="m-desc">' + STAGE_NAME[stage] + ' · 距离成熟还需 ' + fmtDuration(plotRemain(plot)) + '<br/>' +
        (plot.watered ? '💧 已浇水（提前 ' + Math.round(waterBonus() / 1000) + ' 秒成熟）' : '尚未浇水') +
        ' · 属于 ' + esc(seasonLabel(plot.seasonKey)) + '</div>' +
        '<div class="modal-actions">' +
          (plot.watered ? '' : '<button class="btn blue" id="gWater">💧 浇水</button>') +
          '<button class="btn warn" id="gClear">铲除</button>' +
          '<button class="btn ghost" id="gClose">关闭</button>' +
        '</div>';
      openGameModal(html);
      const w = document.getElementById("gWater");
      if (w) w.addEventListener("click", () => waterPlot(idx));
      document.getElementById("gClear").addEventListener("click", () => clearPlot(idx));
      document.getElementById("gClose").addEventListener("click", closeGameModal);
    }

    function plant(idx, c) {
      if (!c) return;
      const key = seasonNow().key;
      if (!hasGreenhouse() && c.seasons.indexOf(key) < 0) {
        gameToast("🌱 「" + c.name + "」不是" + seasonNow().full + "作物"); return;
      }
      if (game.plots[idx]) { gameToast("🚫 这块地已经种了作物"); return; }
      if ((Number(game.seeds[c.name]) || 0) < 1) {
        gameToast("🌱 没有「" + c.name + "」种子，请先到商店购买"); return;
      }
      game.seeds[c.name] -= 1;
      if (game.seeds[c.name] <= 0) delete game.seeds[c.name];
      game.plots[idx] = {
        name: c.name, plantedAt: Date.now(),
        watered: (Number(game.owned.sprinkler) || 0) > 0,
        growMs: growMsFor(c), seasonKey: key
      };
      game.stats.planted++;
      addLog("farm", "🌱 播下「" + c.name + "」种子（消耗 1 袋 · " + c.days + " 日成熟）");
      saveGame(); closeGameModal(); renderFarm(); refreshLinked();
      gameToast("🌱 " + c.name + " 已播种，约 " + Math.round(growMsFor(c) / 1000) + " 秒后成熟");
    }
    function harvest(idx) {
      const plot = game.plots[idx];
      if (!plot || plotStage(plot) < 3) { gameToast("🌱 还没成熟，再等等～"); return; }
      if (invTotal() >= capacity()) { gameToast("📦 仓库已满，请先到商店出售产物"); return; }
      const c = cropByName(plot.name) || { days: 7, sell: 20, yield: [1, 1], icon: "🌾" };
      const bonus = (Number(game.owned.hoe) || 0) > 0 ? 1 : 0;
      const count = c.yield[0] + Math.floor(Math.random() * (c.yield[1] - c.yield[0] + 1)) + bonus;
      const got = addHarvest(plot.name, count, "crop");
      if (!got) return;
      game.stats.harvest++;
      addLog("farm", "🌾 收获「" + plot.name + "」×" + got + "（已入仓库 · " + c.sell + "g/个）");
      game.plots[idx] = null;
      saveGame(); closeGameModal(); renderFarm(); refreshLinked();
      gameToast("🎉 收获 " + plot.name + " ×" + got + "，去商店出售换金币吧");
    }
    function waterPlot(idx) {
      const plot = game.plots[idx];
      if (!plot || plot.watered) return;
      plot.watered = true;
      addLog("farm", "💧 给「" + plot.name + "」浇了水，提前 " + Math.round(waterBonus() / 1000) + " 秒成熟");
      saveGame(); closeGameModal(); renderFarm();
      gameToast("💧 浇水成功，成熟时间 -" + Math.round(waterBonus() / 1000) + " 秒");
    }
    function waterAll() {
      let n = 0;
      game.plots.forEach(p => { if (p && !p.watered && plotStage(p) < 3) { p.watered = true; n++; } });
      if (!n) { gameToast("💧 没有需要浇水的地块"); return; }
      addLog("farm", "💧 一键给 " + n + " 块田浇了水");
      saveGame(); renderFarm(); gameToast("💧 已为 " + n + " 块田浇水");
    }
    function harvestAll() {
      const idxs = game.plots.map((p, i) => p && plotStage(p) === 3 ? i : -1).filter(i => i >= 0);
      if (!idxs.length) { gameToast("🧺 还没有成熟的作物"); return; }
      let n = 0;
      for (const i of idxs) {
        if (invTotal() >= capacity()) break;
        const before = game.stats.harvest;
        harvest(i);
        if (game.stats.harvest > before) n++;
      }
      if (n) gameToast("🧺 一键收获 " + n + " 块田，产物已入仓库");
    }
    function clearPlot(idx) {
      if (!confirm("确定铲除这块地的作物吗？种子不会返还。")) return;
      game.plots[idx] = null;
      addLog("farm", "🧹 铲除了一株未成熟的作物");
      saveGame(); closeGameModal(); renderFarm();
    }
    function refreshFarmTimers() {
      if (!isActive("farm")) return;
      game.plots.forEach((plot, idx) => {
        if (!plot) return;
        const el = document.querySelector('#plotGrid .plot[data-idx="' + idx + '"]');
        if (!el) return;
        const stage = plotStage(plot);
        if (stage === 3) { if (!el.classList.contains("ripe")) renderFarm(); return; }
        const t = el.querySelector(".p-timer");
        if (t) t.textContent = STAGE_NAME[stage] + " · 还需 " + fmtDuration(plotRemain(plot));
      });
    }

    /* ============================================================
     * 玩法二：钓鱼 —— 季节钓期开放校验 / 当季鱼种 / 渔获入仓库
     * ============================================================ */
    let fishPhase = "idle";   // idle / waiting / bite / result
    let fishTimer = null;
    let fishResult = { icon: "🎣", text: "", sub: "" };
    function currentFishes() { return SD.fish.filter(f => f.seasons.indexOf(seasonNow().key) >= 0); }

    function updateFishing() {
      regenEnergy();
      renderSeasonStrip("fishSeasonStrip");
      const st = fishingStatus(seasonNow());
      const stage = document.getElementById("fishStage");
      if (stage) stage.className = "game-stage " + (fishPhase === "waiting" ? "waiting" : fishPhase === "bite" ? "bite" : "");
      const castBtn = document.getElementById("castBtn");
      const reelBtn = document.getElementById("reelBtn");
      if (castBtn) {
        castBtn.style.display = fishPhase === "idle" ? "" : "none";
        castBtn.disabled = !st.open || game.energy < 2 || invTotal() >= capacity();
      }
      if (reelBtn) reelBtn.style.display = fishPhase === "bite" ? "" : "none";
      let icon = "🎣", text = st.open ? "水面平静，随时可以抛竿～" : "🚫 当前休渔，钓场关闭", sub = "";
      if (!st.open) { sub = st.next ? "下一钓期：" + st.next : "请等待钓期开放"; }
      else if (invTotal() >= capacity()) { sub = "📦 仓库已满，请先到商店出售产物"; }
      else { sub = "抛竿消耗 2 点体力 · 当前体力 " + game.energy + " · 当季鱼种 " + currentFishes().length + " 种"; }
      if (fishPhase === "waiting") { icon = "🪝"; text = "鱼线已抛出，静静等待…"; sub = "嘘——别惊动了鱼儿"; }
      if (fishPhase === "bite")    { icon = "🐟"; text = "咬钩了！快收竿！"; sub = "3 秒内点击「收竿」，否则鱼会跑掉"; }
      if (fishPhase === "result")  { icon = fishResult.icon; text = fishResult.text; sub = fishResult.sub; }
      setText("fishIcon", icon); setText("fishText", text); setText("fishSub", sub);
      setText("fishCasts", game.stats.casts);
      setText("fishCaught", game.stats.caught);
      setText("fishSpecies", game.species.fish.length);
      setText("fishGold", game.stats.fishGold);
      const badge = document.getElementById("fishOpenBadge");
      if (badge) {
        badge.className = "status-badge " + (st.open ? "ok" : "off");
        badge.textContent = st.open ? "🟢 " + st.label + " · 剩 " + st.daysLeft + " 天" : "🔴 休渔中 · " + st.next;
      }
      renderLog("fishing", "fishLog");
      updateResourceBar();
    }

    function castLine() {
      if (fishPhase !== "idle") { gameToast("🎣 鱼线已经抛出去了"); return; }
      const st = fishingStatus(seasonNow());
      if (!st.open) { gameToast("🎣 当前不在" + seasonNow().full + "钓期（" + st.label + "）"); return; }
      if (!currentFishes().length) { gameToast("🐟 本季暂无可钓鱼种"); return; }
      if (invTotal() >= capacity()) { gameToast("📦 仓库已满，请先到商店出售产物"); return; }
      if (!spendEnergy(2)) return;
      game.stats.casts++;
      fishPhase = "waiting";
      saveGame(); updateFishing(); refreshLinked();
      fishTimer = setTimeout(() => {
        fishPhase = "bite";
        updateFishing();
        fishTimer = setTimeout(() => {
          fishResult = { icon: "💨", text: "收竿太慢，鱼儿溜走了…", sub: "下次动作快一点！" };
          addLog("fishing", "⏰ 咬钩后未及时收竿，鱼儿跑掉了");
          fishPhase = "result";
          saveGame(); updateFishing();
          fishTimer = setTimeout(() => { fishPhase = "idle"; updateFishing(); }, 1800);
        }, 3000);
      }, 1500 + Math.random() * 2000);
    }
    function reelLine() {
      if (fishPhase !== "bite") { gameToast("🎣 还没有鱼咬钩"); return; }
      clearTimeout(fishTimer);
      const list = currentFishes();
      const rate = (Number(game.owned.rod) || 0) > 0 ? 0.93 : 0.78;
      if (Math.random() < rate && list.length) {
        const hasRod = (Number(game.owned.rod) || 0) > 0;
        const it = weightedPick(list, x => hasRod
          ? 1000 / (x.price + 80) * Math.sqrt(x.price)
          : 1000 / (x.price + 50)) || list[0];
        const got = addHarvest(it.name, 1, "fish");
        if (got > 0) {
          game.stats.caught++;
          addLog("fishing", "🐟 钓到「" + it.name + "」（已入仓库 · " + it.price + "g/个）");
          fishResult = { icon: it.icon, text: "钓到了 " + it.name + "！", sub: "已入仓库，去商店出售可换 " + it.price + "g" };
        } else {
          fishResult = { icon: "📦", text: "仓库放不下这条鱼了…", sub: "先去商店出售产物吧" };
        }
      } else {
        addLog("fishing", "💨 提竿太急，鱼儿挣脱了");
        fishResult = { icon: "💨", text: "哎呀，鱼跑掉了…", sub: "再试一次吧！" };
      }
      fishPhase = "result";
      saveGame(); updateFishing(); refreshLinked();
      fishTimer = setTimeout(() => { fishPhase = "idle"; updateFishing(); }, 2200);
    }

    /* ============================================================
     * 玩法三：商店 —— 出售全部产物 / 购买种子与游戏内商品
     * ============================================================ */
    let shopCat = "seed";
    let shopHideLocked = true;   // 种子分类默认只显示当季可购种子
    function sellProduct(name, all) {
      const qty = Number(game.inventory[name]) || 0;
      if (qty <= 0) { gameToast("📦 仓库里没有这件产物"); return; }
      const n = all ? qty : 1;
      const info = productInfo(name);
      const gain = info.price * n;
      game.inventory[name] -= n;
      if (game.inventory[name] <= 0) delete game.inventory[name];
      game.gold += gain;
      game.stats.sold += n;
      game.stats.sellGold += gain;
      if (info.kind === "crop") game.stats.farmGold += gain;
      else if (info.kind === "fish") game.stats.fishGold += gain;
      else if (info.kind === "ore") game.stats.mineGold += gain;
      addLog("shop", "💰 出售「" + name + "」×" + n + "（+" + gain + "g）");
      saveGame(); renderShop(); refreshLinked();
      gameToast("💰 出售 " + name + " ×" + n + "，+" + gain + "g");
    }
    function sellAllProducts() {
      const names = Object.keys(game.inventory).filter(k => (Number(game.inventory[k]) || 0) > 0);
      if (!names.length) { gameToast("📦 仓库是空的，先去收获吧"); return; }
      let total = 0, count = 0;
      names.forEach(name => {
        const qty = Number(game.inventory[name]) || 0;
        const info = productInfo(name);
        const gain = qty * info.price;
        total += gain; count += qty;
        if (info.kind === "crop") game.stats.farmGold += gain;
        else if (info.kind === "fish") game.stats.fishGold += gain;
        else if (info.kind === "ore") game.stats.mineGold += gain;
        delete game.inventory[name];
      });
      game.gold += total;
      game.stats.sold += count;
      game.stats.sellGold += total;
      addLog("shop", "💰 一键出售 " + count + " 件产物（+" + total + "g）");
      saveGame(); renderShop(); refreshLinked();
      gameToast("💰 全部售出，共 +" + total + "g");
    }
    function buyGood(id) {
      const g = goodsList().find(x => x.id === id);
      if (!g) { gameToast("⚠️ 商品不存在"); return; }
      if (g.locked) {
        gameToast("🔒 「" + g.name + "」仅 " + g.seasons.map(seasonLabel).join("/") + " 出售，或先购买温室");
        return;
      }
      if (g.unique && (Number(game.owned[id]) || 0) > 0) {
        gameToast("✅ 已经拥有「" + g.name + "」啦"); return;
      }
      if (game.gold < g.price) {
        gameToast("💰 金币不足，还差 " + (g.price - game.gold) + "g，先去出售产物吧"); return;
      }
      if (g.cat === "food") {
        if (game.energy >= MAX_ENERGY) { gameToast("⚡ 体力已满，暂时不需要食物"); return; }
        game.energy = Math.min(MAX_ENERGY, game.energy + g.energy);
        if (game.energy >= MAX_ENERGY) game.energyAt = Date.now();
      } else if (g.cat === "seed") {
        game.seeds[g.crop] = (Number(game.seeds[g.crop]) || 0) + 1;
      } else {
        game.owned[id] = (Number(game.owned[id]) || 0) + 1;
      }
      game.gold -= g.price;
      game.stats.bought++;
      game.stats.buyGold += g.price;
      addLog("shop", "🛒 购买「" + g.name + "」（-" + g.price + "g）" +
        (g.cat === "food" ? " · 体力 +" + g.energy : g.cat === "seed" ? " · 种子 +1 袋" : ""));
      saveGame(); renderShop(); refreshLinked();
      gameToast("🛒 购买成功：" + g.name + "（-" + g.price + "g）");
    }

    function renderShop() {
      regenEnergy();
      const s = seasonNow(), w = seasonWindow(s);
      setText("shopSeasonChip", s.icon + " " + s.full + " · 第 " + w.day + " 日");
      setText("shopGold", game.gold);
      setText("shopCapacityChip", invTotal() + " / " + capacity());
      setText("shopSellCount", invTotal());
      setText("shopSellValue", invValue());
      setText("shopOwnedCount", game.stats.bought);

      const entries = Object.keys(game.inventory).filter(k => (Number(game.inventory[k]) || 0) > 0);
      const sellBox = document.getElementById("shopSellList");
      if (sellBox) {
        sellBox.innerHTML = entries.length ? entries.map(name => {
          const qty = Number(game.inventory[name]) || 0, info = productInfo(name);
          const kindLabel = { crop: "农作物", fish: "渔获", ore: "矿石", legacy: "图鉴物品", other: "物品" }[info.kind];
          return '<div class="shop-item">' +
            '<div class="si-icon">' + esc(info.icon) + '</div>' +
            '<div class="si-main"><div class="si-name">' + esc(name) + ' <span class="si-tag">' + kindLabel + '</span></div>' +
              '<div class="si-meta">持有 ×' + qty + ' · 单价 ' + info.price + 'g · 合计 ' + (qty * info.price) + 'g</div></div>' +
            '<div class="si-btns">' +
              '<button class="mini-btn" data-act="sell-one" data-name="' + esc(name) + '">卖 1</button>' +
              '<button class="mini-btn gold" data-act="sell-all-one" data-name="' + esc(name) + '">全卖</button>' +
            '</div></div>';
        }).join("") : '<div class="shop-empty">📦 仓库空空如也～<br/>去农场收获、钓场抛竿或矿洞挖掘，产物都会出现在这里。<br/><br/>' +
          '<button class="btn blue" data-act="go-farm">🌾 去农场</button></div>';
      }

      const cats = document.getElementById("shopCats");
      if (cats) {
        cats.innerHTML = SD.cats.map(c =>
          '<span class="chip' + (c.key === shopCat ? ' active' : '') + '" data-cat="' + c.key + '">' + c.label + '</span>'
        ).join("") + (shopCat === "seed" && !hasGreenhouse()
          ? '<span class="chip' + (shopHideLocked ? ' active' : '') + '" data-act="toggle-locked">' +
            (shopHideLocked ? '🌱 仅看当季（' + seasonCrops(seasonNow().key).length + ' 种）' : '📅 显示全部季节') + '</span>'
          : '');
      }
      const goods = document.getElementById("shopGoods");
      if (goods) {
        goods.innerHTML = goodsList()
          .filter(g => g.cat === shopCat && !(shopHideLocked && g.locked))
          .map(g => {
          const owned = Number(game.owned[g.id]) || 0;
          const disabled = g.locked || (g.unique && owned > 0) || game.gold < g.price;
          const tag = g.locked ? '🔒 未到季节'
            : (g.unique && owned > 0) ? '✅ 已拥有'
            : owned > 0 ? '×' + owned + ' 已购'
            : game.gold < g.price ? '💰 金币不足' : '可购买';
          return '<div class="shop-good' + (disabled ? ' disabled' : '') + '">' +
            '<div class="sg-icon">' + esc(g.icon) + '</div>' +
            '<div class="sg-name">' + esc(g.name) + '</div>' +
            '<div class="sg-effect">' + esc(g.effect) + '</div>' +
            '<div class="sg-foot"><span class="sg-price">💰 ' + g.price + 'g</span>' +
              '<span class="sg-tag">' + tag + '</span></div>' +
            (disabled ? '' : '<button class="mini-btn buy" data-act="buy" data-id="' + esc(g.id) + '">购 买</button>') +
          '</div>';
        }).join("");
      }
      const ownedBox = document.getElementById("shopOwned");
      if (ownedBox) {
        const list = SD.goods.filter(g => (Number(game.owned[g.id]) || 0) > 0);
        ownedBox.innerHTML = list.length
          ? list.map(g => '<span class="owned-chip">' + esc(g.icon) + ' ' + esc(g.name) + ' · ' + esc(g.effect) + '</span>').join("")
          : '<span class="owned-chip off">尚未购买任何升级 / 收藏品</span>';
      }
      renderLog("shop", "shopLog");
      updateResourceBar();
    }

    /* ============================================================
     * 玩法四：矿洞 —— 入口 / 状态 / 结果与奖励结算 / 重复与异常操作处理
     * 约定：沿用既有 mineDepth = 1 + floor(digs/5)、每 5 次进一层、
     *       每次消耗 2 点体力、12% 空手概率、weightedPick 稀有度权重；
     *       奖励不再直接发金币，而是入仓库后由商店出售结算（与三大模块一致）。
     * ============================================================ */
    let mineBusy = false;
    function mineDepth() { return 1 + Math.floor((game.stats.digs || 0) / 5); }
    function mineOrePool() {
      const depth = mineDepth();
      return SD.ores.filter(o => o.minDepth <= depth + 2);
    }
    function mineWeight(o, depth) {
      const rare = o.minDepth >= 3;
      const base = o.weight * (rare ? (1 + (depth - 1) * 0.35) : Math.max(0.35, 1 - (depth - 1) * 0.06));
      const boost = (Number(game.owned.pickaxe) || 0) > 0 && rare ? 1.6 : 1;
      return Math.max(1, base * boost);
    }
    function setMineStage(result) {
      setText("mineIcon", result.icon);
      setText("mineText", result.text);
      setText("mineSubText", result.sub);
    }
    function renderMining() {
      regenEnergy();
      const depth = mineDepth();
      setText("mineDepth", depth);
      setText("mineDigs", game.stats.digs);
      setText("mineOres", game.stats.ores);
      setText("mineGold", game.stats.mineGold);
      setText("mineSub", "第 " + depth + " 层 · 越深入稀有矿石越多");
      setText("mineSubText", "挖掘消耗 2 点体力 · 当前体力 " + game.energy +
        " · 再挖 " + (5 - game.stats.digs % 5) + " 次进入下一层");
      const bar = document.getElementById("mineDepthBar");
      if (bar) bar.style.width = ((game.stats.digs % 5) / 5 * 100) + "%";
      const btn = document.getElementById("digBtn");
      if (btn) btn.disabled = mineBusy || game.energy < 2 || invTotal() >= capacity() || !mineOrePool().length;
      const result = document.getElementById("mineResult");
      if (result) {
        const last = game.mine && game.mine.last ? game.mine.last : "";
        result.innerHTML = '<div class="mr-title">🧾 上次挖掘结算</div>' +
          (last ? '<div class="mr-text">' + esc(last) + '</div>' : '<div class="mr-empty">还没有挖掘记录，点击「挖掘」开始吧～</div>') +
          '<div class="mr-tip">奖励：矿石进入仓库（不直接发金币）→ 到「商店」出售结算金币；' +
          '同时按既有约定写入图鉴背包与已解锁物种。</div>';
      }
      const pool = document.getElementById("mineOreList");
      if (pool) {
        pool.innerHTML = '<div class="mr-title">💎 本层可出矿石</div><div class="ore-row">' +
          mineOrePool().map(o => '<span class="ore-chip">' + esc(o.icon) + ' ' + esc(o.name) +
            ' <b>' + o.price + 'g</b></span>').join("") + '</div>';
      }
      setText("mineSync", getToken()
        ? "🔐 已登录：进度按账号同步到后端 /api/progress" + (getRole() === 0 ? " · 管理员" : " · 普通用户")
        : "👤 游客模式：进度仅保存在本机浏览器，不会写入后端");
      renderLog("mining", "mineLog");
      updateResourceBar();
    }
    function dig() {
      // 重复操作：一次挖掘未结算完成前拒绝再次点击
      if (mineBusy) { gameToast("⛏️ 上一镐还没落下，稍等一下～"); return; }
      const pool = mineOrePool();
      if (!pool.length) { gameToast("⛏️ 当前层数暂无可挖矿石"); return; }
      // 异常前置校验：仓库满时不允许消耗体力（避免产出丢失 / 幽灵奖励）
      if (invTotal() >= capacity()) { gameToast("📦 仓库已满，请先到商店出售矿石"); return; }
      if (!spendEnergy(2)) return;
      mineBusy = true;
      const stage = document.getElementById("mineStage");
      const btn = document.getElementById("digBtn");
      if (btn) btn.disabled = true;
      if (stage) stage.classList.add("waiting");
      const depth = mineDepth();
      try {
        game.stats.digs++;
        const empty = Math.random() < 0.12;
        let result;
        if (empty) {
          addLog("mining", "🕳️ 第 " + depth + " 层这一镐挖空了，只有碎石");
          result = { icon: "🪨", text: "只有一堆碎石…", sub: "本次没有收获 · 体力 -2", toast: "🪨 一无所获，再试一次" };
        } else {
          const pick = weightedPick(pool, o => mineWeight(o, depth));
          const extra = (Number(game.owned.pickaxe) || 0) > 0 && depth >= 4 && Math.random() < 0.25 ? 1 : 0;
          const got = addHarvest(pick.name, 1 + extra, "ore");
          if (got <= 0) {
            // 极端异常（仓库被并发写满）：完整回滚本次消耗，不产生任何奖励
            game.stats.digs = Math.max(0, game.stats.digs - 1);
            game.energy = Math.min(MAX_ENERGY, game.energy + 2);
            gameToast("📦 仓库已满，本次挖掘已取消");
            return;
          }
          game.stats.ores += got;
          addLog("mining", "⛏️ 第 " + depth + " 层挖到「" + pick.name + "」×" + got +
            "（已入仓库 · " + pick.price + "g/个）");
          result = { icon: pick.icon, text: "挖到了 " + pick.name + " ×" + got + "！",
            sub: "已入仓库 · 出售可换 " + (pick.price * got) + "g",
            toast: "⛏️ " + pick.name + " ×" + got + " 已入库" };
        }
        game.mine = { last: result.text + "｜" + result.sub, at: Date.now(), depth: depth };
        setMineStage(result);
        saveGame(); renderMining(); refreshLinked();
        gameToast(result.toast);
      } catch (err) {
        // 异常兜底：回滚计数与体力，避免状态错乱或重复发奖励
        game.stats.digs = Math.max(0, (game.stats.digs || 1) - 1);
        game.energy = Math.min(MAX_ENERGY, game.energy + 2);
        addLog("mining", "⚠️ 挖掘出现异常，本次操作已回滚");
        gameToast("⚠️ 操作异常，请重试");
        saveGame(); renderMining();
      } finally {
        setTimeout(() => {
          mineBusy = false;
          if (stage) stage.classList.remove("waiting");
          if (btn) btn.disabled = false;
          renderMining();
        }, 500);
      }
    }
    // ===== 渲染：作物图鉴 =====
    function renderCodex() {
      const grid = document.getElementById("grid");
      const q = state.searchQ.trim().toLowerCase();
      const list = state.items.filter(it => {
        const okCat = state.currentCat === "all" || it.cat === state.currentCat;
        const text = (it.description || "") + " " + (it.name || "");
        const okQ = !q || it.name.toLowerCase().includes(q)
          || (CAT_LABEL[it.cat] || "").includes(q)
          || text.toLowerCase().includes(q);
        return okCat && okQ;
      });
      grid.innerHTML = "";
      if (!list.length) {
        grid.innerHTML = '<div class="empty">🌾 没有找到相关条目，换个关键词试试？</div>';
        return;
      }
      list.forEach(it => {
        const owned = state.bag[it.name] || 0;
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML =
          (owned > 0 ? '<span class="owned-badge">×' + owned + '</span>' : '') +
          '<div class="icon">' + it.icon + '</div>' +
          '<div class="name">' + it.name + '</div>' +
          '<span class="tag">' + (CAT_LABEL[it.cat] || it.cat) + '</span>' +
          '<div class="desc">' + (it.description || "") + '</div>';
        card.addEventListener("click", () => openModal(it));
        grid.appendChild(card);
      });
    }

    // ===== 物品详情弹窗 =====
    function openModal(it) {
      const owned = state.bag[it.name] || 0;
      const box = document.getElementById("modalBox");
      box.innerHTML =
        '<div class="m-icon">' + it.icon + '</div>' +
        '<div class="m-name">' + it.name + '</div>' +
        '<span class="m-tag">' + (CAT_LABEL[it.cat] || it.cat) + '</span>' +
        '<div class="m-desc">' + (it.description || "暂无描述") + '</div>' +
        '<div class="m-owned">背包持有：' + owned + ' 个</div>' +
        '<div class="modal-actions">' +
          '<button class="btn" id="modalAdd">＋ 收集</button>' +
          '<button class="btn warn" id="modalRemove"' + (owned > 0 ? '' : ' disabled') + '>－ 移除</button>' +
        '</div>';
      document.getElementById("modalMask").classList.add("show");
      document.getElementById("modalAdd").addEventListener("click", () => {
        addToBag(it.name); closeModal(); renderCodex(); renderHome(); renderBag();
      });
      const rm = document.getElementById("modalRemove");
      if (rm) rm.addEventListener("click", () => {
        removeFromBag(it.name, 1); closeModal(); renderCodex(); renderHome(); renderBag();
      });
    }
    function closeModal() { document.getElementById("modalMask").classList.remove("show"); }
    document.getElementById("modalMask").addEventListener("click", e => {
      if (e.target.id === "modalMask") closeModal();
    });

    // ===== 背包操作 =====
    function addToBag(name, n) {
      state.bag[name] = (state.bag[name] || 0) + (n || 1);
      saveBag();
    }
    function removeFromBag(name, n) {
      if (!state.bag[name]) return;
      state.bag[name] -= (n || 1);
      if (state.bag[name] <= 0) delete state.bag[name];
      saveBag();
    }

    // ===== 渲染：社区中心 =====
    function renderCommunity() {
      const grid = document.getElementById("bundleGrid");
      grid.innerHTML = "";
      bundleDefs.forEach(b => {
        const filled = state.bundles[b.id] || [];
        const done = filled.length === b.need.length;
        const card = document.createElement("div");
        card.className = "bundle" + (done ? " done" : "");
        let slots = "";
        b.need.forEach(name => {
          const isFilled = filled.includes(name);
          const owned = state.bag[name] || 0;
          const it = itemByName(name);
          const icon = it ? it.icon : "❔";
          slots +=
            '<div class="slot' + (isFilled ? ' filled' : '') + '">' +
              '<span class="s-icon">' + icon + '</span>' +
              '<span class="s-name">' + name + (isFilled ? '（已捐赠）' : '') + '</span>' +
              (isFilled
                ? '<span class="s-check">✓</span>'
                : '<button class="donate-btn" data-bundle="' + b.id + '" data-name="' + name + '"' + (owned > 0 ? '' : ' disabled') + '>捐赠</button>') +
            '</div>';
        });
        card.innerHTML =
          '<div class="bundle-head"><span class="b-icon">' + b.icon + '</span>' +
          '<span class="b-title">' + b.title + (done ? ' ✅' : '') + '</span></div>' +
          '<div class="bundle-desc">' + b.desc + '</div>' +
          slots +
          '<div class="bundle-progress">进度：' + filled.length + ' / ' + b.need.length + '</div>';
        grid.appendChild(card);
      });
      grid.querySelectorAll(".donate-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const bid = btn.dataset.bundle, name = btn.dataset.name;
          if ((state.bag[name] || 0) <= 0) return;
          removeFromBag(name, 1);
          if (!state.bundles[bid]) state.bundles[bid] = [];
          if (!state.bundles[bid].includes(name)) state.bundles[bid].push(name);
          saveBundles();
          renderCommunity(); renderBag(); renderHome();
        });
      });
    }

    // ===== 渲染：背包 =====
    function renderBag() {
      const grid = document.getElementById("bagGrid");
      const entries = Object.keys(state.bag).filter(k => state.bag[k] > 0)
        .map(k => ({ name: k, count: state.bag[k], it: itemByName(k) }));
      grid.innerHTML = "";
      if (!entries.length) {
        grid.innerHTML = '<div class="empty">🎒 背包还是空的，去「作物图鉴」收集物种吧！</div>';
        return;
      }
      entries.forEach(e => {
        const icon = e.it ? e.it.icon : "❔";
        const el = document.createElement("div");
        el.className = "bag-item";
        el.innerHTML =
          '<div class="b-icon">' + icon + '</div>' +
          '<div class="b-info"><div class="b-name">' + e.name + '</div>' +
          '<div class="b-count">持有 ×' + e.count + '</div></div>' +
          '<button class="remove-btn" data-name="' + e.name + '">移除</button>';
        grid.appendChild(el);
      });
      grid.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          removeFromBag(btn.dataset.name, 1);
          renderBag(); renderCodex(); renderHome();
        });
      });
    }

    // ===== 渲染：设置 =====
    function renderSettings() {
      let f = {};
      try { f = JSON.parse(localStorage.getItem(LS_FARMER)) || {}; } catch (e) {}
      document.getElementById("setFarmerName").value = f.farmerName || f.account || "";
      document.getElementById("setFarmName").value = f.farmName || "";
    }

    // ===== 登录态：显示农夫名 / 退出 / 权限控制 =====
    // 权限约定（与后端一致）：role === 0 为管理员，role === 1 为普通用户（默认）
    function getRole() {
      try {
        const f = JSON.parse(localStorage.getItem(LS_FARMER) || "{}");
        return (f.role === 0) ? 0 : 1; // 缺省按普通用户处理
      } catch (e) { return 1; }
    }
    function applyFarmer() {
      try {
        const raw = localStorage.getItem(LS_FARMER);
        if (raw) {
          const f = JSON.parse(raw);
          const name = f.farmerName || f.account || "农夫";
          document.getElementById("farmerName").textContent = name;
          document.getElementById("welcome").innerHTML =
            "欢迎回到星露谷，<b>" + name + "</b>！今天也要努力种田哦～ 🌞";
        }
      } catch (e) { /* 忽略 */ }
      // 「后台管理」入口对所有用户可见，点击后进入后台登录页，由管理员凭证验证把关
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      const token = getToken();
      if (token) {
        fetch("/api/auth/logout", {
          method: "POST",
          headers: { "X-User-Token": token }
        }).catch(() => {});
      }
      localStorage.removeItem(LS_FARMER);
      location.href = "/login";
    });

    // ===== 导航 / 搜索 绑定 =====
    document.querySelectorAll("#navLinks a").forEach(a => {
      a.addEventListener("click", e => { e.preventDefault(); go(a.dataset.page); });
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
      state.searchQ = document.getElementById("searchInput").value;
      if (!document.getElementById("page-codex").classList.contains("active")) go("codex");
      else renderCodex();
    });
    document.getElementById("searchInput").addEventListener("input", e => {
      state.searchQ = e.target.value; renderCodex();
    });
    document.getElementById("searchInput").addEventListener("keydown", e => {
      if (e.key === "Enter") {
        state.searchQ = e.target.value;
        if (!document.getElementById("page-codex").classList.contains("active")) go("codex");
        else renderCodex();
      }
    });
    document.getElementById("chips").addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      document.querySelectorAll("#chips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.currentCat = chip.dataset.cat;
      renderCodex();
    });

    // ===== 设置：保存资料 / 数据管理 =====
    document.getElementById("saveProfileBtn").addEventListener("click", () => {
      let f = {};
      try { f = JSON.parse(localStorage.getItem(LS_FARMER)) || {}; } catch (e) {}
      f.farmerName = document.getElementById("setFarmerName").value.trim() || f.farmerName;
      f.farmName = document.getElementById("setFarmName").value.trim();
      localStorage.setItem(LS_FARMER, JSON.stringify(f));
      applyFarmer();
      document.getElementById("profileTip").textContent = "✅ 资料已保存";
      setTimeout(() => document.getElementById("profileTip").textContent = "", 2000);
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      const data = { farmer: JSON.parse(localStorage.getItem(LS_FARMER) || "{}"), bag: state.bag, bundles: state.bundles, game: game };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "stardew-progress.json"; a.click();
      URL.revokeObjectURL(url);
      document.getElementById("dataTip").textContent = "📦 进度已导出";
      setTimeout(() => document.getElementById("dataTip").textContent = "", 2000);
    });

    document.getElementById("resetBagBtn").addEventListener("click", () => {
      if (!confirm("确定清空背包中所有物品？此操作不可撤销。")) return;
      state.bag = {};
      saveBag();
      renderBag(); renderCodex(); renderHome();
      document.getElementById("dataTip").textContent = "🧹 背包已清空";
      setTimeout(() => document.getElementById("dataTip").textContent = "", 2000);
    });

    document.getElementById("resetBundleBtn").addEventListener("click", () => {
      if (!confirm("确定重置社区中心所有收集包进度？已捐赠物品不会退回背包。")) return;
      state.bundles = {};
      saveBundles();
      renderCommunity(); renderHome();
      document.getElementById("dataTip").textContent = "🔄 社区中心已重置";
      setTimeout(() => document.getElementById("dataTip").textContent = "", 2000);
    });

    /* ============================================================
     * 玩法事件绑定 + 启动
     * ============================================================ */
    function bind(id, handler) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", handler);
    }
    bind("castBtn", castLine);
    bind("reelBtn", reelLine);
    bind("digBtn", dig);
    bind("farmWaterAll", waterAll);
    bind("farmHarvestAll", harvestAll);
    ["farmGoShop", "fishGoShop", "mineGoShop"].forEach(id => bind(id, () => go("shop")));
    const gameMask = document.getElementById("gameMask");
    if (gameMask) {
      gameMask.addEventListener("click", e => { if (e.target.id === "gameMask") closeGameModal(); });
    }
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeGameModal(); });

    const plotGrid = document.getElementById("plotGrid");
    if (plotGrid) {
      plotGrid.addEventListener("click", e => {
        const p = e.target.closest(".plot");
        if (!p) return;
        openPlot(Number(p.dataset.idx));
      });
    }
    const seasonTabs = document.getElementById("seasonTabs");
    if (seasonTabs) {
      seasonTabs.addEventListener("click", e => {
        const c = e.target.closest("[data-season]");
        if (!c) return;
        seasonTab = c.dataset.season;
        renderSeasonOverview();
      });
    }
    const shopRoot = document.getElementById("shopRoot");
    if (shopRoot) {
      shopRoot.addEventListener("click", e => {
        const cat = e.target.closest("[data-cat]");
        if (cat) { shopCat = cat.dataset.cat; renderShop(); return; }
        const act = e.target.closest("[data-act]");
        if (!act) return;
        const a = act.dataset.act;
        if (a === "sell-one") sellProduct(act.dataset.name, false);
        else if (a === "sell-all-one") sellProduct(act.dataset.name, true);
        else if (a === "sell-all") sellAllProducts();
        else if (a === "buy") buyGood(act.dataset.id);
        else if (a === "toggle-locked") { shopHideLocked = !shopHideLocked; renderShop(); }
        else if (a === "go-farm") go("farm");
        else if (a === "go-fishing") go("fishing");
        else if (a === "go-mining") go("mining");
      });
    }
    bind("resetGameBtn", () => {
      if (!confirm("确定重置全部玩法进度吗？金币、种子、仓库、地块、商店购买、钓鱼与挖矿统计将清零（背包与社区中心不受影响）。")) return;
      game = defaultGame();
      game.seasonKey = seasonNow().key;
      fishPhase = "idle";
      clearTimeout(fishTimer);
      cacheGame(); syncProgress();
      renderFarm(); updateFishing(); renderShop(); renderMining(); refreshLinked();
      setText("dataTip", "🔄 玩法进度已重置");
      setTimeout(() => setText("dataTip", ""), 2000);
    });

    // ===== 启动 =====
    (async function init() {
      applyFarmer();
      loadGame();              // 本地玩法状态（离线缓存）
      syncSeasonChange();      // 先按本地缓存处理换季
      await loadItems();       // 图鉴条目（后台维护）
      await loadBundleDefs();  // 社区中心收集包
      await loadProgress();    // 后端优先：背包 / 捐赠 / 玩法状态
      syncSeasonChange();      // 后端状态覆盖后再次校验季节
      regenEnergy();
      route();
      // 每秒刷新体力、倒计时、换季与各玩法状态
      setInterval(() => {
        regenEnergy();
        updateResourceBar();
        refreshFarmTimers();
        if (syncSeasonChange()) { renderHome(); renderFarm(); renderShop(); }
        if (fishPhase === "idle" && isActive("fishing")) updateFishing();
        if (isActive("mining") && !mineBusy) renderMining();
      }, 1000);
    })();
