package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.HomeConfigVO;

/**
 * 主页展示配置服务
 */
public interface HomeConfigService {

    /** 读取主页配置（公开，含兜底默认值） */
    HomeConfigVO get();

    /** 保存主页配置（管理端） */
    HomeConfigVO save(HomeConfigVO vo);
}
