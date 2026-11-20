package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.HomeConfig;
import org.apache.ibatis.annotations.Mapper;

/**
 * 主页展示配置 Mapper
 */
@Mapper
public interface HomeConfigMapper extends BaseMapper<HomeConfig> {
}
