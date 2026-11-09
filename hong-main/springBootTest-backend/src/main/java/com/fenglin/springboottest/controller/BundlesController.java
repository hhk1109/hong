package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Bundle;
import com.fenglin.springboottest.service.BundleService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 首页公开接口：返回启用中的社区中心收集包（无需登录）
 * 首页 home.html 从此接口加载收集包定义，后台数据变更即时同步
 */
@RestController
@RequestMapping("/api/bundles")
public class BundlesController {

    @Autowired
    private BundleService bundleService;

    @GetMapping
    public Result<List<Bundle>> list() {
        return Result.success(bundleService.listEnabled());
    }
}
