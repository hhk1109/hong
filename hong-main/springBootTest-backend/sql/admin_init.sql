-- ============================================================
-- 星露谷 · 后台管理系统数据库初始化脚本
-- 数据库：stardew（复用现有库）
-- 说明：初始化 item（首页展示条目）、bundle（社区中心收集包）表并导入数据，
--       并为 user 表补充 status（账号状态）列。
--       后台管理员身份已并入 user 表（role=0 即为管理员），
--       默认管理员（admin / admin123）由后端首次启动时自动创建，无需本脚本维护。
-- 执行方式（本地 MySQL，root / 123456）：
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 < admin_init.sql
-- 注意：末尾两条 ALTER 重复执行会报 Duplicate column（可忽略），
--       启动脚本使用 mysql --force 保证遇错继续执行。
-- ============================================================

USE `stardew`;

-- 首页展示条目表（作物 / 动物 / 村民图鉴）
CREATE TABLE IF NOT EXISTS `item` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `icon`        VARCHAR(16)  NOT NULL                COMMENT '图标（emoji）',
    `name`        VARCHAR(64)  NOT NULL                COMMENT '名称',
    `cat`         VARCHAR(16)  NOT NULL                COMMENT '分类：crop作物 animal动物 villager村民 fish钓鱼 ore矿石 tool工具 upgrade升级 food食物 furniture家具 special特殊',
    `description` VARCHAR(255) DEFAULT ''              COMMENT '描述',
    `sort_order`  INT          NOT NULL DEFAULT 999    COMMENT '排序值，越小越靠前',
    `enabled`     TINYINT      NOT NULL DEFAULT 1      COMMENT '是否启用：1-首页可见 0-隐藏',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_cat` (`cat`),
    KEY `idx_sort` (`sort_order`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '首页展示条目表';

-- 导入首页原有静态数据（幂等：仅在表为空时插入）
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT t.`icon`, t.`name`, t.`cat`, t.`description`, t.`sort_order`, 1
FROM (
    SELECT '🍓' AS `icon`, '草莓' AS `name`, 'crop' AS `cat`, '春季作物，可多次收获，镇长的最爱。' AS `description`, 1 AS `sort_order`
    UNION ALL SELECT '🍇', '蓝莓', 'crop', '夏季作物，产量高，制作果酱一流。', 2
    UNION ALL SELECT '🌽', '玉米', 'crop', '夏秋两季均可种植，烘烤后更香甜。', 3
    UNION ALL SELECT '🎃', '南瓜', 'crop', '秋季作物，万圣节必备，售价可观。', 4
    UNION ALL SELECT '🍒', '樱桃', 'crop', '多年生果树，春季稳定产出。', 5
    UNION ALL SELECT '🍺', '啤酒花', 'crop', '夏季攀藤作物，用于酿制淡啤酒。', 6
    UNION ALL SELECT '🍞', '远古水果', 'crop', '传说作物，酿成酒价值连城。', 7
    UNION ALL SELECT '🐔', '鸡', 'animal', '每天产蛋，金色母鸡更珍贵。', 8
    UNION ALL SELECT '🐄', '奶牛', 'animal', '产出牛奶，可制作奶酪。', 9
    UNION ALL SELECT '🐑', '羊', 'animal', '产出羊毛，梳毛后制成布料。', 10
    UNION ALL SELECT '🐖', '猪', 'animal', '松露猎手，林间觅得松露。', 11
    UNION ALL SELECT '🐎', '马', 'animal', '牧场好伙伴，提升移动速度。', 12
    UNION ALL SELECT '👧', '阿比盖尔', 'villager', '鹈鹕镇少女，热爱矿物与冒险。', 13
    UNION ALL SELECT '🧔', '塞巴斯蒂安', 'villager', '镇上的程序员，钟爱雨天。', 14
    UNION ALL SELECT '👵', '艾芙琳', 'villager', '和蔼的祖母，擅长烘焙。', 15
    UNION ALL SELECT '🧑‍🌾', '镇长刘易斯', 'villager', '鹈鹕镇镇长，关心小镇发展。', 16
) AS t
WHERE NOT EXISTS (SELECT 1 FROM `item`);

-- 钓鱼玩法的鱼类目录（sort_order = 售价，后台管理可调）
-- 幂等：按名称逐条插入，已存在则跳过
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🐟', '鲈鱼', 'fish', '鹈鹕河里最常见的鱼，新手渔夫的起点。', 40, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '鲈鱼');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🍥', '虹鳟鱼', 'fish', '夏季节可钓 · 夏日溪流里的斑斓身影。售价 50g。', 50, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '虹鳟鱼');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🐡', '鲶鱼', 'fish', '力气很大的深水鱼，咬钩时鱼竿都在颤抖。', 120, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '鲶鱼');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🦈', '传说之鱼', 'fish', '只在月圆之夜现身的深海巨物，渔夫的终极梦想。', 500, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '传说之鱼');

-- 矿洞玩法的矿石目录（sort_order = 售价，后台管理可调）
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🔶', '铜矿石', 'ore', '矿洞浅层最常见的矿石，熔炼后用途广泛。', 25, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '铜矿石');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🔷', '铁矿石', 'ore', '埋藏在矿洞中层的闪亮矿石，锻制工具的必需品。', 60, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '铁矿石');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '🥇', '金矿石', 'ore', '深层矿脉中泛着金光，价值不菲。', 150, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '金矿石');
INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT '💎', '钻石', 'ore', '矿洞最深处才可能见到的稀世珍宝。', 400, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '钻石');

-- ============================================================
-- 全量物品图鉴：与 stardew-catalog.js 的作物 / 鱼类 / 矿石 / 商品目录对齐
-- 共 90 条（图鉴展示 86 条，村民 4 条在独立模块）
-- 幂等策略：先修正旧名称，再按名称更新已有条目、插入缺失条目
-- ============================================================
UPDATE `item` SET `name` = '虹鳟鱼' WHERE `name` = '虹鳟';

DROP TEMPORARY TABLE IF EXISTS `tmp_codex_items`;
CREATE TEMPORARY TABLE `tmp_codex_items` (
    `icon`        VARCHAR(16)  NOT NULL,
    `name`        VARCHAR(64)  NOT NULL,
    `cat`         VARCHAR(16)  NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `sort_order`  INT          NOT NULL
) ENGINE = MEMORY DEFAULT CHARSET = utf8mb4;

INSERT INTO `tmp_codex_items` (`icon`, `name`, `cat`, `description`, `sort_order`) VALUES
  ('🌱', '防风草', 'crop', '春季作物 · 春季最快成熟的作物 种子 20g，售价 35g，需 4 天成熟。', 35),
  ('🥔', '马铃薯', 'crop', '春季作物 · 收获时有几率多挖出一个 种子 50g，售价 80g，需 6 天成熟。', 80),
  ('🥕', '胡萝卜', 'crop', '春季作物 · 春季新作物，脆甜可口 种子 30g，售价 50g，需 4 天成熟。', 50),
  ('🌷', '郁金香', 'crop', '春季作物 · 春季花卉，送礼佳品 种子 20g，售价 30g，需 6 天成熟。', 30),
  ('💠', '蓝调花', 'crop', '春季作物 · 蓝色小花，春夜散发香气 种子 30g，售价 50g，需 7 天成熟。', 50),
  ('🥦', '花椰菜', 'crop', '春季作物 · 有机会长成巨型作物 种子 80g，售价 175g，需 12 天成熟。', 175),
  ('🍓', '草莓', 'crop', '春季作物 · 多次收获，镇长的最爱 种子 100g，售价 120g，需 8 天成熟。', 120),
  ('🍒', '樱桃', 'crop', '春季作物 · 果树苗，春季稳定产出 种子 120g，售价 80g，需 7 天成熟。', 80),
  ('🧄', '大蒜', 'crop', '春季作物 · 春季短期作物 种子 40g，售价 60g，需 4 天成熟。', 60),
  ('🍃', '大黄', 'crop', '春季作物 · 沙漠商店的春季种子 种子 100g，售价 220g，需 13 天成熟。', 220),
  ('☕', '咖啡豆', 'crop', '春/夏季作物 · 春夏均可种，多次收获 种子 200g，售价 15g，需 10 天成熟。', 15),
  ('🍷', '远古水果', 'crop', '春/夏/秋季作物 · 传说作物，可跨春夏秋 种子 500g，售价 550g，需 28 天成熟。', 550),
  ('🫐', '蓝莓', 'crop', '夏季作物 · 一次结多颗，产量极高 种子 80g，售价 50g，需 13 天成熟。', 50),
  ('🌽', '玉米', 'crop', '夏/秋季作物 · 夏秋两季均可种植 种子 150g，售价 50g，需 14 天成熟。', 50),
  ('🍅', '番茄', 'crop', '夏季作物 · 成熟后可持续结果 种子 50g，售价 60g，需 11 天成熟。', 60),
  ('🌶️', '辣椒', 'crop', '夏季作物 · 夏季短期作物，可多次收获 种子 40g，售价 40g，需 5 天成熟。', 40),
  ('🍈', '甜瓜', 'crop', '夏季作物 · 夏之盛宴，售价可观 种子 80g，售价 250g，需 12 天成熟。', 250),
  ('🍺', '啤酒花', 'crop', '夏季作物 · 攀藤作物，用于酿淡啤酒 种子 60g，售价 25g，需 11 天成熟。', 25),
  ('🌻', '向日葵', 'crop', '夏季作物 · 朝向太阳，招人喜欢 种子 20g，售价 80g，需 8 天成熟。', 80),
  ('🟥', '红叶卷心菜', 'crop', '夏季作物 · 夏季高价作物 种子 100g，售价 260g，需 9 天成熟。', 260),
  ('🌾', '小麦', 'crop', '夏/秋季作物 · 夏秋均可，面粉原料 种子 10g，售价 25g，需 4 天成熟。', 25),
  ('🌺', '罂粟', 'crop', '夏季作物 · 夏季花卉 种子 100g，售价 140g，需 7 天成熟。', 140),
  ('🌼', '夏季亮片', 'crop', '夏季作物 · 夏日限定的亮色小花 种子 50g，售价 90g，需 8 天成熟。', 90),
  ('🎃', '南瓜', 'crop', '秋季作物 · 秋季代表作物，可长成巨型 种子 100g，售价 320g，需 13 天成熟。', 320),
  ('🍆', '茄子', 'crop', '秋季作物 · 成熟后持续结果 种子 20g，售价 60g，需 5 天成熟。', 60),
  ('🍠', '山药', 'crop', '秋季作物 · 秋季根茎作物 种子 60g，售价 160g，需 10 天成熟。', 160),
  ('🔴', '蔓越莓', 'crop', '秋季作物 · 高价种子，多次收获 种子 240g，售价 75g，需 7 天成熟。', 75),
  ('🟣', '甜菜', 'crop', '秋季作物 · 可制糖，秋季短期作物 种子 20g，售价 100g，需 6 天成熟。', 100),
  ('🍂', '苋菜', 'crop', '秋季作物 · 秋季谷物，颜色金黄 种子 70g，售价 150g，需 7 天成熟。', 150),
  ('🍇', '葡萄', 'crop', '秋季作物 · 藤架作物，可酿酒 种子 60g，售价 80g，需 10 天成熟。', 80),
  ('🥗', '朝鲜蓟', 'crop', '秋季作物 · 秋季高价蔬菜 种子 30g，售价 160g，需 8 天成熟。', 160),
  ('🥬', '白菜', 'crop', '秋季作物 · 秋季生长迅速 种子 50g，售价 80g，需 4 天成熟。', 80),
  ('🌹', '玫瑰仙子', 'crop', '秋季作物 · 秋季稀有花卉 种子 100g，售价 290g，需 12 天成熟。', 290),
  ('💎', '甜宝石莓', 'crop', '秋季作物 · 稀有种子，秋日传说 种子 1000g，售价 3000g，需 24 天成熟。', 3000),
  ('🔮', '水晶果', 'crop', '冬季作物 · 冬季野种产物，晶莹剔透 种子 60g，售价 150g，需 7 天成熟。', 150),
  ('🌰', '雪山药', 'crop', '冬季作物 · 雪地里挖出的冬季野种 种子 60g，售价 100g，需 7 天成熟。', 100),
  ('🌸', '番红花', 'crop', '冬季作物 · 寒冬里绽放的小花 种子 60g，售价 80g，需 7 天成熟。', 80),
  ('🌲', '冬青树', 'crop', '冬季作物 · 冬季野种，节日装饰 种子 60g，售价 80g，需 7 天成熟。', 80),
  ('🐟', '鲈鱼', 'fish', '春/夏/秋/冬季可钓 · 鹈鹕河最常见的鱼 售价 30g。', 30),
  ('🎏', '鲤鱼', 'fish', '春/夏/秋/冬季可钓 · 全季可见，性子温吞 售价 30g。', 30),
  ('🐡', '鲶鱼', 'fish', '春/秋/冬季可钓 · 雨天夜里在河里游荡 售价 60g。', 60),
  ('🐠', '沙丁鱼', 'fish', '春/秋/冬季可钓 · 海边成群出没 售价 40g。', 40),
  ('🍥', '虹鳟鱼', 'fish', '夏季可钓 · 夏日溪流里的斑斓身影 售价 50g。', 50),
  ('🎈', '河豚', 'fish', '夏季可钓 · 夏日晴天出海才有 售价 120g。', 120),
  ('🍣', '金枪鱼', 'fish', '夏/冬季可钓 · 力气很大的深海鱼 售价 100g。', 100),
  ('🥓', '鲑鱼', 'fish', '秋季可钓 · 秋季洄游，逆流而上 售价 80g。', 80),
  ('🐯', '虎鳟鱼', 'fish', '秋/冬季可钓 · 秋冬季的河中猎手 售价 110g。', 110),
  ('🐙', '鱿鱼', 'fish', '冬季可钓 · 冬夜海边才能钓到 售价 80g。', 80),
  ('🧊', '冰川鱼', 'fish', '冬季可钓 · 冰钓期限定的稀有鱼 售价 150g。', 150),
  ('🦈', '传说之鱼', 'fish', '春季可钓 · 春季传说，月圆之夜现身 售价 500g。', 500),
  ('🔶', '铜矿石', 'ore', '矿洞浅层最常见 矿洞第 1 层起可挖，售价 25g。', 25),
  ('🔷', '铁矿石', 'ore', '熔炼工具的必需品 矿洞第 1 层起可挖，售价 55g。', 55),
  ('🟪', '紫水晶', 'ore', '中层矿脉的紫色晶体 矿洞第 2 层起可挖，售价 90g。', 90),
  ('🥇', '金矿石', 'ore', '泛着金光的珍贵矿石 矿洞第 3 层起可挖，售价 120g。', 120),
  ('💚', '绿宝石', 'ore', '深层的绿色宝石 矿洞第 3 层起可挖，售价 130g。', 130),
  ('💎', '钻石', 'ore', '矿洞最深处的稀世珍宝 矿洞第 4 层起可挖，售价 400g。', 400),
  ('❤️', '红宝石', 'ore', '炽热如火的红色宝石 矿洞第 5 层起可挖，售价 150g。', 150),
  ('⚙️', '铱矿石', 'ore', '深层稀有矿，价值不菲 矿洞第 6 层起可挖，售价 250g。', 250),
  ('🚿', '铜制洒水壶', 'tool', '浇水提前成熟 15 秒 → 30 秒 售价 180g。', 180),
  ('💧', '优质洒水器', 'tool', '新播种的作物自动浇水 售价 420g。', 420),
  ('🪓', '钢锄头', 'tool', '每次收获额外 +1 作物 售价 260g。', 260),
  ('🎣', '玻璃纤维钓竿', 'tool', '钓鱼成功率 78% → 93%，稀有鱼权重提升 售价 300g。', 300),
  ('⛏️', '钢镐子', 'tool', '挖矿稀有矿石概率提升 售价 280g。', 280),
  ('👒', '稻草人', 'upgrade', '换季时保护地里作物不枯萎 售价 180g。', 180),
  ('🏡', '温室', 'upgrade', '任意季节可购买 / 种植全部作物 售价 2500g。', 2500),
  ('🎒', '大背包', 'upgrade', '仓库容量 60 → 120 格 售价 600g。', 600),
  ('🍳', '煎蛋', 'food', '立即恢复 6 点体力 售价 60g。', 60),
  ('🍞', '面包', 'food', '立即恢复 10 点体力 售价 90g。', 90),
  ('🥗', '沙拉', 'food', '立即恢复 12 点体力 售价 110g。', 110),
  ('☕', '咖啡', 'food', '立即恢复 15 点体力 售价 150g。', 150),
  ('🍲', '南瓜汤', 'food', '立即恢复 20 点体力 售价 200g。', 200),
  ('🛢️', '木桶', 'furniture', '农场装饰 · 可用于酿酒 售价 120g。', 120),
  ('🪴', '花盆', 'furniture', '农场装饰 · 可摆放作物 售价 80g。', 80),
  ('🔥', '火把', 'furniture', '照亮夜晚的农场 售价 50g。', 50),
  ('📺', '电视机', 'furniture', '每天收看天气预报与烹饪节目 售价 350g。', 350),
  ('🪵', '木栅栏', 'furniture', '围出整齐的田地 售价 40g。', 40),
  ('🐔', '小鸡', 'animal', '牧场伙伴 · 每天产蛋 售价 400g。', 400),
  ('🦆', '鸭子', 'animal', '牧场伙伴 · 偶尔产鸭蛋 售价 600g。', 600),
  ('🐄', '奶牛', 'animal', '牧场伙伴 · 每天产牛奶 售价 800g。', 800),
  ('🐑', '绵羊', 'animal', '牧场伙伴 · 定期产羊毛 售价 1200g。', 1200),
  ('⭐', '星之果实', 'special', '传说收藏品 · 星露谷的纪念 售价 5000g。', 5000),
  ('🌀', '传送图腾', 'special', '农场纪念品 · 可摆放在客厅 售价 300g。', 300),
  ('🐔', '鸡', 'animal', '每天产蛋，金色母鸡更珍贵。', 8),
  ('🐑', '羊', 'animal', '产出羊毛，梳毛后制成布料。', 10),
  ('🐖', '猪', 'animal', '松露猎手，林间觅得松露。', 11),
  ('🐎', '马', 'animal', '牧场好伙伴，提升移动速度。', 12),
  ('👧', '阿比盖尔', 'villager', '鹈鹕镇少女，热爱矿物与冒险。', 13),
  ('🧔', '塞巴斯蒂安', 'villager', '镇上的程序员，钟爱雨天。', 14),
  ('👵', '艾芙琳', 'villager', '和蔼的祖母，擅长烘焙。', 15),
  ('🧑‍🌾', '镇长刘易斯', 'villager', '鹈鹕镇镇长，关心小镇发展。', 16);

UPDATE `item` i
  JOIN `tmp_codex_items` t ON i.`name` = t.`name`
   SET i.`icon` = t.`icon`,
       i.`cat` = t.`cat`,
       i.`description` = t.`description`,
       i.`sort_order` = t.`sort_order`,
       i.`enabled` = 1;

INSERT INTO `item` (`icon`, `name`, `cat`, `description`, `sort_order`, `enabled`)
SELECT t.`icon`, t.`name`, t.`cat`, t.`description`, t.`sort_order`, 1
  FROM `tmp_codex_items` t
 WHERE NOT EXISTS (SELECT 1 FROM `item` i WHERE i.`name` = t.`name`);

DROP TEMPORARY TABLE `tmp_codex_items`;

UPDATE `bundle`
   SET `need` = REPLACE(`need`, '"虹鳟"', '"虹鳟鱼"')
 WHERE `need` LIKE '%"虹鳟"%'
   AND `need` NOT LIKE '%"虹鳟鱼"%';

-- ============================================================
-- 社区中心收集包表（首页「社区中心」模块数据，后台可管理）
-- need 列以 JSON 数组保存所需物品名，如 ["草莓","樱桃"]
-- ============================================================
CREATE TABLE IF NOT EXISTS `bundle` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `icon`        VARCHAR(16)  NOT NULL                COMMENT '图标（emoji）',
    `title`       VARCHAR(64)  NOT NULL                COMMENT '收集包名称',
    `description` VARCHAR(255) DEFAULT ''              COMMENT '描述（首页卡片展示文案）',
    `need`        TEXT         NOT NULL                COMMENT '所需物品名，JSON 数组',
    `sort_order`  INT          NOT NULL DEFAULT 999    COMMENT '排序值，越小越靠前',
    `enabled`     TINYINT      NOT NULL DEFAULT 1      COMMENT '是否启用：1-首页可见 0-隐藏',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_sort` (`sort_order`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '社区中心收集包表';

-- 导入首页原有静态收集包数据（幂等：仅在表为空时插入）
INSERT INTO `bundle` (`icon`, `title`, `description`, `need`, `sort_order`, `enabled`)
SELECT t.`icon`, t.`title`, t.`description`, t.`need`, t.`sort_order`, 1
FROM (
    SELECT '🌸' AS `icon`, '春之收获包' AS `title`, '献上春季的馈赠，唤醒沉睡的社区中心。' AS `description`, '["草莓","樱桃"]' AS `need`, 1 AS `sort_order`
    UNION ALL SELECT '☀️', '夏之盛宴包', '夏日丰饶，果蔬满仓。', '["蓝莓","啤酒花","玉米"]', 2
    UNION ALL SELECT '🍂', '秋之丰收包', '金秋时节，谷仓飘香。', '["南瓜","远古水果"]', 3
    UNION ALL SELECT '🐮', '牧场情谊包', '来自动物们的温柔陪伴。', '["鸡","奶牛","羊"]', 4
    UNION ALL SELECT '🎣', '深海渔获包', '江河湖海的礼物。', '["鲈鱼","虹鳟鱼","鲶鱼","传说之鱼"]', 5
    UNION ALL SELECT '💎', '矿洞宝藏包', '地心深处闪耀的珍宝。', '["铜矿石","铁矿石","金矿石","钻石"]', 6
) AS t
WHERE NOT EXISTS (SELECT 1 FROM `bundle`);

-- ============================================================
-- user 表补充 status 列（账号状态控制：1-正常 0-禁用）
-- 放在脚本最后：重复执行会报 Duplicate column name 'status'，属预期行为可忽略
-- ============================================================
ALTER TABLE `user`
    ADD COLUMN `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1-正常 0-禁用' AFTER `role`;

-- ============================================================
-- user_progress 表补充 gameplay 列（三大玩法状态：农场 / 钓鱼 / 挖矿 / 金币 / 体力）
-- 放在脚本最后，重复执行报 Duplicate column 属预期行为
-- ============================================================
ALTER TABLE `user_progress`
    ADD COLUMN `gameplay` TEXT NULL COMMENT '玩法状态 JSON：农场地块 / 钓鱼 / 挖矿 / 金币 / 体力';

-- ============================================================
-- item 表补充商品化字段：图片 / 价格 / 库存
-- 重复执行报 Duplicate column 属预期行为（mysql --force 可容忍）
-- ============================================================
ALTER TABLE `item`
    ADD COLUMN `image` VARCHAR(255) DEFAULT NULL COMMENT '商品图片URL（可空，空则用 icon 展示）' AFTER `description`;
ALTER TABLE `item`
    ADD COLUMN `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '商品价格（金币 g）' AFTER `image`;
ALTER TABLE `item`
    ADD COLUMN `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量，-1 表示不限量' AFTER `price`;

-- ============================================================
-- 主页配置表（单行 JSON 配置）：轮播图 / 文案 / 推荐商品 / 分类展示
-- 后台「主页管理」编辑，主页展示端通过 /api/home/config 读取
-- ============================================================
CREATE TABLE IF NOT EXISTS `home_config` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `config_key`   VARCHAR(64)  NOT NULL                COMMENT '配置标识，固定为 main',
    `welcome_text` VARCHAR(255) NOT NULL DEFAULT ''      COMMENT '首页欢迎文案',
    `slides`       JSON         DEFAULT NULL            COMMENT '轮播图：[{image,title,subtitle,link}]',
    `featured_ids` JSON         DEFAULT NULL            COMMENT '推荐商品：item id 数组',
    `categories`   JSON         DEFAULT NULL            COMMENT '分类展示：[{key,label,enabled,sortOrder}]',
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '主页展示配置表';

-- 幂等插入默认配置（仅在表为空时）
INSERT INTO `home_config`
    (`config_key`, `welcome_text`, `slides`, `featured_ids`, `categories`)
SELECT
    'main',
    '欢迎来到星露谷，<b>尊敬的农夫</b>！今天也要努力种田哦～ 🌞',
    JSON_ARRAY(
        JSON_OBJECT('image', '', 'title', '🌾 欢迎来到星露谷', 'subtitle', '种田 · 钓鱼 · 挖矿 · 结交村民，开启你的农场生活', 'link', ''),
        JSON_OBJECT('image', '', 'title', '🌸 四季轮转', 'subtitle', '按真实日历开放当季作物与钓期', 'link', ''),
        JSON_OBJECT('image', '', 'title', '🏠 重建社区中心', 'subtitle', '收集捐赠包，唤醒沉睡的鹈鹕镇', 'link', '')
    ),
    JSON_ARRAY(),
    JSON_ARRAY(
        JSON_OBJECT('key', 'crop', 'label', '作物', 'enabled', 1, 'sortOrder', 1),
        JSON_OBJECT('key', 'animal', 'label', '动物', 'enabled', 1, 'sortOrder', 2),
        JSON_OBJECT('key', 'fish', 'label', '钓鱼', 'enabled', 1, 'sortOrder', 3),
        JSON_OBJECT('key', 'ore', 'label', '矿石', 'enabled', 1, 'sortOrder', 4),
        JSON_OBJECT('key', 'tool', 'label', '工具', 'enabled', 1, 'sortOrder', 5),
        JSON_OBJECT('key', 'upgrade', 'label', '农场升级', 'enabled', 1, 'sortOrder', 6),
        JSON_OBJECT('key', 'food', 'label', '食物', 'enabled', 1, 'sortOrder', 7),
        JSON_OBJECT('key', 'furniture', 'label', '家具', 'enabled', 1, 'sortOrder', 8),
        JSON_OBJECT('key', 'special', 'label', '特殊', 'enabled', 1, 'sortOrder', 9)
    )
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `home_config`);

-- 玩家金币变更操作日志：记录每一笔管理员金币调整，便于审计追踪
CREATE TABLE IF NOT EXISTS `coin_log` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `account`       VARCHAR(64)  NOT NULL                COMMENT '目标玩家账号',
    `farmer_name`   VARCHAR(64)  NOT NULL DEFAULT ''      COMMENT '目标玩家农夫名（冗余，便于审计）',
    `operator`      VARCHAR(64)  NOT NULL                COMMENT '操作管理员账号',
    `mode`          VARCHAR(16)  NOT NULL                COMMENT '调整模式：delta-增减 / target-目标值',
    `change_value`  BIGINT       NOT NULL                COMMENT '输入值：delta 时为增减量，target 时为目标金币数',
    `before_gold`   BIGINT       NOT NULL                COMMENT '变更前的金币余额',
    `after_gold`    BIGINT       NOT NULL                COMMENT '变更后的金币余额',
    `diff`          BIGINT       NOT NULL                COMMENT '实际变动量 = after - before',
    `reason`        VARCHAR(255) NOT NULL DEFAULT ''      COMMENT '修改原因（必填）',
    `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_account` (`account`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '玩家金币变更操作日志表';
