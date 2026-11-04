package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 后台物品新增 / 编辑请求
 */
public class ItemRequest {

    @NotBlank(message = "图标不能为空")
    @Size(max = 16, message = "图标过长")
    private String icon;

    @NotBlank(message = "名称不能为空")
    @Size(max = 64, message = "名称过长")
    private String name;

    @NotBlank(message = "分类不能为空")
    @Pattern(regexp = "crop|animal|villager|fish|ore", message = "分类只能是 crop / animal / villager / fish / ore")
    private String cat;

    @Size(max = 255, message = "描述过长")
    private String description;

    private Integer sortOrder;

    /** 可选：启用状态，1-显示 0-隐藏，为空默认 1 */
    private Integer enabled;

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCat() {
        return cat;
    }

    public void setCat(String cat) {
        this.cat = cat;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Integer getEnabled() {
        return enabled;
    }

    public void setEnabled(Integer enabled) {
        this.enabled = enabled;
    }
}
