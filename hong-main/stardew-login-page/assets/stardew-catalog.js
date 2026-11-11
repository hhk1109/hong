/* ============================================================
 * 星露谷 · 季节 / 作物 / 鱼类 / 矿石 / 商店商品目录
 * 纯数据文件（window.SD_CATALOG），由 home.html 加载，供 stardew-game.js 使用。
 *
 * 关键假设（规则未明确处，沿用项目既有约定）：
 *  A1 四季映射真实日历：春 3-5 月、夏 6-8 月、秋 9-11 月、冬 12-2 月；
 *     每季按游戏内 28 天折算，真实日期在季节窗口内的进度线性映射到「第 N 日」。
 *  A2 作物只能在所属季节购买种子并播种（拥有「温室」时解除限制）；
 *     换季时未收获的作物枯萎（拥有「稻草人」时受保护）——沿用游戏内设定。
 *  A3 钓鱼按各季「钓期」开放：春 3/10-5/20、夏 6/15-8/25、秋 9/5-11/20、
 *     冬（冰钓）12/20-2/10；非钓期禁止抛竿，鱼种还需当季可捕获。
 *  A4 收获 / 钓获 / 挖矿的产物统一进入「仓库」(inventory)，不直接发放金币；
 *     在商店出售才结算金币。既有「背包 / 图鉴 / 社区中心」数据不受影响。
 *  A5 价格为游戏内金币(g)近似值；生长天数压缩为真实秒数（20s + 4s×天数），
 *     与既有「90 秒成熟、浇水 -15 秒」节奏保持一致。
 *  A6 权限沿用既有约定：持 X-User-Token 的登录用户按账号同步 /api/progress；
 *     游客仅本地游玩，不写入后端。
 * ============================================================ */
