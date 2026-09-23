package com.minion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 注册请求
 * 账号：11~13 位数字；密码：11 位以内
 */
public class RegisterRequest {

    @NotBlank(message = "请输入账号")
    @Pattern(regexp = "^\\d{11,13}$", message = "账号必须为 11~13 位数字")
    private String username;

    @NotBlank(message = "请输入密码")
    @Size(max = 11, message = "密码不能超过 11 位")
    private String password;

    /** 服务端验证码 id（/api/captcha 返回） */
    @NotBlank(message = "请输入验证码")
    private String captchaId;

    @NotBlank(message = "请输入验证码")
    @Pattern(regexp = "^[A-Za-z0-9]{4}$", message = "验证码格式不正确")
    private String captcha;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCaptchaId() {
        return captchaId;
    }

    public void setCaptchaId(String captchaId) {
        this.captchaId = captchaId;
    }

    public String getCaptcha() {
        return captcha;
    }

    public void setCaptcha(String captcha) {
        this.captcha = captcha;
    }
}
