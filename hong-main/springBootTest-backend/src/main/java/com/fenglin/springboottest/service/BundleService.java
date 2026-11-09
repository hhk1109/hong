package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.BundleRequest;
import com.fenglin.springboottest.entity.Bundle;
import java.util.List;

/**
 * 社区中心收集包服务
 */
public interface BundleService {

    /** 首页公开列表（仅启用中，按 sort_order 升序） */
    List<Bundle> listEnabled();

    /** 管理端列表（含隐藏），支持 ?keyword= 过滤 */
    List<Bundle> listForAdmin(String keyword);

    /** 新增收集包 */
    Bundle create(BundleRequest req);

    /** 编辑收集包 */
    Bundle update(Long id, BundleRequest req);

    /** 删除收集包 */
    void delete(Long id);
}
