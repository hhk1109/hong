package com.fenglin.springboottest.dto;

/**
 * 返回给前端的用户信息（不包含密码）
 * 前端登录成功后读取 data.farmerName
 */
public class UserVO {

    private Long id;
    private String account;
    private String farmerName;
    private String farmName;
    private String email;
    private String animal;

    public static UserVO fromEntity(com.fenglin.springboottest.entity.User u) {
        UserVO vo = new UserVO();
        vo.setId(u.getId());
        vo.setAccount(u.getAccount());
        vo.setFarmerName(u.getFarmerName());
        vo.setFarmName(u.getFarmName());
        vo.setEmail(u.getEmail());
        vo.setAnimal(u.getAnimal());
        return vo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

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
}
