-- ============================================================
-- 星露谷 · 后台管理系统数据库初始化脚本
-- 数据库：stardew（复用现有库）
-- 说明：新增 admin_user（管理员）与 item（首页展示条目）两张表，
--       并把首页原有 16 条静态展示数据导入 item 表。
-- 执行方式（本地 MySQL，root / 123456）：
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 < admin_init.sql
-- 默认管理员账号在应用首次启动时由后端自动创建：admin / admin123
-- ============================================================

USE `stardew`;

-- 管理员表（后台登录使用，无注册功能）
CREATE TABLE IF NOT EXISTS `admin_user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username`    VARCHAR(64)  NOT NULL                COMMENT '管理员账号',
    `password`    VARCHAR(100) NOT NULL                COMMENT '密码，BCrypt 加密存储',
    `nickname`    VARCHAR(64)  DEFAULT NULL            COMMENT '显示昵称',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '后台管理员表';

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
    UNION ALL SELECT '🫐', '蓝莓', 'crop', '夏季作物，产量高，制作果酱一流。', 2
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
