-- ============================================================================
--  小黄人登录/注册系统 —— 建库建表脚本
--  配套后端：D:\workSpace\springBootTest（Spring Boot 3.4.5 + MyBatis-Plus 3.5.7）
--
--  执行方式（两种都可以）：
--    1) 命令行：
--       "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p123456 --default-character-set=utf8mb4 < minion_db.sql
--    2) IDEA：Database 面板 -> 右键 -> Run SQL Script，选中本文件
--
--  脚本可重复执行：库和表都带 IF NOT EXISTS / DROP IF EXISTS。
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `minion_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `minion_db`;

-- ----------------------------------------------------------------------------
--  用户表
--  账号：11~13 位数字（和前端输入框的限制一致）
--  密码：只存 BCrypt 哈希，永远不存明文
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `minion_user`;

CREATE TABLE `minion_user` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT           COMMENT '主键',
    `username`   VARCHAR(13)  NOT NULL                          COMMENT '账号，11~13 位数字',
    `password`   VARCHAR(100) NOT NULL                          COMMENT '密码（BCrypt 哈希，60 位左右）',
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_minion_user_username` (`username`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '小黄人用户表';

-- ----------------------------------------------------------------------------
--  测试账号（方便一上来就能登录，不用先注册）
--
--    账号：13800000000
--    密码：123456
--
--  下面这串哈希就是 "123456" 的 BCrypt 值（每次随机加盐，所以和你自己算出来的
--  一定不一样，但都能校验通过）。想换密码就用项目里的小工具重新生成：
--    java -cp "target/classes;target/cp.txt" com.fenglin.springboottest.util.PasswordHashTool 你的新密码
-- ----------------------------------------------------------------------------
INSERT INTO `minion_user` (`username`, `password`)
VALUES ('13800000000', '$2a$10$A7nJDSjPrO6r8DDzxCW40uKVPxqKWUnlYMBXhpF2Pl6xOxRtDDFiq');

-- ----------------------------------------------------------------------------
--  验一验
-- ----------------------------------------------------------------------------
SELECT `id`, `username`, LEFT(`password`, 7) AS `password_prefix`, `created_at`
FROM `minion_user`;
