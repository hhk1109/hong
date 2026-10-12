package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 登录请求：对应前端 POST /api/auth/login  { account, password }
 */
public class LoginRequest {

    /** 登录账号（农夫名或邮箱） */
    @NotBlank(message = "账号不能为空")
    private String account;

    @NotBlank(message = "密码不能为空")
    private String password;

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
