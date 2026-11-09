package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.UserAdminRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.entity.UserProgress;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.mapper.UserProgressMapper;
import com.fenglin.springboottest.service.AdminUserService;
import com.fenglin.springboottest.service.ProgressService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 后台用户管理服务实现
 */
@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserProgressMapper progressMapper;

    @Autowired
    private ProgressService progressService;

    @Override
    public List<User> listForAdmin(String keyword) {
        List<User> list = userMapper.selectList(
                Wrappers.<User>lambdaQuery()
                        .and(keyword != null && !keyword.isBlank(), w -> w
                                .like(User::getAccount, keyword)
                                .or().like(User::getFarmerName, keyword)
                                .or().like(User::getEmail, keyword))
                        .orderByAsc(User::getId));
        // 密码不返回前端
        list.forEach(u -> u.setPassword(null));
        return list;
    }

    @Override
    public User update(Long id, UserAdminRequest req, String operator) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        // 不能禁用 / 降级当前登录的管理员自己
        if (user.getAccount().equals(operator)) {
            if (req.getStatus() != null && req.getStatus() == 0) {
                throw new BizException(403, "不能禁用当前登录的管理员账号");
            }
            if (req.getRole() != null && req.getRole() != 0) {
                throw new BizException(403, "不能将当前登录的管理员降级为普通用户");
            }
        }
        // 最后一个管理员不能被降级 / 禁用
        if (user.getRole() != null && user.getRole() == 0) {
            boolean demote = req.getRole() != null && req.getRole() != 0;
            boolean disable = req.getStatus() != null && req.getStatus() == 0;
            if (demote || disable) {
                Long adminCnt = userMapper.selectCount(
                        Wrappers.<User>lambdaQuery().eq(User::getRole, 0));
                if (adminCnt != null && adminCnt <= 1) {
                    throw new BizException(403, "系统至少需要保留一个可用管理员");
                }
            }
        }

        if (req.getFarmerName() != null && !req.getFarmerName().isBlank()) {
            user.setFarmerName(req.getFarmerName());
        }
        if (req.getFarmName() != null) {
            user.setFarmName(req.getFarmName());
        }
        if (req.getEmail() != null) {
            user.setEmail(req.getEmail());
        }
        if (req.getAnimal() != null) {
            user.setAnimal(req.getAnimal());
        }
        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }
        if (req.getStatus() != null) {
            user.setStatus(req.getStatus());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(req.getPassword()); // 明文（需求约定不加密）
        }
        userMapper.updateById(user);
        user.setPassword(null);
        return user;
    }

    @Override
    @Transactional
    public void delete(Long id, String operator) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        if (user.getAccount().equals(operator)) {
            throw new BizException(403, "不能删除当前登录的管理员账号");
        }
        if (user.getRole() != null && user.getRole() == 0) {
            Long adminCnt = userMapper.selectCount(
                    Wrappers.<User>lambdaQuery().eq(User::getRole, 0));
            if (adminCnt != null && adminCnt <= 1) {
                throw new BizException(403, "系统至少需要保留一个管理员，无法删除");
            }
        }
        userMapper.deleteById(id);
        // 连同游戏进度一起删除
        progressMapper.delete(
                Wrappers.<UserProgress>lambdaQuery().eq(UserProgress::getAccount, user.getAccount()));
    }

    @Override
    public Map<String, Object> getProgress(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        return progressService.getByAccount(user.getAccount());
    }
}
