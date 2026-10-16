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
}
