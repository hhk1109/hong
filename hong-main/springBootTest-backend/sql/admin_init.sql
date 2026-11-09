-- ============================================================
-- 星露谷 · 后台管理系统数据库初始化脚本
-- 数据库：stardew（复用现有库）
-- 说明：初始化 item（首页展示条目）、bundle（社区中心收集包）表并导入数据，
--       并为 user 表补充 status（账号状态）列。
--       后台管理员身份已并入 user 表（role=0 即为管理员），
--       默认管理员（admin / admin123）由后端首次启动时自动创建，无需本脚本维护。
-- 执行方式（本地 MySQL，root / 123456）：
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 < admin_init.sql
-- 注意：末尾 ALTER 语句重复执行会报 Duplicate column（可忽略，不影响其他语句），
--       因此放在脚本最后。
-- ============================================================

USE `stardew`;

-- 首页展示条目表（作物 / 动物 / 村民图鉴）
CREATE TABLE IF NOT EXISTS `item` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `icon`        VARCHAR(16)  NOT NULL                COMMENT '图标（emoji）',
    `name`        VARCHAR(64)  NOT NULL                COMMENT '名称',
    `cat`         VARCHAR(16)  NOT NULL                COMMENT '分类：crop-作物 animal-动物 villager-村民',
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
SELECT '🐠', '虹鳟', 'fish', '色彩斑斓的鳟鱼，在山间溪流中出没。', 65, 1
WHERE NOT EXISTS (SELECT 1 FROM `item` WHERE `name` = '虹鳟');
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
    UNION ALL SELECT '🎣', '深海渔获包', '江河湖海的礼物。', '["鲈鱼","虹鳟","鲶鱼","传说之鱼"]', 5
    UNION ALL SELECT '💎', '矿洞宝藏包', '地心深处闪耀的珍宝。', '["铜矿石","铁矿石","金矿石","钻石"]', 6
) AS t
WHERE NOT EXISTS (SELECT 1 FROM `bundle`);

-- ============================================================
-- user 表补充 status 列（账号状态控制：1-正常 0-禁用）
-- 放在脚本最后：重复执行会报 Duplicate column name 'status'，属预期行为可忽略
-- ============================================================
ALTER TABLE `user`
    ADD COLUMN `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1-正常 0-禁用' AFTER `role`;
