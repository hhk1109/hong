package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.HomeConfigVO;
import com.fenglin.springboottest.service.HomeConfigService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台主页管理接口（需 X-Admin-Token 请求头，见 AdminAuthInterceptor）。
 */
@RestController
@RequestMapping("/api/admin/home")
public class AdminHomeController {

    @Autowired
    private HomeConfigService homeConfigService;

    /** 读取当前主页配置 */
    @GetMapping("/config")
    public Result<HomeConfigVO> get() {
        return Result.success(homeConfigService.get());
    }

    /** 保存主页配置（保存后主页即时同步） */
    @PutMapping("/config")
    public Result<HomeConfigVO> save(@Valid @RequestBody HomeConfigVO vo) {
        return Result.success(homeConfigService.save(vo), "保存成功，主页已同步");
    }
}
