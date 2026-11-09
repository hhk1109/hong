package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.BundleRequest;
import com.fenglin.springboottest.entity.Bundle;
import com.fenglin.springboottest.service.BundleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台收集包管理接口（需 X-Admin-Token 请求头，见 AdminAuthInterceptor）
 * 对应首页「社区中心」模块
 */
@RestController
@RequestMapping("/api/admin/bundles")
public class AdminBundleController {

    @Autowired
    private BundleService bundleService;

    /** 管理端列表（含隐藏条目），支持 ?keyword= 过滤 */
    @GetMapping
    public Result<List<Bundle>> list(@RequestParam(required = false) String keyword) {
        return Result.success(bundleService.listForAdmin(keyword));
    }

    /** 新增收集包 */
    @PostMapping
    public Result<Bundle> create(@Valid @RequestBody BundleRequest req) {
        return Result.success(bundleService.create(req), "新增成功");
    }

    /** 编辑收集包 */
    @PutMapping("/{id}")
    public Result<Bundle> update(@PathVariable Long id, @Valid @RequestBody BundleRequest req) {
        return Result.success(bundleService.update(id, req), "保存成功");
    }

    /** 删除收集包 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bundleService.delete(id);
        return Result.success(null, "删除成功");
    }
}
