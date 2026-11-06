package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.dto.UserVO;

/**
 * 用户业务接口
 */
public interface UserService {

    /**
     * 登录：校验账号/密码，返回脱敏用户信息
     *
     * @param req 登录请求
     * @return 用户信息
     */
    UserVO login(LoginRequest req);

    /**
     * 注册新用户（账号默认等于农夫名）
     *
     * @param req 注册请求
     */
    void register(RegisterRequest req);

    /**
     * 为指定账号签发访问令牌（明文简单令牌，有效期 2 小时，访问自动续期）
     *
     * @param account 登录账号
     * @return 令牌字符串
     */
    String createToken(String account);

    /**
     * 校验令牌，有效则返回对应账号，否则返回 null
     *
     * @param token 令牌
     * @return 账号
     */
    String validateToken(String token);

    /**
     * 令牌失效（登出）
     *
     * @param token 令牌
     */
    void logout(String token);
}
