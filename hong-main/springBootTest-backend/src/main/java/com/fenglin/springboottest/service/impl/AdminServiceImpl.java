package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.AdminLoginRequest;
import com.fenglin.springboottest.entity.AdminUser;
import com.fenglin.springboottest.mapper.AdminUserMapper;
import com.fenglin.springboottest.service.AdminService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 管理员服务实现：
 * 1. 首次启动自动初始化默认管理员（admin / admin123）
 * 2. 登录签发简单内存令牌（有效期 2 小时，访问自动续期），供拦截器校验
 */
@Service
public class AdminServiceImpl implements AdminService, ApplicationRunner {

    /** 令牌有效期（毫秒）：2 小时 */
    private static final long TOKEN_TTL_MS = 2 * 60 * 60 * 1000L;

    /** 默认管理员账号（首次启动自动创建） */
    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin123";

    @Autowired
    private AdminUserMapper adminUserMapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** token -> 过期时间戳（毫秒） */
    private final Map<String, Long> tokenExpiry = new ConcurrentHashMap<>();

    /** token -> 管理员账号 */
    private final Map<String, String> tokenUser = new ConcurrentHashMap<>();

    @Override
    public void run(ApplicationArguments args) {
        Long cnt = adminUserMapper.selectCount(
                Wrappers.<AdminUser>lambdaQuery().eq(AdminUser::getUsername, DEFAULT_USERNAME));
        if (cnt == null || cnt == 0) {
            AdminUser admin = new AdminUser();
            admin.setUsername(DEFAULT_USERNAME);
            admin.setPassword(encoder.encode(DEFAULT_PASSWORD));
            admin.setNickname("镇长");
            adminUserMapper.insert(admin);
        }
    }

    @Override
    public String login(AdminLoginRequest req) {
        AdminUser admin = adminUserMapper.selectOne(
                Wrappers.<AdminUser>lambdaQuery().eq(AdminUser::getUsername, req.getUsername()));
        if (admin == null) {
            throw new BizException(401, "管理员账号不存在");
        }
        if (!encoder.matches(req.getPassword(), admin.getPassword())) {
            throw new BizException(401, "密码错误");
        }
        // 同一管理员重复登录时签发新令牌（旧令牌保留至自然过期）
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenExpiry.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MS);
        tokenUser.put(token, admin.getUsername());
        return token;
    }

    @Override
    public String validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        Long expiry = tokenExpiry.get(token);
        if (expiry == null) {
            return null;
        }
        if (Instant.now().toEpochMilli() > expiry) {
            tokenExpiry.remove(token);
            tokenUser.remove(token);
            return null;
        }
        // 访问即续期
        tokenExpiry.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MS);
        return tokenUser.get(token);
    }

    @Override
    public void logout(String token) {
        if (token != null) {
            tokenExpiry.remove(token);
            tokenUser.remove(token);
        }
    }
}
