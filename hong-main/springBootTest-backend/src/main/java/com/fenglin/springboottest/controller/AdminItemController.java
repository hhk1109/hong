package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.ItemRequest;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.service.ItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台物品管理接口（需 X-Admin-Token 请求头，见 AdminAuthInterceptor）
 */
@RestController
@RequestMapping("/api/admin/items")
public class AdminItemController {

    @Autowired
    private ItemService itemService;

    /** 管理端列表（含隐藏条目），支持 ?keyword= &cat= 过滤 */
    @GetMapping
    public Result<List<Item>> list(@RequestParam(required = false) String keyword,
                                   @RequestParam(required = false) String cat) {
        return Result.success(itemService.listForAdmin(keyword, cat));
    }

    /** 新增条目 */
    @PostMapping
    public Result<Item> create(@Valid @RequestBody ItemRequest req) {
        return Result.success(itemService.create(req), "新增成功");
    }

    /** 编辑条目 */
    @PutMapping("/{id}")
    public Result<Item> update(@PathVariable Long id, @Valid @RequestBody ItemRequest req) {
        return Result.success(itemService.update(id, req), "保存成功");
    }

    /** 删除条目 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return Result.success(null, "删除成功");
    }
}
