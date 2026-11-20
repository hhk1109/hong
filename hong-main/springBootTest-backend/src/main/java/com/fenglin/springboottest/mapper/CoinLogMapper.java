package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.CoinLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 玩家金币变更操作日志 Mapper
 */
@Mapper
public interface CoinLogMapper extends BaseMapper<CoinLog> {
}
