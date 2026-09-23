package com.minion.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.minion.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper，继承 BaseMapper 即拥有 CRUD 能力（MyBatis-Plus）
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
