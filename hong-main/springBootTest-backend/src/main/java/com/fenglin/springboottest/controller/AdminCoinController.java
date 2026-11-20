package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.CoinChangeRequest;
import com.fenglin.springboottest.entity.CoinLog;
import com.fenglin.springboottest.service.AdminService;
import com.fenglin.springboottest.service.CoinService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台玩家金币管理接口（需 X-Admin-Token 请求头，见 AdminAuthInterceptor）。
 * 金币存于 user_progress.gameplay JSON 的 gold 字段，本接口负责查询与审计式调整。
 */
@RestController
@RequestMapping("/api/admin/coin")
public class AdminCoinController {

    @Autowired
    private CoinService coinService;

    @Autowired
    private AdminService adminService;

    /** 玩家列表（含当前金币），支持 ?keyword= 过滤，供管理端搜索选择玩家 */
    @GetMapping("/players")
    public Result<List<Map<String, Object>>> players(@RequestParam(required = false) String keyword) {
        return Result.success(coinService.listPlayers(keyword));
    }

    /** 查看指定玩家当前金币 */
    @GetMapping("/{userId}")
    public Result<Map<String, Object>> get(@PathVariable Long userId) {
        return Result.success(coinService.getCoin(userId));
    }

    /** 调整玩家金币（增减 / 目标值），记录操作人与原因 */
    @PostMapping("/{userId}/change")
    public Result<Map<String, Object>> change(
            @PathVariable Long userId,
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @Valid @RequestBody CoinChangeRequest req) {
        String operator = adminService.validateToken(token);
        if (operator == null) throw new BizException(401, "未登录或登录已过期");
        return Result.success(coinService.change(userId, req, operator), "金币已更新并记录日志");
    }

    /** 查询金币变更日志：?account= 过滤，?limit= 条数（默认 50） */
    @GetMapping("/logs")
    public Result<List<CoinLog>> logs(
            @RequestParam(required = false) String account,
            @RequestParam(required = false) Integer limit) {
        return Result.success(coinService.listLogs(account, limit));
    }
}
