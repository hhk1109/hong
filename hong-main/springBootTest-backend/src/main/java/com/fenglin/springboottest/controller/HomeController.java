package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.HomeConfigVO;
import com.fenglin.springboottest.service.HomeConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 主页公开接口：返回主页展示配置（欢迎文案 / 轮播图 / 推荐商品 / 分类展示），无需登录。
 */
@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private HomeConfigService homeConfigService;

    @GetMapping("/config")
    public Result<HomeConfigVO> config() {
        return Result.success(homeConfigService.get());
    }
}
