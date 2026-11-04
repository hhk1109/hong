package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.Item;
import org.apache.ibatis.annotations.Mapper;

/**
 * 首页展示条目 Mapper
 */
@Mapper
public interface ItemMapper extends BaseMapper<Item> {
}
