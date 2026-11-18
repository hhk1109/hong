/* ============================================================
 * 星露谷玩法冒烟测试（Node.js，零依赖）
 * 运行：node scripts/game-smoke-test.js
 * 用最小 DOM 桩加载 stardew-catalog.js + stardew-game.js，
 * 校验四季/钓期、种植、收获、出售、购买、钓鱼、挖矿与异常处理。
 * ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "hong-main", "stardew-login-page", "assets");
const catalog = fs.readFileSync(path.join(ASSETS, "stardew-catalog.js"), "utf8");
const gameSrc = fs.readFileSync(path.join(ASSETS, "stardew-game.js"), "utf8");

/* ---------- 最小 DOM 桩 ---------- */
const elements = new Map();
function makeEl(id) {
  const set = new Set();
  return {
    id: id || "", innerHTML: "", textContent: "", value: "", disabled: false,
    dataset: {}, style: {}, className: "", children: [],
    classList: {
      add: c => set.add(c), remove: c => set.delete(c), contains: c => set.has(c),
      toggle: (c, f) => { if (f === undefined) (set.has(c) ? set.delete(c) : set.add(c)); else (f ? set.add(c) : set.delete(c)); }
    },
    addEventListener() {}, appendChild(c) { this.children.push(c); }, querySelector() { return null; },
    querySelectorAll() { return []; }, closest() { return null; }, click() {}, focus() {}
  };
}
const document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(); }, addEventListener() {}
};
const store = new Map();
const localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
const fetchStub = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ code: 200, data: {} })
});

const ctx = {
  console, document, localStorage, fetch: fetchStub,
  location: { hash: "", href: "" },
  confirm: () => true,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0,
  Blob: function () {}, URL: { createObjectURL: () => "", revokeObjectURL: () => {} },
  Date, Math, JSON, String, Number, Array, Object, Promise, isFinite, parseInt, parseFloat
};
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.addEventListener = () => {};
vm.createContext(ctx);

/* 测试钩子：与被测脚本处于同一词法作用域，可访问 let/const 绑定 */
const HOOK = `
;globalThis.__sd = {
  get game() { return game; },
  set game(v) { game = v; },
  toasts: [],
  setFishPhase(v) { fishPhase = v; },
  setMineIdle() { mineBusy = false; },
  setRandom(fn) { Math.random = fn; },
  SD, seasonNow, seasonWindow, fishingStatus, fishingOpenOn, seasonCrops,
  get state() { return state; }, FALLBACK_ITEMS, CAT_LABEL, renderCodex,
  plantableCrops, cropByName, productInfo, invTotal, invValue, capacity,
  hasGreenhouse, goodsList, plotStage, plant, harvest, waterAll, harvestAll,
  renderFarm, renderShop, renderMining, renderHome, renderLog, updateFishing,
  castLine, reelLine, sellProduct, sellAllProducts, buyGood, dig, mineDepth,
  toolLevel, upgradeTool, unlockGreenhouse, checkGreenhouseUnlock, allBundlesDone,
  get bundleDefs() { return bundleDefs; },
  buyFeed, buyAnimal, feedAnimal, collectAnimal, animalState,
  renderBlacksmith, renderGreenhouse, renderRanch,
  normalizeGame, defaultGame, syncSeasonChange, esc
};
const __origToast = gameToast;
gameToast = function (msg) { globalThis.__sd.toasts.push(String(msg)); };
`;

vm.runInContext(catalog, ctx, { filename: "stardew-catalog.js" });
vm.runInContext(gameSrc + HOOK, ctx, { filename: "stardew-game.js" });

/* ---------- 断言 ---------- */
let passed = 0, failed = 0;
function ok(cond, label) {
  if (cond) { passed++; console.log("  ✓ " + label); }
  else { failed++; console.log("  ✗ " + label); }
}
function eq(a, b, label) { ok(a === b, label + "（实际 " + JSON.stringify(a) + "）"); }

