package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.UserAdminRequest;
import com.fenglin.springboottest.entity.User;
import java.util.List;
import java.util.Map;

/**
 * 后台用户管理服务
 */
public interface AdminUserService {

    /** 管理端用户列表（不含密码），支持 ?keyword=（账号/农夫名/邮箱）过滤 */
    List<User> listForAdmin(String keyword);

    /** 编辑用户（资料 / 角色 / 状态 / 重置密码），operator 为当前操作的管理员账号 */
    User update(Long id, UserAdminRequest req, String operator);

    /** 删除用户（连同其游戏进度），operator 为当前操作的管理员账号 */
    void delete(Long id, String operator);

    /** 查看指定用户的游戏进度（背包 + 社区中心收集包） */
    Map<String, Object> getProgress(Long id);
}
