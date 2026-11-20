package com.fenglin.springboottest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 主页配置的结构化 VO，作为管理端保存请求与展示端返回的统一结构。
 * 轮播图 / 推荐商品 / 分类展示均以对象数组表达，Service 层负责与 JSON 列互转。
 */
public class HomeConfigVO {

    /** 首页欢迎文案（允许简单 HTML，如 <b>） */
    @Size(max = 255, message = "欢迎文案过长")
    private String welcomeText;

    /** 轮播图列表 */
    @Valid
    private List<Slide> slides;

    /** 推荐商品 item id 列表 */
    private List<Long> featuredIds;

    /** 分类展示列表 */
    @Valid
    private List<Category> categories;

    private String updateTime;

    public String getWelcomeText() {
        return welcomeText;
    }

    public void setWelcomeText(String welcomeText) {
        this.welcomeText = welcomeText;
    }

    public List<Slide> getSlides() {
        return slides;
    }

    public void setSlides(List<Slide> slides) {
        this.slides = slides;
    }

    public List<Long> getFeaturedIds() {
        return featuredIds;
    }

    public void setFeaturedIds(List<Long> featuredIds) {
        this.featuredIds = featuredIds;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    /** 轮播图条目 */
    public static class Slide {
        private String image;
        private String title;
        private String subtitle;
        private String link;

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSubtitle() {
            return subtitle;
        }

        public void setSubtitle(String subtitle) {
            this.subtitle = subtitle;
        }

        public String getLink() {
            return link;
        }

        public void setLink(String link) {
            this.link = link;
        }
    }

    /** 分类展示条目 */
    public static class Category {
        private String key;
        private String label;
        private Boolean enabled;
        private Integer sortOrder;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }
}