(async function run() {
  // 等待脚本末尾 async init() 的微任务完成
  await new Promise(r => setTimeout(r, 50));
  const S = ctx.__sd;
  const D = y => (m, d) => new Date(y, m - 1, d);
  const d2026 = D(2026);

  console.log("\n[1] 四季与钓期");
  eq(S.seasonNow(d2026(4, 15)).key, "spring", "4月 = 春季");
  eq(S.seasonNow(d2026(7, 15)).key, "summer", "7月 = 夏季");
  eq(S.seasonNow(d2026(10, 15)).key, "fall", "10月 = 秋季");
  eq(S.seasonNow(d2026(1, 15)).key, "winter", "1月 = 冬季");
  const fall = S.seasonNow(d2026(10, 11));
  const win = S.seasonNow(d2026(1, 5));
  const w = S.seasonWindow(fall, d2026(10, 11));
  ok(w.day >= 1 && w.day <= 28, "季节内游戏日落在 1~28");
  ok(S.fishingStatus(fall, d2026(10, 11)).open, "秋钓期 11/11 开放");
  ok(!S.fishingStatus(fall, d2026(11, 25)).open, "秋钓期 11/25 已关闭");
  ok(S.fishingStatus(win, d2026(1, 5)).open, "冬钓期跨年（1/5）开放");
  ok(!S.fishingStatus(win, d2026(2, 20)).open, "冬钓期 2/20 已关闭");
  ok(S.fishingStatus(fall, d2026(11, 25)).next.indexOf("冬") >= 0, "休渔时提示下一钓期");

  console.log("\n[2] 当季全部作物");
  const springCrops = S.seasonCrops("spring").map(c => c.name);
  const fallCrops = S.seasonCrops("fall").map(c => c.name);
  ok(springCrops.includes("草莓") && springCrops.includes("樱桃") && springCrops.length >= 10, "春季含草莓/樱桃等全部作物");
  ok(fallCrops.includes("南瓜") && fallCrops.includes("玉米") && fallCrops.includes("小麦") && fallCrops.includes("远古水果"), "秋季含南瓜/玉米/小麦/远古水果");
  eq(S.seasonCrops("winter").length, 4, "冬季仅 4 种冬季野种产物");
  eq(S.plantableCrops().length, fallCrops.length, "当前仅当季作物可种");

  console.log("\n[3] 播种（季节限制 / 种子消耗）");
  S.game.gold = 1000;
  S.game.seeds["草莓"] = 1;
  S.plant(0, S.cropByName("草莓"));
  eq(S.game.plots[0], null, "非当季作物禁止播种");
  eq(S.game.seeds["草莓"], 1, "被拦截时不扣种子");
  ok(S.toasts.some(t => t.indexOf("不是") >= 0), "给出季节限制提示");
  S.game.seeds["南瓜"] = 1;
  S.plant(0, S.cropByName("南瓜"));
  ok(S.game.plots[0] && S.game.plots[0].name === "南瓜", "当季作物播种成功");
  eq(S.game.seeds["南瓜"], undefined, "播种消耗 1 袋种子");
  eq(S.game.gold, 1000, "播种不额外扣金币（金币在买种子时结算）");
  eq(S.game.stats.planted, 1, "累计播种 +1");
  S.plant(0, S.cropByName("南瓜"));
  ok(S.toasts.some(t => t.indexOf("已经种了") >= 0), "重复播种被拦截");

  console.log("\n[4] 收获（产物入仓库，不直接发金币）");
  S.game.plots[0].plantedAt = Date.now() - 10 * 60 * 1000;
  eq(S.plotStage(S.game.plots[0]), 3, "作物随时间成熟");
  const goldBeforeHarvest = S.game.gold;
  S.harvest(0);
  ok((S.game.inventory["南瓜"] || 0) > 0, "收获产物进入仓库");
  eq(S.game.gold, goldBeforeHarvest, "收获不直接发放金币");
  ok((ctx.localStorage.getItem("stardew_bag") || "").indexOf("南瓜") >= 0, "同步写入既有图鉴背包");
  eq(S.game.plots[0], null, "收获后地块清空");
  eq(S.game.stats.harvest, 1, "累计收获 +1");

  console.log("\n[5] 商店出售 / 购买");
  const pumpkins = S.game.inventory["南瓜"];
  S.sellProduct("南瓜", true);
  eq(S.game.inventory["南瓜"], undefined, "单种全卖后仓库清空");
  eq(S.game.gold, goldBeforeHarvest + pumpkins * 320, "按 320g/个结算金币");
  eq(S.game.stats.farmGold, pumpkins * 320, "农场出售收益计入既有统计");
  S.buyGood("seed:南瓜");
  eq(S.game.seeds["南瓜"], 1, "购买当季种子入库");
  S.buyGood("seed:草莓");
  eq(S.game.seeds["草莓"], 1, "非当季种子被锁定，不能重复买（数量未增加）");
  S.game.gold = 5000;
  S.toasts.length = 0;
  S.buyGood("greenhouse");
  ok(S.toasts.some(t => t.indexOf("不在杂货店出售") >= 0), "温室不能在商店购买");
  S.buyGood("watering_can");
  ok(S.toasts.some(t => t.indexOf("工具请去铁匠铺升级") >= 0), "工具不能在商店购买");
  S.unlockGreenhouse("gold");
  eq(S.game.greenhouse.unlocked, true, "支付金币解锁温室");
  eq(S.game.gold, 2500, "金币解锁温室扣除 2500g");
  eq(S.plantableCrops().length, S.SD.crops.length, "温室解锁全部季节作物");
  S.buyGood("seed:草莓");
  eq(S.game.seeds["草莓"], 2, "温室下可购买非当季种子");
  S.toasts.length = 0;
  S.unlockGreenhouse("gold");
  ok(S.toasts.some(t => t.indexOf("已经解锁") >= 0), "重复解锁温室被拦截");
  S.game.gold = 0;
  S.buyGood("bread");
  ok(S.toasts.some(t => t.indexOf("金币不足") >= 0), "金币不足时拦截购买");

  console.log("\n[6] 钓鱼（钓期 + 渔获入仓库）");
  S.game.energy = 20;
  S.game.gold = 5000;
  const castsBefore = S.game.stats.casts;
  S.castLine();
  eq(S.game.stats.casts, castsBefore + 1, "当前秋钓期可抛竿");
  eq(S.game.energy, 18, "抛竿消耗 2 点体力");
  S.setFishPhase("bite");
  S.setRandom(() => 0);   // 强制成功 + 取权重表首项
  S.reelLine();
  eq(S.game.stats.caught, 1, "及时收竿钓获 +1");
  ok(S.invTotal() > 0, "渔获进入仓库");
  const fishName = Object.keys(S.game.inventory)[0];
  S.sellProduct(fishName, true);
  ok(S.game.gold > 5000, "出售渔获得金币");
  ok(S.game.stats.fishGold > 0, "渔获收益计入既有统计");

  console.log("\n[7] 挖矿（入口状态 / 结算 / 重复与异常拦截）");
  S.setRandom(() => 0.5);
  S.game.energy = 20;
  S.game.inventory = {};
  S.setMineIdle();
  const digsBefore = S.game.stats.digs;
  S.dig();
  eq(S.game.stats.digs, digsBefore + 1, "挖掘次数 +1");
  ok(S.invTotal() > 0, "矿石奖励进入仓库（不直接发金币）");
  ok(S.game.mine.last && S.game.mine.last.length > 0, "记录上次挖掘结算结果");
  eq(S.game.energy, 18, "挖掘消耗 2 点体力");
  S.dig();  // mineBusy 未释放 → 应被拦截
  eq(S.game.stats.digs, digsBefore + 1, "重复点击不产生第二次奖励");
  ok(S.toasts.some(t => t.indexOf("上一镐") >= 0), "重复操作给出提示");
  S.setMineIdle();
  S.game.energy = 0;
  S.dig();
  eq(S.game.stats.digs, digsBefore + 1, "体力不足时拦截挖掘");
  S.game.energy = 20;
  S.game.inventory = {};
  for (let i = 0; i < S.capacity(); i++) S.game.inventory["矿石占位"] = (S.game.inventory["矿石占位"] || 0) + 1;
  S.dig();
  eq(S.game.stats.digs, digsBefore + 1, "仓库满时拦截挖掘且不扣体力");
  eq(S.game.energy, 20, "被拦截时体力完整回滚");
  ok(S.mineDepth() >= 1, "层数状态可展示");
  S.renderMining();
  ok(document.getElementById("mineSync").textContent.indexOf("游客") >= 0, "未登录时显示游客模式（权限约定）");

  console.log("\n[8] 换季枯萎 / 旧数据兼容 / 一键出售");
  S.game.inventory = {};
  S.game.seasonKey = "spring";
  S.game.plots[1] = { name: "草莓", plantedAt: Date.now(), watered: false, growMs: 60000, seasonKey: "spring" };
  ok(S.syncSeasonChange(), "检测到换季");
  eq(S.game.plots[1], null, "未收获的春季作物在秋季枯萎");
  eq(S.game.seasonKey, "fall", "季节标记已更新");
  const old = S.normalizeGame({ plots: [{ name: "南瓜", plantedAt: Date.now(), watered: false }], gold: "bad" });
  ok(old.plots[0].growMs > 0 && old.plots[0].seasonKey, "旧格式地块自动补齐生长时长与季节");
  eq(old.gold, 500, "异常金币值兜底为初始值 500");
  S.game = S.defaultGame();
  eq(S.game.gold, 500, "新档初始金币为 500");
  S.game.inventory = { "南瓜": 3, "铜矿石": 2 };
  const g0 = S.game.gold;
  S.sellAllProducts();
  eq(S.invTotal(), 0, "一键全部出售清空仓库");
  ok(S.game.gold > g0, "一键出售结算金币");
  eq(S.game.stats.mineGold, 2 * 25, "矿石收益计入矿洞出售统计");

  console.log("\n[9] 全量图鉴 / 初始金币 / 既有功能未被破坏");
  const codexItems = S.FALLBACK_ITEMS.filter(it => it.cat !== "villager");
  ok(codexItems.length >= 80, "图鉴兜底数据覆盖全部目录物品（实际 " + codexItems.length + " 条）");
  ["草莓", "传说之鱼", "铱矿石", "温室", "星之果实", "小鸡"].forEach(n => {
    ok(codexItems.some(it => it.name === n), "图鉴包含 " + n);
  });
  ok(codexItems.every(it => !!S.CAT_LABEL[it.cat]), "图鉴所有分类均有中文标签");
  S.state.items = S.FALLBACK_ITEMS;
  document.getElementById("grid").children.length = 0;
  S.renderCodex();
  ok(document.getElementById("grid").children.length === codexItems.length, "图鉴渲染条目数与数据一致");
  ok(S.defaultGame().gold === 500, "默认初始金币 500");
  ok(typeof S.esc("<b>") === "string" && S.esc("<b>").indexOf("&lt;") >= 0, "HTML 转义函数可用（原页面缺失已修复）");
  S.renderLog("farm", "farmLog");
  S.renderHome(); S.renderFarm(); S.renderShop(); S.updateFishing();
  ok(true, "首页 / 农场 / 商店 / 钓鱼渲染无异常");

  console.log("\n[10] 铁匠铺：工具不能直接购买，只能逐级升级");
  S.game = S.defaultGame();
  S.game.gold = 5000;
  S.game.inventory["铜矿石"] = 10;
  S.toasts.length = 0;
  S.buyGood("watering_can");
  ok(S.toasts.some(t => t.indexOf("工具请去铁匠铺升级") >= 0), "工具无法在商店直接购买");
  S.upgradeTool("watering_can");
  eq(S.toolLevel("watering_can"), 1, "铁匠处升级洒水壶到铜级");
  eq(S.game.inventory["铜矿石"], 5, "升级消耗 5 块铜矿石");
  eq(S.game.gold, 4800, "升级消耗 200g");
  S.toasts.length = 0;
  S.upgradeTool("watering_can");
  ok(S.toasts.some(t => t.indexOf("铁矿石") >= 0 && t.indexOf("不足") >= 0), "材料不足时不能升级");
  S.renderBlacksmith();
  ok(true, "铁匠面板渲染无异常");

  console.log("\n[11] 温室：社区中心全收集免费解锁 / 未满足条件不可用");
  S.game = S.defaultGame();
  S.state.bundles = {};
  S.game.greenhouse = { unlocked: false, method: "" };
  ok(!S.hasGreenhouse(), "初始温室锁定");
  ok(!S.allBundlesDone(), "社区中心未完成");
  S.toasts.length = 0;
  S.unlockGreenhouse("community");
  ok(S.toasts.some(t => t.indexOf("尚未全部完成") >= 0), "未满足条件时无法免费解锁");
  S.bundleDefs.forEach(b => { S.state.bundles[b.id] = b.need.slice(); });
  ok(S.allBundlesDone(), "社区中心全部完成");
  S.checkGreenhouseUnlock(true);
  eq(S.game.greenhouse.method, "community", "社区中心完成免费解锁温室");
  ok(S.hasGreenhouse(), "免费解锁后温室可用");
  S.renderGreenhouse();
  ok(true, "温室面板渲染无异常");

  console.log("\n[12] 牧场：购买动物 / 喂养 / 产物收集");
  S.game = S.defaultGame();
  S.game.gold = 5000;
  S.buyAnimal("chicken");
  eq(S.game.animals.length, 1, "购入小鸡");
  eq(S.game.gold, 4600, "购买动物扣除 400g");
  S.toasts.length = 0;
  S.feedAnimal(0);
  ok(S.toasts.some(t => t.indexOf("没有饲料") >= 0), "没有饲料时喂养被拦截");
  S.buyFeed(1);
  eq(S.game.feed, 1, "购买饲料 +1 份");
  S.feedAnimal(0);
  eq(S.game.feed, 0, "喂养消耗 1 份饲料");
  ok(S.game.animals[0].fed, "喂养后进入产出状态");
  S.game.animals[0].readyAt = Date.now() - 1;
  eq(S.animalState(S.game.animals[0], S.SD.animals[0]).key, "ready", "产出完成后可收集");
  S.collectAnimal(0);
  eq(S.game.inventory["鸡蛋"], 1, "收集鸡蛋进入仓库");
  eq(S.game.animals[0].fed, false, "收集后需再次喂养");
  const ranchGoldBefore = S.game.stats.ranchGold;
  S.sellProduct("鸡蛋", true);
  ok(S.game.stats.ranchGold > ranchGoldBefore, "牧场产物出售计入牧场收益统计");
  S.toasts.length = 0;
  S.collectAnimal(0);
  ok(S.toasts.some(t => t.indexOf("还没准备好") >= 0), "未产出时不能重复收集");
  S.renderRanch();
  ok(true, "牧场面板渲染无异常");

  console.log("\n================ 结果：" + passed + " 通过 / " + failed + " 失败 ================");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error("测试异常：", e); process.exit(1); });
