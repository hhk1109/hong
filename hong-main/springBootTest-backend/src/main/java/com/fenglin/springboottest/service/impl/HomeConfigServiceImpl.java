package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.dto.HomeConfigVO;
import com.fenglin.springboottest.entity.HomeConfig;
import com.fenglin.springboottest.mapper.HomeConfigMapper;
import com.fenglin.springboottest.service.HomeConfigService;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 主页展示配置服务实现：数据库 home_config 单行的 JSON 列与结构化 VO 互转。
 */
@Service
public class HomeConfigServiceImpl implements HomeConfigService {

    private static final String KEY = "main";

    @Autowired
    private HomeConfigMapper homeConfigMapper;

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public HomeConfigVO get() {
        HomeConfig cfg = homeConfigMapper.selectOne(
                Wrappers.<HomeConfig>lambdaQuery().eq(HomeConfig::getConfigKey, KEY));
        if (cfg == null) {
            return defaultConfig();
        }
        return toVO(cfg);
    }

    @Override
    public HomeConfigVO save(HomeConfigVO vo) {
        if (vo == null) {
            vo = new HomeConfigVO();
        }
        String welcome = vo.getWelcomeText() == null ? "" : vo.getWelcomeText();
        String slides = toJson(vo.getSlides() == null ? Collections.emptyList() : vo.getSlides());
        String featured = toJson(vo.getFeaturedIds() == null ? Collections.emptyList() : vo.getFeaturedIds());
        String categories = toJson(vo.getCategories() == null ? Collections.emptyList() : vo.getCategories());

        HomeConfig cfg = homeConfigMapper.selectOne(
                Wrappers.<HomeConfig>lambdaQuery().eq(HomeConfig::getConfigKey, KEY));
        if (cfg == null) {
            cfg = new HomeConfig();
            cfg.setConfigKey(KEY);
            cfg.setWelcomeText(welcome);
            cfg.setSlides(slides);
            cfg.setFeaturedIds(featured);
            cfg.setCategories(categories);
            homeConfigMapper.insert(cfg);
        } else {
            cfg.setWelcomeText(welcome);
            cfg.setSlides(slides);
            cfg.setFeaturedIds(featured);
            cfg.setCategories(categories);
            homeConfigMapper.updateById(cfg);
        }
        return get();
    }

    private HomeConfigVO toVO(HomeConfig cfg) {
        HomeConfigVO vo = new HomeConfigVO();
        vo.setWelcomeText(cfg.getWelcomeText());
        vo.setSlides(parseList(cfg.getSlides(), new TypeReference<List<HomeConfigVO.Slide>>() {}));
        vo.setFeaturedIds(parseList(cfg.getFeaturedIds(), new TypeReference<List<Long>>() {}));
        vo.setCategories(parseList(cfg.getCategories(), new TypeReference<List<HomeConfigVO.Category>>() {}));
        if (cfg.getUpdateTime() != null) {
            vo.setUpdateTime(cfg.getUpdateTime().toString());
        }
        return vo;
    }

    private <T> List<T> parseList(String json, TypeReference<List<T>> type) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            List<T> list = mapper.readValue(json, type);
            return list == null ? new ArrayList<>() : list;
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    /** 数据库无配置时的兜底默认值（与 admin_init.sql 默认一致） */
    private HomeConfigVO defaultConfig() {
        HomeConfigVO vo = new HomeConfigVO();
        vo.setWelcomeText("欢迎来到星露谷，<b>尊敬的农夫</b>！今天也要努力种田哦～ 🌞");
        List<HomeConfigVO.Slide> slides = new ArrayList<>();
        slides.add(slide("", "🌾 欢迎来到星露谷", "种田 · 钓鱼 · 挖矿 · 结交村民，开启你的农场生活", ""));
        slides.add(slide("", "🌸 四季轮转", "按真实日历开放当季作物与钓期", ""));
        slides.add(slide("", "🏠 重建社区中心", "收集捐赠包，唤醒沉睡的鹈鹕镇", ""));
        vo.setSlides(slides);
        vo.setFeaturedIds(new ArrayList<>());
        List<HomeConfigVO.Category> cats = new ArrayList<>();
        String[][] defs = {
                {"crop", "作物"}, {"animal", "动物"}, {"fish", "钓鱼"}, {"ore", "矿石"},
                {"tool", "工具"}, {"upgrade", "农场升级"}, {"food", "食物"},
                {"furniture", "家具"}, {"special", "特殊"}
        };
        for (int i = 0; i < defs.length; i++) {
            HomeConfigVO.Category c = new HomeConfigVO.Category();
            c.setKey(defs[i][0]);
            c.setLabel(defs[i][1]);
            c.setEnabled(true);
            c.setSortOrder(i + 1);
            cats.add(c);
        }
        vo.setCategories(cats);
        return vo;
    }

    private HomeConfigVO.Slide slide(String image, String title, String subtitle, String link) {
        HomeConfigVO.Slide s = new HomeConfigVO.Slide();
        s.setImage(image);
        s.setTitle(title);
        s.setSubtitle(subtitle);
        s.setLink(link);
        return s;
    }
}
