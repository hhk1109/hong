package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.dto.UserVO;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 用户业务实现
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

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
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new BizException(401, "密码错误");
        }
        return UserVO.fromEntity(user);
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
        user.setPassword(encoder.encode(req.getPassword()));

        userMapper.insert(user);
    }
}
