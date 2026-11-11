/* ============================================================
 * 星露谷玩法 · 真实浏览器端到端交互测试（零第三方依赖）
 * 运行：node scripts/game-e2e-browser-test.js
 *
 * 通过 Chrome DevTools Protocol 实际点击页面，走通：
 *   买种子 → 播种 → 收获 → 出售 → 购买升级 → 抛竿收竿 → 挖掘 / 重复点击拦截
 * 并收集页面运行时异常。游客模式，不写入后端账号数据。
 * ============================================================ */
"use strict";
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_CANDIDATES = [
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
];
const CHROME = CHROME_CANDIDATES.find(p => fs.existsSync(p));
if (!CHROME) { console.error("未找到 Chrome / Edge，跳过 E2E 测试"); process.exit(2); }

const PORT = 9231;
const PROFILE = path.join(__dirname, "..", "log", "e2e-chrome-profile");
const sleep = ms => new Promise(r => setTimeout(r, ms));
let passed = 0, failed = 0;
function check(cond, label, extra) {
  if (cond) { passed++; console.log("  ✓ " + label); }
  else { failed++; console.log("  ✗ " + label + (extra !== undefined ? " → " + JSON.stringify(extra) : "")); }
}

let id = 0;
const pending = new Map();
const events = [];
let ws;
function send(method, params) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    const timer = setTimeout(() => { pending.delete(mid); reject(new Error("CDP 超时: " + method)); }, 15000);
    pending.set(mid, { resolve: v => { clearTimeout(timer); resolve(v); }, reject: e => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id: mid, method: method, params: params || {} }));
  });
}
async function ev(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(expr + " → " + (r.exceptionDetails.text || "异常"));
  return r.result.value;
}
async function waitFor(expr, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 10000)) {
    try { if (await ev(expr)) return true; } catch (e) { /* 上下文尚未就绪 */ }
    await sleep(120);
  }
  throw new Error("等待超时: " + expr);
}
async function go(page) {
  await ev('go("' + page + '")');
  await sleep(350);
}

