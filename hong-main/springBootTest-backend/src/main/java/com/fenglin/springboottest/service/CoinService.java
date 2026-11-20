package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.CoinChangeRequest;
import com.fenglin.springboottest.entity.CoinLog;
import java.util.List;
import java.util.Map;

/**
 * 玩家金币管理服务：查询金币、管理员调整金币、操作日志审计。
 */
public interface CoinService {

    /** 按用户 ID 查询当前金币（无进度记录时返回默认 500） */
    Map<String, Object> getCoin(Long userId);

    /** 玩家列表（含当前金币），支持账号/农夫名/邮箱关键字过滤 */
    List<Map<String, Object>> listPlayers(String keyword);

    /** 调整金币：mode=delta 增减 / target 目标值，需传操作人，返回变更后结果 */
    Map<String, Object> change(Long userId, CoinChangeRequest req, String operator);

    /** 查询金币变更日志：account 为空则查全部，limit 限制条数 */
    List<CoinLog> listLogs(String account, Integer limit);
}
