package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户游戏进度实体，对应数据库 user_progress 表
 * 按登录账号（account）维度保存背包与社区中心收集包进度（JSON 字符串）
 */
@TableName("user_progress")
public class UserProgress implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户登录账号（唯一，对应 user.account） */
    private String account;

    /** 背包：JSON 字符串，格式 {"物品名": 数量} */
    private String bag;

    /** 社区中心收集包：JSON 字符串，格式 {"bundleId": ["物品名", ...]} */
    private String bundles;

    /** 三大玩法状态：JSON 字符串（农场地块 / 钓鱼 / 挖矿 / 金币 / 体力） */
    private String gameplay;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
    public String getBag() { return bag; }
    public void setBag(String bag) { this.bag = bag; }
    public String getBundles() { return bundles; }
    public void setBundles(String bundles) { this.bundles = bundles; }
    public String getGameplay() { return gameplay; }
    public void setGameplay(String gameplay) { this.gameplay = gameplay; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