(async function main() {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-allow-origins=*", "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + PORT, "about:blank"
  ], { stdio: "ignore" });

  try {
    let target = null;
    for (let i = 0; i < 60 && !target; i++) {
      try {
        const list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json();
        target = list.find(t => t.type === "page");
      } catch (e) { /* 尚未启动 */ }
      if (!target) await sleep(250);
    }
    if (!target) throw new Error("Chrome 调试端口未就绪");

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    ws.addEventListener("message", e => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id); pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
      } else if (msg.method) events.push(msg);
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");
    await send("Page.navigate", { url: "http://localhost:5173/home" });
    await waitFor("typeof game !== 'undefined' && document.getElementById('seasonBanner').innerHTML.length > 20", 15000);

    // 干净的游客基线
    await ev("localStorage.clear(); game = defaultGame(); game.gold = 1000; game.seasonKey = seasonNow().key; saveGame(); renderHome(); true");
    console.log("\n[1] 商店购买当季种子（真实点击）");
    await go("shop");
    check(await ev("document.getElementById('shopCats').textContent.indexOf('仅看当季') >= 0"), "默认只显示当季种子");
    const firstBuy = await ev("(function(){var b=document.querySelector('#shopGoods .mini-btn.buy');return b?b.dataset.id:null})()");
    check(!!firstBuy, "存在可购买种子", firstBuy);
    await ev("document.querySelector('#shopGoods .mini-btn.buy').click()");
    check(await ev("Object.keys(game.seeds).length") === 1, "点击购买后种子入库");
    check(await ev("game.gold") < 1000, "购买扣除金币");
    const seedName = await ev("Object.keys(game.seeds)[0]");

    console.log("\n[2] 农场播种 / 收获（真实点击）");
    await go("farm");
    await ev("document.querySelector('#plotGrid .plot.empty').click()");
    check(await ev("document.getElementById('gameMask').classList.contains('show')"), "点击空地弹出种子选择");
    await ev("document.querySelector('#gameBox .seed-card:not(.disabled)').click()");
    check(await ev("!!game.plots[0]"), "点击种子卡片完成播种");
    check(await ev("game.plots[0].name") === seedName, "播种的是已购种子");
    await ev("game.plots[0].plantedAt = Date.now() - 999999; renderFarm(); true");
    const goldBefore = await ev("game.gold");
    await ev("document.getElementById('farmHarvestAll').click()");
    check(await ev("invTotal()") > 0, "一键收获产物入仓库");
    check(await ev("game.gold") === goldBefore, "收获不直接发金币");
    check(await ev("game.plots.filter(Boolean).length") === 0, "收获后地块清空");

    console.log("\n[3] 商店出售 / 购买升级（真实点击）");
    await go("shop");
    await ev("document.querySelector('[data-act=\"sell-all\"]').click()");
    check(await ev("invTotal()") === 0, "一键全部出售清空仓库");
    check(await ev("game.gold") > goldBefore, "出售结算金币");
    await ev("game.gold = 5000; shopCat = 'upgrade'; renderShop(); true");
    await ev("(function(){var b=document.querySelector('#shopGoods [data-id=\"greenhouse\"]');if(b)b.click();return true})()");
    check(await ev("game.owned.greenhouse || 0") === 1, "点击购买温室升级");
    check(await ev("plantableCrops().length") === await ev("SD.crops.length"), "温室解锁全季作物");

    console.log("\n[4] 钓鱼（真实点击抛竿 / 收竿）");
    await go("fishing");
    check(await ev("document.getElementById('castBtn').disabled") === false, "当前钓期抛竿按钮可用");
    const casts0 = await ev("game.stats.casts");
    await ev("window.__rnd = Math.random; Math.random = function(){return 0}; document.getElementById('castBtn').click()");
    check(await ev("game.stats.casts") === casts0 + 1, "抛竿计数 +1");
    await ev("fishPhase = 'bite'; updateFishing(); true");
    await ev("document.getElementById('reelBtn').click()");
    check(await ev("game.stats.caught") === 1, "收竿钓获 +1");
    check(await ev("invTotal()") > 0, "渔获入仓库");
    await ev("Math.random = window.__rnd; true");

    console.log("\n[5] 矿洞（真实点击 + 重复操作拦截）");
    await go("mining");
    await ev("game.inventory = {}; game.energy = 20; Math.random = function(){return 0.5}; renderMining(); true");
    const digs0 = await ev("game.stats.digs");
    await ev("document.getElementById('digBtn').click()");
    check(await ev("game.stats.digs") === digs0 + 1, "挖掘次数 +1");
    check(await ev("invTotal()") > 0, "矿石奖励入仓库");
    check(await ev("document.getElementById('mineResult').textContent.indexOf('上次挖掘结算') >= 0"), "结果结算面板展示");
    await ev("document.getElementById('digBtn').click()");
    check(await ev("game.stats.digs") === digs0 + 1, "连点第二次被拦截（不重复发奖励）");
    await sleep(700);
    check(await ev("document.getElementById('digBtn').disabled") === false, "冷却结束后按钮恢复可用");
    await ev("Math.random = window.__rnd; true");

    console.log("\n[6] 运行时异常 & 既有功能");
    const errors = events.filter(e =>
      e.method === "Runtime.exceptionThrown" ||
      (e.method === "Log.entryAdded" && e.params.entry && e.params.entry.level === "error"));
    check(errors.length === 0, "浏览器控制台 0 个未捕获异常", errors.length);
    check(await ev("document.getElementById('gameModuleGrid').children.length") >= 4, "首页四个功能入口卡片存在");
    await go("codex");
    check(await ev("document.getElementById('grid').children.length") > 0, "既有作物图鉴正常渲染");
    await go("community");
    check(await ev("document.getElementById('bundleGrid').children.length") > 0, "既有社区中心正常渲染");

    console.log("\n============ E2E 结果：" + passed + " 通过 / " + failed + " 失败 ============");
  } finally {
    try { if (ws) ws.close(); } catch (e) {}
    try { execSync('taskkill /PID ' + proc.pid + ' /T /F', { stdio: "ignore" }); } catch (e) { try { proc.kill(); } catch (e2) {} }
  }
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error("E2E 异常：", e.message); process.exit(1); });
