package com.minion.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 验证码存储（内存版）
 * - 生成 captchaId -> 验证码 映射，2 分钟过期
 * - 校验为一次性：无论对错都立即删除，防止重放
 * 生产环境建议换成 Redis
 */
@Service
public class CaptchaStore {

    private static final long TTL_MS = 2 * 60 * 1000L;

    private record Entry(String code, long expireAt) {
        boolean expired() {
            return System.currentTimeMillis() > expireAt;
        }
    }

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    /** 保存验证码，返回 captchaId */
    public String put(String code) {
        String id = UUID.randomUUID().toString().replace("-", "");
        store.put(id, new Entry(code.toUpperCase(), System.currentTimeMillis() + TTL_MS));
        return id;
    }

    /**
     * 校验（一次性）：命中返回 true，无论结果如何都会删除
     */
    public boolean verify(String captchaId, String input) {
        if (captchaId == null || input == null) {
            return false;
        }
        Entry entry = store.remove(captchaId);
        return entry != null && !entry.expired()
                && entry.code().equals(input.trim().toUpperCase());
    }
}
