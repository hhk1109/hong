package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.BundleRequest;
import com.fenglin.springboottest.entity.Bundle;
import com.fenglin.springboottest.mapper.BundleMapper;
import com.fenglin.springboottest.service.BundleService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 社区中心收集包服务实现
 */
@Service
public class BundleServiceImpl implements BundleService {

    @Autowired
    private BundleMapper bundleMapper;

    @Override
    public List<Bundle> listEnabled() {
        return bundleMapper.selectList(
                Wrappers.<Bundle>lambdaQuery()
                        .eq(Bundle::getEnabled, 1)
                        .orderByAsc(Bundle::getSortOrder)
                        .orderByAsc(Bundle::getId));
    }

    @Override
    public List<Bundle> listForAdmin(String keyword) {
        return bundleMapper.selectList(
                Wrappers.<Bundle>lambdaQuery()
                        .like(keyword != null && !keyword.isBlank(), Bundle::getTitle, keyword)
                        .orderByAsc(Bundle::getSortOrder)
                        .orderByAsc(Bundle::getId));
    }

    @Override
    public Bundle create(BundleRequest req) {
        Bundle bundle = new Bundle();
        copy(req, bundle);
        bundleMapper.insert(bundle);
        return bundle;
    }

    @Override
    public Bundle update(Long id, BundleRequest req) {
        Bundle bundle = bundleMapper.selectById(id);
        if (bundle == null) {
            throw new BizException(404, "收集包不存在");
        }
        copy(req, bundle);
        bundleMapper.updateById(bundle);
        return bundle;
    }

    @Override
    public void delete(Long id) {
        Bundle bundle = bundleMapper.selectById(id);
        if (bundle == null) {
            throw new BizException(404, "收集包不存在");
        }
        bundleMapper.deleteById(id);
    }

    private void copy(BundleRequest req, Bundle bundle) {
        bundle.setIcon(req.getIcon());
        bundle.setTitle(req.getTitle());
        bundle.setDescription(req.getDescription() == null ? "" : req.getDescription());
        // 去重、去空白，保持顺序
        Set<String> set = new LinkedHashSet<>();
        if (req.getNeed() != null) {
            req.getNeed().forEach(n -> {
                if (n != null && !n.isBlank()) {
                    set.add(n.trim());
                }
            });
        }
        if (set.isEmpty()) {
            throw new BizException(400, "所需物品不能为空");
        }
        bundle.setNeed(new ArrayList<>(set));
        bundle.setSortOrder(req.getSortOrder() == null ? 999 : req.getSortOrder());
        bundle.setEnabled(req.getEnabled() == null ? 1 : req.getEnabled());
    }
}
