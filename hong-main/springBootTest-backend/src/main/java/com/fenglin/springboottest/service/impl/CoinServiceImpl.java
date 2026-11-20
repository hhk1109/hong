package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.CoinChangeRequest;
import com.fenglin.springboottest.entity.CoinLog;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.entity.UserProgress;
import com.fenglin.springboottest.mapper.CoinLogMapper;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.mapper.UserProgressMapper;
import com.fenglin.springboottest.service.CoinService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 玩家金币管理服务实现。
 *
 * <p>金币并不在 user 表中，而是存于 user_progress.gameplay 这一 JSON 的顶层 gold 字段
 * （前端 defaultGame().gold，默认 500）。修改时只改 gold、原样保留其它玩法字段，
 * 并在同一事务内写入 coin_log 操作日志，保证变更准确、可追踪。</p>
 */
@Service
public class CoinServiceImpl implements CoinService {

    /** 无进度记录时游戏的默认金币，与前端 defaultGame().gold 保持一致 */
    private static final long DEFAULT_GOLD = 500L;
    /** 金币上限，防止误操作导致数值溢出 */
    private static final long MAX_GOLD = 999_999_999L;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserProgressMapper progressMapper;

    @Autowired
    private CoinLogMapper coinLogMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 将 gameplay JSON 解析为可写 Map，解析失败返回空 Map（不覆盖原业务逻辑） */
    private Map<String, Object> parseGameplay(String json) {
        if (json == null || json.isBlank()) return new LinkedHashMap<>();
        try {
            Map<String, Object> m = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            return m == null ? new LinkedHashMap<>() : m;
        } catch (Exception e) {
            throw new BizException(500, "玩法存档格式异常，无法读取金币：" + e.getMessage());
        }
    }

    /** 从 gameplay Map 中安全读取 gold（兼容 Integer/Long/Double/字符串） */
    private long readGold(Map<String, Object> gameplay) {
        Object v = gameplay.get("gold");
        if (v == null) return DEFAULT_GOLD;
        if (v instanceof Number) return ((Number) v).longValue();
        try {
            return Long.parseLong(String.valueOf(v).trim());
        } catch (Exception e) {
            return DEFAULT_GOLD;
        }
    }

    @Override
    public Map<String, Object> getCoin(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BizException(404, "用户不存在");
        UserProgress p = progressMapper.selectOne(
                Wrappers.<UserProgress>lambdaQuery().eq(UserProgress::getAccount, user.getAccount()));
        long gold = (p == null) ? DEFAULT_GOLD : readGold(parseGameplay(p.getGameplay()));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", user.getId());
        data.put("account", user.getAccount());
        data.put("farmerName", user.getFarmerName());
        data.put("gold", gold);
        data.put("hasProgress", p != null);
        return data;
    }

    @Override
    public List<Map<String, Object>> listPlayers(String keyword) {
        List<User> users = userMapper.selectList(
                Wrappers.<User>lambdaQuery()
                        .and(keyword != null && !keyword.isBlank(), w -> w
                                .like(User::getAccount, keyword)
                                .or().like(User::getFarmerName, keyword)
                                .or().like(User::getEmail, keyword))
                        .orderByAsc(User::getId));
        // 一次性取出全部进度，按 account 建索引，避免逐条查询
        Map<String, UserProgress> progressByAccount = new HashMap<>();
        for (UserProgress p : progressMapper.selectList(null)) {
            if (p.getAccount() != null) progressByAccount.put(p.getAccount(), p);
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (User u : users) {
            UserProgress p = progressByAccount.get(u.getAccount());
            long gold = (p == null) ? DEFAULT_GOLD : readGold(parseGameplay(p.getGameplay()));
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", u.getId());
            row.put("account", u.getAccount());
            row.put("farmerName", u.getFarmerName());
            row.put("email", u.getEmail());
            row.put("role", u.getRole());
            row.put("status", u.getStatus());
            row.put("gold", gold);
            list.add(row);
        }
        return list;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public synchronized Map<String, Object> change(Long userId, CoinChangeRequest req, String operator) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BizException(404, "用户不存在");

        String mode = req.getMode();
        long value = req.getValue();
        if (!"delta".equals(mode) && !"target".equals(mode)) {
            throw new BizException(400, "调整模式只能是 delta 或 target");
        }
        if ("delta".equals(mode) && value == 0) {
            throw new BizException(400, "增减数值不能为 0");
        }

        UserProgress p = progressMapper.selectOne(
                Wrappers.<UserProgress>lambdaQuery().eq(UserProgress::getAccount, user.getAccount()));
        Map<String, Object> gameplay = (p == null) ? new LinkedHashMap<>() : parseGameplay(p.getGameplay());
        long before = readGold(gameplay);

        long after;
        if ("delta".equals(mode)) {
            after = before + value;
        } else {
            after = value;
        }
        if (after < 0) throw new BizException(400, "调整后金币不能为负数");
        if (after > MAX_GOLD) throw new BizException(400, "调整后金币不能超过上限 " + MAX_GOLD);
        if (after == before) throw new BizException(400, "调整后金币与当前相同，无需修改");

        // 只改 gold，原样保留其它玩法字段
        gameplay.put("gold", after);
        String gameplayJson;
        try {
            gameplayJson = objectMapper.writeValueAsString(gameplay);
        } catch (Exception e) {
            throw new BizException(500, "玩法存档写入失败：" + e.getMessage());
        }
        if (p == null) {
            UserProgress np = new UserProgress();
            np.setAccount(user.getAccount());
            np.setBag("{}");
            np.setBundles("{}");
            np.setGameplay(gameplayJson);
            progressMapper.insert(np);
        } else {
            p.setGameplay(gameplayJson);
            progressMapper.updateById(p);
        }

        // 记录操作日志（原因必填由 DTO 校验保证）
        CoinLog log = new CoinLog();
        log.setAccount(user.getAccount());
        log.setFarmerName(user.getFarmerName() == null ? "" : user.getFarmerName());
        log.setOperator(operator == null ? "unknown" : operator);
        log.setMode(mode);
        log.setChangeValue(value);
        log.setBeforeGold(before);
        log.setAfterGold(after);
        log.setDiff(after - before);
        log.setReason(req.getReason().trim());
        coinLogMapper.insert(log);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", user.getId());
        data.put("account", user.getAccount());
        data.put("farmerName", user.getFarmerName());
        data.put("beforeGold", before);
        data.put("afterGold", after);
        data.put("diff", after - before);
        data.put("logId", log.getId());
        return data;
    }

    @Override
    public List<CoinLog> listLogs(String account, Integer limit) {
        int size = (limit == null || limit <= 0) ? 50 : Math.min(limit, 500);
        return coinLogMapper.selectList(
                Wrappers.<CoinLog>lambdaQuery()
                        .eq(account != null && !account.isBlank(), CoinLog::getAccount, account)
                        .orderByDesc(CoinLog::getId)
                        .last("LIMIT " + size));
    }
}
