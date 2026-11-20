package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

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
    @Pattern(regexp = "crop|animal|villager|fish|ore|tool|upgrade|food|furniture|special",
            message = "分类只能是 crop / animal / villager / fish / ore / tool / upgrade / food / furniture / special")
    private String cat;

    @Size(max = 255, message = "描述过长")
    private String description;

    /** 商品图片URL，可空 */
    @Size(max = 255, message = "图片地址过长")
    private String image;

    /** 商品价格，>=0 */
    @DecimalMin(value = "0", message = "价格不能为负数")
    private BigDecimal price;

    /** 库存数量，>=-1（-1 表示不限量） */
    @Min(value = -1, message = "库存不能小于 -1")
    private Integer stock;

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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
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
