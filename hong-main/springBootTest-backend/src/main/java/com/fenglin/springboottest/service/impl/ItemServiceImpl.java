package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.ItemRequest;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.mapper.ItemMapper;
import com.fenglin.springboottest.service.ItemService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 首页展示条目服务实现
 */
@Service
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemMapper itemMapper;

    @Override
    public List<Item> listEnabled() {
        return itemMapper.selectList(
                Wrappers.<Item>lambdaQuery()
                        .eq(Item::getEnabled, 1)
                        .orderByAsc(Item::getSortOrder)
                        .orderByAsc(Item::getId));
    }

    @Override
    public List<Item> listForAdmin(String keyword, String cat) {
        return itemMapper.selectList(
                Wrappers.<Item>lambdaQuery()
                        .like(keyword != null && !keyword.isBlank(), Item::getName, keyword)
                        .eq(cat != null && !cat.isBlank(), Item::getCat, cat)
                        .orderByAsc(Item::getSortOrder)
                        .orderByAsc(Item::getId));
    }

    @Override
    public Item create(ItemRequest req) {
        Item item = new Item();
        copy(req, item);
        itemMapper.insert(item);
        return item;
    }

    @Override
    public Item update(Long id, ItemRequest req) {
        Item item = itemMapper.selectById(id);
        if (item == null) {
            throw new BizException(404, "条目不存在");
        }
        copy(req, item);
        itemMapper.updateById(item);
        return item;
    }

    @Override
    public void delete(Long id) {
        Item item = itemMapper.selectById(id);
        if (item == null) {
            throw new BizException(404, "条目不存在");
        }
        itemMapper.deleteById(id);
    }

    private void copy(ItemRequest req, Item item) {
        item.setIcon(req.getIcon());
        item.setName(req.getName());
        item.setCat(req.getCat());
        item.setDescription(req.getDescription() == null ? "" : req.getDescription());
        item.setSortOrder(req.getSortOrder() == null ? 999 : req.getSortOrder());
        item.setEnabled(req.getEnabled() == null ? 1 : req.getEnabled());
    }
}
