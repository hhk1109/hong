package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.UserProgress;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户进度 Mapper
 */
@Mapper
public interface UserProgressMapper extends BaseMapper<UserProgress> {
}
