package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.dto.UserVO;
import com.fenglin.springboottest.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口，对应前端 /api/auth/login 与 /api/auth/register
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 登录
     * 请求体：{ "account": "农夫名或邮箱", "password": "密码" }
     * 返回：{ "code": 200, "data": { farmerName, ... }, "message": "ok" }
     */
    @PostMapping("/login")
    public Result<UserVO> login(@Valid @RequestBody LoginRequest req) {
        UserVO vo = userService.login(req);
        return Result.success(vo, "登录成功，欢迎回到星露谷！");
    }

    /**
     * 注册
     * 请求体：{ "farmerName", "farmName", "email", "animal", "password" }
     */
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest req) {
        userService.register(req);
        return Result.success(null, "注册成功，去登录吧～");
    }
}
