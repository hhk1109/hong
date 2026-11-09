package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.UserAdminRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.AdminService;
import com.fenglin.springboottest.service.AdminUserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台用户管理接口（需 X-Admin-Token 请求头，见 AdminAuthInterceptor）
 * 对应首页「登录账号 / 背包进度」相关数据
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminService adminService;

    /** 管理端用户列表（不含密码），支持 ?keyword= 过滤 */
    @GetMapping
    public Result<List<User>> list(@RequestParam(required = false) String keyword) {
        return Result.success(adminUserService.listForAdmin(keyword));
    }

    /** 编辑用户：资料 / 角色 / 状态 / 重置密码 */
    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id,
                               @RequestHeader(value = "X-Admin-Token", required = false) String token,
                               @Valid @RequestBody UserAdminRequest req) {
        String operator = adminService.validateToken(token);
        return Result.success(adminUserService.update(id, req, operator), "保存成功");
    }

    /** 删除用户（连同其游戏进度） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        String operator = adminService.validateToken(token);
        adminUserService.delete(id, operator);
        return Result.success(null, "删除成功");
    }

    /** 查看用户游戏进度（背包 + 社区中心收集包） */
    @GetMapping("/{id}/progress")
    public Result<Map<String, Object>> progress(@PathVariable Long id) {
        return Result.success(adminUserService.getProgress(id));
    }
}
