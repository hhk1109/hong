package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.config.ProgressAuthInterceptor;
import com.fenglin.springboottest.dto.ProgressRequest;
import com.fenglin.springboottest.service.ProgressService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户游戏进度接口（背包 + 社区中心收集包），按账号维度存取。
 * 说明：本接口由 ProgressAuthInterceptor 保护，仅持有有效 X-User-Token 的登录用户可访问；
 *       账号以令牌解析结果为准（请求属性 authAccount），不信任客户端传入的 account，防止冒名。
 */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @Autowired
    private HttpServletRequest request;

    /** 从令牌解析出的当前登录账号（由拦截器写入） */
    private String currentAccount() {
        Object acc = request.getAttribute(ProgressAuthInterceptor.ATTR_ACCOUNT);
        return acc == null ? null : acc.toString();
    }

    @GetMapping
    public Result<Map<String, Object>> get() {
        String account = currentAccount();
        if (account == null) {
            return Result.fail(401, "未登录或登录已过期，请重新登录");
        }
        return Result.success(progressService.getByAccount(account), "ok");
    }

    @PutMapping
    public Result<Void> save(@Valid @RequestBody ProgressRequest req) {
        String account = currentAccount();
        if (account == null) {
            return Result.fail(401, "未登录或登录已过期，请重新登录");
        }
        progressService.save(account, req.getBag(), req.getBundles());
        return Result.success(null, "进度已保存");
    }
}
