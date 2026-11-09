package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.Size;
import java.io.Serializable;

/**
 * 后台用户编辑请求体（密码可选，填写则重置）
 */
public class UserAdminRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 农夫名 */
    @Size(max = 64, message = "农夫名过长")
    private String farmerName;

    /** 农场名 */
    @Size(max = 64, message = "农场名过长")
    private String farmName;

    /** 邮箱 */
    @Size(max = 128, message = "邮箱过长")
    private String email;

    /** 宠物 / 动物 */
    @Size(max = 64, message = "宠物过长")
    private String animal;

    /** 权限：0-管理员，1-普通用户 */
    private Integer role;

    /** 账号状态：1-正常 0-禁用 */
    private Integer status;

    /** 重置密码（为空表示不修改） */
    @Size(min = 6, max = 32, message = "密码长度需在 6-32 位之间")
    private String password;

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAnimal() {
        return animal;
    }

    public void setAnimal(String animal) {
        this.animal = animal;
    }

    public Integer getRole() {
        return role;
    }

    public void setRole(Integer role) {
        this.role = role;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
