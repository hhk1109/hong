package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 收集包新增 / 编辑请求体
 */
public class BundleRequest {

    /** 图标（emoji） */
    @NotBlank(message = "图标不能为空")
    @Size(max = 8, message = "图标过长")
    private String icon;

    /** 收集包名称 */
    @NotBlank(message = "名称不能为空")
    @Size(max = 64, message = "名称过长")
    private String title;

    /** 描述 */
    @Size(max = 255, message = "描述过长")
    private String description;

    /** 所需物品名列表 */
    @NotEmpty(message = "所需物品不能为空")
    private List<String> need;

    /** 排序值（越小越靠前） */
    private Integer sortOrder;

    /** 是否启用：1-首页可见 0-隐藏 */
    private Integer enabled;

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getNeed() {
        return need;
    }

    public void setNeed(List<String> need) {
        this.need = need;
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
