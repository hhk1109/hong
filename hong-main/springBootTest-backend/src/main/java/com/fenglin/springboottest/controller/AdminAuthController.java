package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.AdminLoginRequest;
import com.fenglin.springboottest.service.AdminService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台管理员认证接口（仅登录 + 登出，无注册）
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;

    /**
     * 管理员登录
     * 请求体：{ "username": "admin", "password": "admin123" }
     * 返回：{ code:200, data:{ token, username }, message }
     */
    @PostMapping("/login")
    public Result<Map<String, String>> login(@Valid @RequestBody AdminLoginRequest req) {
        String token = adminService.login(req);
        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        data.put("username", req.getUsername());
        return Result.success(data, "登录成功，欢迎回到后台管理处！");
    }

    /**
     * 登出（令牌失效）
     */
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        adminService.logout(token);
        return Result.success(null, "已退出后台管理");
    }
}
