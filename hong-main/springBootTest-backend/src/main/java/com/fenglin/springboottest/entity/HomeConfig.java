package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 主页展示配置实体，对应数据库 home_config 表。
 * slides / featuredIds / categories 以 JSON 字符串存储，
 * 由 HomeConfigService 负责与结构化 VO 互转。
 */
@TableName("home_config")
public class HomeConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 配置标识，固定为 main */
    private String configKey;

    /** 首页欢迎文案 */
    private String welcomeText;

    /** 轮播图 JSON：[{image,title,subtitle,link}] */
    private String slides;

    /** 推荐商品 item id 数组 JSON */
    private String featuredIds;

    /** 分类展示 JSON：[{key,label,enabled,sortOrder}] */
    private String categories;

    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getWelcomeText() {
        return welcomeText;
    }

    public void setWelcomeText(String welcomeText) {
        this.welcomeText = welcomeText;
    }

    public String getSlides() {
        return slides;
    }

    public void setSlides(String slides) {
        this.slides = slides;
    }

    public String getFeaturedIds() {
        return featuredIds;
    }

    public void setFeaturedIds(String featuredIds) {
        this.featuredIds = featuredIds;
    }

    public String getCategories() {
        return categories;
    }

    public void setCategories(String categories) {
        this.categories = categories;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
