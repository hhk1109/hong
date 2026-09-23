package com.minion.controller;

import com.minion.common.Result;
import com.minion.dto.LoginRequest;
import com.minion.dto.RegisterRequest;
import com.minion.entity.User;
import com.minion.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 认证接口
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 注册 */
    @PostMapping("/register")
    public Result<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        return Result.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername()
        ));
    }

    /** 登录 */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        return Result.ok(authService.login(req));
    }
}
