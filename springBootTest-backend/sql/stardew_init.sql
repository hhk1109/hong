-- ============================================================
-- 星露谷登录系统 · 数据库初始化脚本
-- 数据库：stardew
-- 说明：配合 springBootTest 后端（MyBatis-Plus）使用
-- 执行方式（本地 MySQL，root / 123456）：
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 < stardew_init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `stardew`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE `stardew`;

-- 用户表（前端登录 / 注册使用）
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `account`     VARCHAR(64)  NOT NULL                COMMENT '登录账号（注册时默认等于农夫名）',
    `password`    VARCHAR(100) NOT NULL                COMMENT '密码，BCrypt 加密存储',
    `farmer_name` VARCHAR(64)  NOT NULL                COMMENT '农夫名',
    `farm_name`   VARCHAR(64)  DEFAULT NULL            COMMENT '农场名',
    `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
    `animal`      VARCHAR(64)  DEFAULT NULL            COMMENT '宠物 / 动物',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_account` (`account`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '星露谷用户表';

-- （可选）插入一条测试数据，密码 123456 的 BCrypt 哈希
-- 如需测试登录，可取消下面两行注释后执行：
-- INSERT INTO `user` (`account`, `password`, `farmer_name`, `farm_name`, `email`, `animal`)
-- VALUES ('link', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqoH6F5lOZ0b8z9B1kF1wQZ1wQZ1wQ', 'Link', '鹈鹕镇农场', 'link@stardew.test', 'dog');
