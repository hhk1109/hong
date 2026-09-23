package com.minion.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.minion.common.BizException;
import com.minion.dto.LoginRequest;
import com.minion.dto.RegisterRequest;
import com.minion.entity.User;
import com.minion.mapper.UserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 认证服务：注册 / 登录（均需通过服务端图形验证码校验）
 */
@Service
public class AuthService {

    private final UserMapper userMapper;
    private final CaptchaStore captchaStore;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserMapper userMapper, CaptchaStore captchaStore) {
        this.userMapper = userMapper;
        this.captchaStore = captchaStore;
    }

    /**
     * 注册：验证码校验 + 账号唯一性校验 + BCrypt 加密入库
     */
    public User register(RegisterRequest req) {
        verifyCaptcha(req.getCaptchaId(), req.getCaptcha());

        String username = req.getUsername().trim();

        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (count != null && count > 0) {
            throw new BizException("该账号已被注册，请直接登录 🍌");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userMapper.insert(user);
        return user;
    }

    /**
     * 登录：验证码校验 + 账号存在 + BCrypt 密码匹配
     */
    public Map<String, Object> login(LoginRequest req) {
        verifyCaptcha(req.getCaptchaId(), req.getCaptcha());

        String username = req.getUsername().trim();

        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BizException("账号或密码不正确 🍌");
        }

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername()
        );
    }

    /** 验证码一次性校验，不通过直接拒绝 */
    private void verifyCaptcha(String captchaId, String captcha) {
        if (!captchaStore.verify(captchaId, captcha)) {
            throw new BizException("验证码不正确或已过期，请重新输入 🍌");
        }
    }
}
