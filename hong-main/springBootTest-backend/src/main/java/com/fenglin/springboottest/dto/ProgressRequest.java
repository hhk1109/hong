package com.fenglin.springboottest.dto;

import java.util.List;
import java.util.Map;

/**
 * 进度保存请求：前端 PUT /api/progress
 * { "account": "农夫名", "bag": {"物品名": 数量}, "bundles": {"bundleId": ["物品名", ...]} }
 */
public class ProgressRequest {

    private String account;
    private Map<String, Integer> bag;
    private Map<String, List<String>> bundles;

    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
    public Map<String, Integer> getBag() { return bag; }
    public void setBag(Map<String, Integer> bag) { this.bag = bag; }
    public Map<String, List<String>> getBundles() { return bundles; }
    public void setBundles(Map<String, List<String>> bundles) { this.bundles = bundles; }
}
