package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.entity.UserProgress;
import com.fenglin.springboottest.mapper.UserProgressMapper;
import com.fenglin.springboottest.service.ProgressService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 用户进度服务实现：背包 / 社区中心收集包进度按账号维度持久化到 user_progress 表。
 * bag / bundles 以 JSON 字符串存储，使用 Jackson 在 Map 与 JSON 间转换。
 */
@Service
public class ProgressServiceImpl implements ProgressService {

    @Autowired
    private UserProgressMapper progressMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Map<String, Integer> parseBag(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, List<String>> parseBundles(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, List<String>>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @Override
    public Map<String, Object> getByAccount(String account) {
        UserProgress p = progressMapper.selectOne(
                Wrappers.<UserProgress>lambdaQuery().eq(UserProgress::getAccount, account));
        Map<String, Object> data = new HashMap<>();
        data.put("bag", p == null ? Collections.emptyMap() : parseBag(p.getBag()));
        data.put("bundles", p == null ? Collections.emptyMap() : parseBundles(p.getBundles()));
        return data;
    }

    @Override
    public void save(String account, Map<String, Integer> bag, Map<String, List<String>> bundles) {
        if (account == null || account.isEmpty()) return;
        try {
            String bagJson = objectMapper.writeValueAsString(bag == null ? new HashMap<>() : bag);
            String bundlesJson = objectMapper.writeValueAsString(bundles == null ? new HashMap<>() : bundles);
            UserProgress exist = progressMapper.selectOne(
                    Wrappers.<UserProgress>lambdaQuery().eq(UserProgress::getAccount, account));
            if (exist == null) {
                UserProgress p = new UserProgress();
                p.setAccount(account);
                p.setBag(bagJson);
                p.setBundles(bundlesJson);
                progressMapper.insert(p);
            } else {
                exist.setBag(bagJson);
                exist.setBundles(bundlesJson);
                progressMapper.updateById(exist);
            }
        } catch (Exception e) {
            throw new com.fenglin.springboottest.common.BizException(500, "进度保存失败：" + e.getMessage());
        }
    }
}
