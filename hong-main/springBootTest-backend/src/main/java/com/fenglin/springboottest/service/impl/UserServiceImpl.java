package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.dto.UserVO;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.UserService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 用户业务实现
 * 说明：密码按需求以明文存储，不做加密处理。
 *       登录签发简单内存令牌（有效期 2 小时，访问自动续期），供进度接口校验。
 */
@Service
public class UserServiceImpl implements UserService {

    /** 令牌有效期（毫秒）：2 小时 */
    private static final long TOKEN_TTL_MS = 2 * 60 * 60 * 1000L;

    @Autowired
    private UserMapper userMapper;

    /** token -> 过期时间戳（毫秒） */
    private final Map<String, Long> tokenExpiry = new ConcurrentHashMap<>();

    /** token -> 账号 */
    private final Map<String, String> tokenAccount = new ConcurrentHashMap<>();

    @Override
    public UserVO login(LoginRequest req) {
        // 前端登录用 account，允许使用 农夫名 或 邮箱 登录
        User user = userMapper.selectOne(
                Wrappers.<User>lambdaQuery()
                        .eq(User::getAccount, req.getAccount())
                        .or()
                        .eq(User::getEmail, req.getAccount())
        );
        if (user == null) {
            throw new BizException(401, "账号不存在");
        }
        // 明文比对（需求约定不加密）
        if (!req.getPassword().equals(user.getPassword())) {
            throw new BizException(401, "密码错误");
        }
        UserVO vo = UserVO.fromEntity(user);
        // 签发令牌并随用户信息一并返回（前端原样存入 stardew_farmer）
        vo.setToken(createToken(user.getAccount()));
        return vo;
    }

    @Override
    public void register(RegisterRequest req) {
        // 账号冲突校验：农夫名 / 邮箱 不能重复
        Long cnt = userMapper.selectCount(
                Wrappers.<User>lambdaQuery()
                        .eq(User::getAccount, req.getFarmerName())
                        .or()
                        .eq(User::getEmail, req.getEmail())
        );
        if (cnt != null && cnt > 0) {
            throw new BizException(400, "农夫名或邮箱已被注册");
        }

        User user = new User();
        // 注册表单没有单独 account 字段，默认用 农夫名 作为登录账号
        user.setAccount(req.getFarmerName());
        user.setFarmerName(req.getFarmerName());
        user.setFarmName(req.getFarmName());
        user.setEmail(req.getEmail());
        user.setAnimal(req.getAnimal());
        // 明文存储（需求约定不加密），新注册用户权限默认为 1（普通用户）
        user.setPassword(req.getPassword());
        user.setRole(1);

        userMapper.insert(user);
    }

    @Override
    public String createToken(String account) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenExpiry.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MS);
        tokenAccount.put(token, account);
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
            tokenAccount.remove(token);
            return null;
        }
        // 访问即续期
        tokenExpiry.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MS);
        return tokenAccount.get(token);
    }

    @Override
    public void logout(String token) {
        if (token != null) {
            tokenExpiry.remove(token);
            tokenAccount.remove(token);
        }
    }
}
