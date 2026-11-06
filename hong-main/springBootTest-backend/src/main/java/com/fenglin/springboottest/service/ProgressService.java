package com.fenglin.springboottest.service;

import java.util.List;
import java.util.Map;

/**
 * 用户游戏进度服务
 */
public interface ProgressService {

    /**
     * 按账号读取进度（背包 + 社区中心收集包）
     *
     * @param account 登录账号
     * @return { bag: {name:count}, bundles: {bundleId:[name,...]} }，无记录时返回空 Map
     */
    Map<String, Object> getByAccount(String account);

    /**
     * 保存（不存在则新增，存在则覆盖更新）指定账号的进度
     */
    void save(String account, Map<String, Integer> bag, Map<String, List<String>> bundles);
}