(function (root) {
  "use strict";

  /* ---------- 四季与钓期 ---------- */
  var SEASONS = [
    { key: "spring", name: "春", icon: "🌸", full: "春季", color: "#f4a6c0",
      start: [3, 1], end: [5, 31], window: "3月1日 – 5月31日",
      desc: "万物复苏，防风草与草莓的季节",
      fish: { from: [3, 10], to: [5, 20], label: "春钓期 3月10日 – 5月20日" } },
    { key: "summer", name: "夏", icon: "☀️", full: "夏季", color: "#f6c445",
      start: [6, 1], end: [8, 31], window: "6月1日 – 8月31日",
      desc: "阳光充足，蓝莓与甜瓜的旺季",
      fish: { from: [6, 15], to: [8, 25], label: "夏钓期 6月15日 – 8月25日" } },
    { key: "fall", name: "秋", icon: "🍂", full: "秋季", color: "#e08a3c",
      start: [9, 1], end: [11, 30], window: "9月1日 – 11月30日",
      desc: "丰收之秋，南瓜与蔓越莓满仓",
      fish: { from: [9, 5], to: [11, 20], label: "秋钓期 9月5日 – 11月20日" } },
    { key: "winter", name: "冬", icon: "❄️", full: "冬季", color: "#8fc4e8",
      start: [12, 1], end: [2, 28], window: "12月1日 – 2月末",
      desc: "土地冻结，仅冬季野种与冰钓开放",
      fish: { from: [12, 20], to: [2, 10], label: "冬钓期（冰钓）12月20日 – 2月10日" } }
  ];

  /* ---------- 作物目录（seasons 为可种植季节；days 为游戏内生长天数） ---------- */
  var CROPS = [
    // 春
    { name: "防风草",   icon: "🌱", seasons: ["spring"],            days: 4,  seed: 20,  sell: 35,   yield: [1, 1], note: "春季最快成熟的作物" },
    { name: "马铃薯",   icon: "🥔", seasons: ["spring"],            days: 6,  seed: 50,  sell: 80,   yield: [1, 2], note: "收获时有几率多挖出一个" },
    { name: "胡萝卜",   icon: "🥕", seasons: ["spring"],            days: 4,  seed: 30,  sell: 50,   yield: [1, 1], note: "春季新作物，脆甜可口" },
    { name: "郁金香",   icon: "🌷", seasons: ["spring"],            days: 6,  seed: 20,  sell: 30,   yield: [1, 1], note: "春季花卉，送礼佳品" },
    { name: "蓝调花",   icon: "💠", seasons: ["spring"],            days: 7,  seed: 30,  sell: 50,   yield: [1, 1], note: "蓝色小花，春夜散发香气" },
    { name: "花椰菜",   icon: "🥦", seasons: ["spring"],            days: 12, seed: 80,  sell: 175,  yield: [1, 1], note: "有机会长成巨型作物" },
    { name: "草莓",     icon: "🍓", seasons: ["spring"],            days: 8,  seed: 100, sell: 120,  yield: [2, 3], note: "多次收获，镇长的最爱" },
    { name: "樱桃",     icon: "🍒", seasons: ["spring"],            days: 7,  seed: 120, sell: 80,   yield: [2, 3], note: "果树苗，春季稳定产出" },
    { name: "大蒜",     icon: "🧄", seasons: ["spring"],            days: 4,  seed: 40,  sell: 60,   yield: [1, 1], note: "春季短期作物" },
    { name: "大黄",     icon: "🍃", seasons: ["spring"],            days: 13, seed: 100, sell: 220,  yield: [1, 1], note: "沙漠商店的春季种子" },
    { name: "咖啡豆",   icon: "☕", seasons: ["spring", "summer"],  days: 10, seed: 200, sell: 15,   yield: [4, 6], note: "春夏均可种，多次收获" },
    { name: "远古水果", icon: "🍷", seasons: ["spring", "summer", "fall"], days: 28, seed: 500, sell: 550, yield: [1, 2], note: "传说作物，可跨春夏秋" },

    // 夏
    { name: "蓝莓",       icon: "🫐", seasons: ["summer"],          days: 13, seed: 80,  sell: 50,   yield: [3, 4], note: "一次结多颗，产量极高" },
    { name: "玉米",       icon: "🌽", seasons: ["summer", "fall"],  days: 14, seed: 150, sell: 50,   yield: [2, 3], note: "夏秋两季均可种植" },
    { name: "番茄",       icon: "🍅", seasons: ["summer"],          days: 11, seed: 50,  sell: 60,   yield: [2, 3], note: "成熟后可持续结果" },
    { name: "辣椒",       icon: "🌶️", seasons: ["summer"],          days: 5,  seed: 40,  sell: 40,   yield: [2, 3], note: "夏季短期作物，可多次收获" },
    { name: "甜瓜",       icon: "🍈", seasons: ["summer"],          days: 12, seed: 80,  sell: 250,  yield: [1, 1], note: "夏之盛宴，售价可观" },
    { name: "啤酒花",     icon: "🍺", seasons: ["summer"],          days: 11, seed: 60,  sell: 25,   yield: [3, 5], note: "攀藤作物，用于酿淡啤酒" },
    { name: "向日葵",     icon: "🌻", seasons: ["summer"],          days: 8,  seed: 20,  sell: 80,   yield: [1, 2], note: "朝向太阳，招人喜欢" },
    { name: "红叶卷心菜", icon: "🟥", seasons: ["summer"],          days: 9,  seed: 100, sell: 260,  yield: [1, 1], note: "夏季高价作物" },
    { name: "小麦",       icon: "🌾", seasons: ["summer", "fall"],  days: 4,  seed: 10,  sell: 25,   yield: [2, 3], note: "夏秋均可，面粉原料" },
    { name: "罂粟",       icon: "🌺", seasons: ["summer"],          days: 7,  seed: 100, sell: 140,  yield: [1, 1], note: "夏季花卉" },
    { name: "夏季亮片",   icon: "🌼", seasons: ["summer"],          days: 8,  seed: 50,  sell: 90,   yield: [1, 1], note: "夏日限定的亮色小花" },

    // 秋
    { name: "南瓜",     icon: "🎃", seasons: ["fall"],   days: 13, seed: 100, sell: 320,  yield: [1, 1], note: "秋季代表作物，可长成巨型" },
    { name: "茄子",     icon: "🍆", seasons: ["fall"],   days: 5,  seed: 20,  sell: 60,   yield: [2, 3], note: "成熟后持续结果" },
    { name: "山药",     icon: "🍠", seasons: ["fall"],   days: 10, seed: 60,  sell: 160,  yield: [1, 2], note: "秋季根茎作物" },
    { name: "蔓越莓",   icon: "🔴", seasons: ["fall"],   days: 7,  seed: 240, sell: 75,   yield: [3, 4], note: "高价种子，多次收获" },
    { name: "甜菜",     icon: "🟣", seasons: ["fall"],   days: 6,  seed: 20,  sell: 100,  yield: [1, 2], note: "可制糖，秋季短期作物" },
    { name: "苋菜",     icon: "🍂", seasons: ["fall"],   days: 7,  seed: 70,  sell: 150,  yield: [1, 2], note: "秋季谷物，颜色金黄" },
    { name: "葡萄",     icon: "🍇", seasons: ["fall"],   days: 10, seed: 60,  sell: 80,   yield: [2, 3], note: "藤架作物，可酿酒" },
    { name: "朝鲜蓟",   icon: "🥗", seasons: ["fall"],   days: 8,  seed: 30,  sell: 160,  yield: [1, 1], note: "秋季高价蔬菜" },
    { name: "白菜",     icon: "🥬", seasons: ["fall"],   days: 4,  seed: 50,  sell: 80,   yield: [1, 2], note: "秋季生长迅速" },
    { name: "玫瑰仙子", icon: "🌹", seasons: ["fall"],   days: 12, seed: 100, sell: 290,  yield: [1, 1], note: "秋季稀有花卉" },
    { name: "甜宝石莓", icon: "💎", seasons: ["fall"],   days: 24, seed: 1000, sell: 3000, yield: [1, 1], note: "稀有种子，秋日传说" },

    // 冬（室外土地冻结，仅冬季野种可播；温室可种全部作物）
    { name: "水晶果", icon: "🔮", seasons: ["winter"], days: 7, seed: 60, sell: 150, yield: [1, 2], note: "冬季野种产物，晶莹剔透" },
    { name: "雪山药", icon: "🌰", seasons: ["winter"], days: 7, seed: 60, sell: 100, yield: [1, 2], note: "雪地里挖出的冬季野种" },
    { name: "番红花", icon: "🌸", seasons: ["winter"], days: 7, seed: 60, sell: 80,  yield: [1, 2], note: "寒冬里绽放的小花" },
    { name: "冬青树", icon: "🌲", seasons: ["winter"], days: 7, seed: 60, sell: 80,  yield: [1, 2], note: "冬季野种，节日装饰" }
  ];

  /* ---------- 鱼类目录（seasons 为可捕获季节） ---------- */
  var FISH = [
    { name: "鲈鱼",     icon: "🐟", seasons: ["spring", "summer", "fall", "winter"], price: 30,  note: "鹈鹕河最常见的鱼" },
    { name: "鲤鱼",     icon: "🎏", seasons: ["spring", "summer", "fall", "winter"], price: 30,  note: "全季可见，性子温吞" },
    { name: "鲶鱼",     icon: "🐡", seasons: ["spring", "fall", "winter"],          price: 60,  note: "雨天夜里在河里游荡" },
    { name: "沙丁鱼",   icon: "🐠", seasons: ["spring", "fall", "winter"],          price: 40,  note: "海边成群出没" },
    { name: "虹鳟鱼",   icon: "🍥", seasons: ["summer"],                            price: 50,  note: "夏日溪流里的斑斓身影" },
    { name: "河豚",     icon: "🎈", seasons: ["summer"],                            price: 120, note: "夏日晴天出海才有" },
    { name: "金枪鱼",   icon: "🍣", seasons: ["summer", "winter"],                  price: 100, note: "力气很大的深海鱼" },
    { name: "鲑鱼",     icon: "🥓", seasons: ["fall"],                              price: 80,  note: "秋季洄游，逆流而上" },
    { name: "虎鳟鱼",   icon: "🐯", seasons: ["fall", "winter"],                    price: 110, note: "秋冬季的河中猎手" },
    { name: "鱿鱼",     icon: "🐙", seasons: ["winter"],                            price: 80,  note: "冬夜海边才能钓到" },
    { name: "冰川鱼",   icon: "🧊", seasons: ["winter"],                            price: 150, note: "冰钓期限定的稀有鱼" },
    { name: "传说之鱼", icon: "🦈", seasons: ["spring"],                            price: 500, note: "春季传说，月圆之夜现身" }
  ];

  /* ---------- 矿石目录（minDepth 为最早出现的层数；weight 为基础权重） ---------- */
  var ORES = [
    { name: "铜矿石",   icon: "🔶", price: 25,  minDepth: 1, weight: 100, note: "矿洞浅层最常见" },
    { name: "铁矿石",   icon: "🔷", price: 55,  minDepth: 1, weight: 70,  note: "熔炼工具的必需品" },
    { name: "紫水晶",   icon: "🟪", price: 90,  minDepth: 2, weight: 34,  note: "中层矿脉的紫色晶体" },
    { name: "金矿石",   icon: "🥇", price: 120, minDepth: 3, weight: 28,  note: "泛着金光的珍贵矿石" },
    { name: "绿宝石",   icon: "💚", price: 130, minDepth: 3, weight: 24,  note: "深层的绿色宝石" },
    { name: "钻石",     icon: "💎", price: 400, minDepth: 4, weight: 8,   note: "矿洞最深处的稀世珍宝" },
    { name: "红宝石",   icon: "❤️", price: 150, minDepth: 5, weight: 16,  note: "炽热如火的红色宝石" },
    { name: "铱矿石",   icon: "⚙️", price: 250, minDepth: 6, weight: 10,  note: "深层稀有矿，价值不菲" }
  ];

  /* ---------- 商店商品（种子由作物目录动态生成） ---------- */
  var GOODS = [
    { id: "watering_can", name: "铜制洒水壶",   icon: "🚿", cat: "tool",     price: 180,  unique: true, effect: "浇水提前成熟 15 秒 → 30 秒" },
    { id: "sprinkler",    name: "优质洒水器",   icon: "💧", cat: "tool",     price: 420,  unique: true, effect: "新播种的作物自动浇水" },
    { id: "hoe",          name: "钢锄头",       icon: "🪓", cat: "tool",     price: 260,  unique: true, effect: "每次收获额外 +1 作物" },
    { id: "rod",          name: "玻璃纤维钓竿", icon: "🎣", cat: "tool",     price: 300,  unique: true, effect: "钓鱼成功率 78% → 93%，稀有鱼权重提升" },
    { id: "pickaxe",      name: "钢镐子",       icon: "⛏️", cat: "tool",     price: 280,  unique: true, effect: "挖矿稀有矿石概率提升" },
    { id: "scarecrow",    name: "稻草人",       icon: "👒", cat: "upgrade",  price: 180,  unique: true, effect: "换季时保护地里作物不枯萎" },
    { id: "greenhouse",   name: "温室",         icon: "🏡", cat: "upgrade",  price: 2500, unique: true, effect: "任意季节可购买 / 种植全部作物" },
    { id: "backpack",     name: "大背包",       icon: "🎒", cat: "upgrade",  price: 600,  unique: true, effect: "仓库容量 60 → 120 格" },

    { id: "fried_egg",    name: "煎蛋",     icon: "🍳", cat: "food",      price: 60,  energy: 6,  effect: "立即恢复 6 点体力" },
    { id: "bread",        name: "面包",     icon: "🍞", cat: "food",      price: 90,  energy: 10, effect: "立即恢复 10 点体力" },
    { id: "salad",        name: "沙拉",     icon: "🥗", cat: "food",      price: 110, energy: 12, effect: "立即恢复 12 点体力" },
    { id: "coffee",       name: "咖啡",     icon: "☕", cat: "food",      price: 150, energy: 15, effect: "立即恢复 15 点体力" },
    { id: "pumpkin_soup", name: "南瓜汤",   icon: "🍲", cat: "food",      price: 200, energy: 20, effect: "立即恢复 20 点体力" },

    { id: "barrel",       name: "木桶",     icon: "🛢️", cat: "furniture", price: 120, effect: "农场装饰 · 可用于酿酒" },
    { id: "pot",          name: "花盆",     icon: "🪴", cat: "furniture", price: 80,  effect: "农场装饰 · 可摆放作物" },
    { id: "torch",        name: "火把",     icon: "🔥", cat: "furniture", price: 50,  effect: "照亮夜晚的农场" },
    { id: "tv",           name: "电视机",   icon: "📺", cat: "furniture", price: 350, effect: "每天收看天气预报与烹饪节目" },
    { id: "fence",        name: "木栅栏",   icon: "🪵", cat: "furniture", price: 40,  effect: "围出整齐的田地" },

    { id: "chicken",      name: "小鸡",     icon: "🐔", cat: "animal",    price: 400,  effect: "牧场伙伴 · 每天产蛋" },
    { id: "duck",         name: "鸭子",     icon: "🦆", cat: "animal",    price: 600,  effect: "牧场伙伴 · 偶尔产鸭蛋" },
    { id: "cow",          name: "奶牛",     icon: "🐄", cat: "animal",    price: 800,  effect: "牧场伙伴 · 每天产牛奶" },
    { id: "sheep",        name: "绵羊",     icon: "🐑", cat: "animal",    price: 1200, effect: "牧场伙伴 · 定期产羊毛" },

    { id: "stardrop",     name: "星之果实", icon: "⭐", cat: "special",   price: 5000, unique: true, effect: "传说收藏品 · 星露谷的纪念" },
    { id: "totem",        name: "传送图腾", icon: "🌀", cat: "special",   price: 300,  effect: "农场纪念品 · 可摆放在客厅" }
  ];

  var CATS = [
    { key: "seed",      label: "🌱 种子" },
    { key: "tool",      label: "🛠️ 工具" },
    { key: "upgrade",   label: "🏡 农场升级" },
    { key: "food",      label: "🍳 食物" },
    { key: "furniture", label: "🪑 家具" },
    { key: "animal",    label: "🐔 动物" },
    { key: "special",   label: "⭐ 特殊" }
  ];

  root.SD_CATALOG = {
    seasons: SEASONS,
    crops: CROPS,
    fish: FISH,
    ores: ORES,
    goods: GOODS,
    cats: CATS
  };
})(typeof window !== "undefined" ? window : globalThis);
