package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.AdminLoginRequest;

/**
 * 后台管理员服务：登录（仅登录，无注册）、令牌校验
 */
public interface AdminService {

    /**
     * 管理员登录，成功返回访问令牌
     *
     * @param req 登录请求
     * @return 令牌字符串
     */
    String login(AdminLoginRequest req);

    /**
     * 校验令牌是否有效（未过期），有效则返回对应管理员账号，否则返回 null
     *
     * @param token 令牌
     * @return 管理员账号
     */
    String validateToken(String token);

    /**
     * 令牌失效（登出）
     *
     * @param token 令牌
     */
    void logout(String token);
}
