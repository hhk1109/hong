-- 小黄人登录/注册系统建库建表脚本
-- 执行：mysql -uroot -p123456 < schema.sql

CREATE DATABASE IF NOT EXISTS minion_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE minion_db;

CREATE TABLE IF NOT EXISTS `user` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`   VARCHAR(13)  NOT NULL                COMMENT '账号（11~13位数字）',
  `password`   VARCHAR(100) NOT NULL                COMMENT '密码（BCrypt哈希）',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '小黄人用户表';
