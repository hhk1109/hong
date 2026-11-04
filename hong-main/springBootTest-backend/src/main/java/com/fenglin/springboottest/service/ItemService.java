package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.ItemRequest;
import com.fenglin.springboottest.entity.Item;
import java.util.List;

/**
 * 首页展示条目服务
 */
public interface ItemService {

    /** 首页公开列表：仅返回启用条目，按 sort_order 升序 */
    List<Item> listEnabled();

    /** 后台管理列表：返回全部条目，支持关键字 / 分类过滤 */
    List<Item> listForAdmin(String keyword, String cat);

    /** 新增 */
    Item create(ItemRequest req);

    /** 编辑 */
    Item update(Long id, ItemRequest req);

    /** 删除 */
    void delete(Long id);
}
