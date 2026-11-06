package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.AdminLoginRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.AdminService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

/**
 * 后台管理认证实现：
 * 1. 后台管理员即 user 表中 role=0 的账号（权限约定：0-管理员，1-普通用户）
 * 2. 首次启动若库中无 role=0 账号，则创建默认管理员 admin / admin123（明文）
 * 3. 登录签发简单内存令牌（有效期 2 小时，访问自动续期），供拦截器校验
 * 说明：密码按需求以明文存储与比对，不做加密处理。
 */
@Service
public class AdminServiceImpl implements AdminService, ApplicationRunner {

    /** 令牌有效期（毫秒）：2 小时 */
    private static final long TOKEN_TTL_MS = 2 * 60 * 60 * 1000L;

    /** 默认管理员账号（首次启动自动创建，role=0） */
    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin123";

    @Autowired
    private UserMapper userMapper;

    /** token -> 过期时间戳（毫秒） */
    private final Map<String, Long> tokenExpiry = new ConcurrentHashMap<>();

    /** token -> 管理员账号 */
    private final Map<String, String> tokenUser = new ConcurrentHashMap<>();

    @Override
    public void run(ApplicationArguments args) {
        // 确保系统中至少存在一个管理员（role=0）
        Long adminCnt = userMapper.selectCount(
                Wrappers.<User>lambdaQuery().eq(User::getRole, 0));
        if (adminCnt == null || adminCnt == 0) {
            User admin = new User();
            admin.setAccount(DEFAULT_USERNAME);
            admin.setFarmerName("镇长");
            admin.setFarmName("星露谷管理农场");
            admin.setEmail("admin@stardew.test");
            admin.setAnimal("🐱");
            admin.setPassword(DEFAULT_PASSWORD); // 明文
            admin.setRole(0);                    // 管理员
            userMapper.insert(admin);
        }
    }

    @Override
    public String login(AdminLoginRequest req) {
        // 后台登录使用 user 表，且要求该账号 role=0（管理员）
        User user = userMapper.selectOne(
                Wrappers.<User>lambdaQuery().eq(User::getAccount, req.getUsername()));
        if (user == null) {
            throw new BizException(401, "账号不存在");
        }
        if (user.getRole() == null || user.getRole() != 0) {
            throw new BizException(403, "该账号不是管理员，无权限访问后台");
        }
        // 明文比对（需求约定不加密）
        if (!req.getPassword().equals(user.getPassword())) {
            throw new BizException(401, "密码错误");
        }
        // 同一管理员重复登录时签发新令牌（旧令牌保留至自然过期）
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenExpiry.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MS);
        tokenUser.put(token, user.getAccount());
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
