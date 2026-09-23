package com.minion.controller;

import com.minion.common.Result;
import com.minion.service.CaptchaStore;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;
import java.util.Random;

/**
 * 图形验证码接口
 * 返回 captchaId + base64 图片，前端展示图片、提交 captchaId + 用户输入
 */
@RestController
@RequestMapping("/api/captcha")
public class CaptchaController {

    /** 去掉容易看混的 0 O o 1 l I */
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int WIDTH = 108;
    private static final int HEIGHT = 44;
    private static final int LENGTH = 4;

    private final CaptchaStore captchaStore;
    private final Random random = new Random();

    public CaptchaController(CaptchaStore captchaStore) {
        this.captchaStore = captchaStore;
    }

    @GetMapping
    public Result<Map<String, String>> generate() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < LENGTH; i++) {
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }

        String captchaId = captchaStore.put(code.toString());
        String image = "data:image/png;base64," + Base64.getEncoder().encodeToString(draw(code.toString()));

        return Result.ok(Map.of("captchaId", captchaId, "image", image));
    }

    /** 用 Java2D 画一张带干扰线/噪点的验证码图 */
    private byte[] draw(String code) {
        BufferedImage img = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 底色：淡香蕉黄渐变
        g.setPaint(new java.awt.GradientPaint(0, 0, new Color(0xFF, 0xFD, 0xF0),
                WIDTH, HEIGHT, new Color(0xFF, 0xE8, 0x94)));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // 干扰点
        for (int i = 0; i < 56; i++) {
            g.setColor(new Color(rand(120, 210), rand(110, 190), rand(20, 110), rand(40, 110)));
            g.fillOval(rand(0, WIDTH), rand(0, HEIGHT), 2, 2);
        }

        // 干扰线
        for (int i = 0; i < 4; i++) {
            g.setStroke(new BasicStroke(rand(1, 2)));
            g.setColor(new Color(rand(150, 220), rand(130, 190), rand(30, 120), 120));
            g.drawLine(rand(0, WIDTH), rand(0, HEIGHT), rand(0, WIDTH), rand(0, HEIGHT));
        }

        // 字符：逐个旋转、错位
        Font font = new Font(Font.SANS_SERIF, Font.BOLD, rand(23, 28));
        Color[] colors = {new Color(0x8A6A00), new Color(0x3B6FE0), new Color(0xC17800), new Color(0x2A55B8)};
        int step = WIDTH / (code.length() + 1);
        for (int k = 0; k < code.length(); k++) {
            g.setFont(font);
            double angle = Math.toRadians(rand(-25, 25));
            int x = step * (k + 1);
            int y = HEIGHT / 2 + rand(-3, 4);
            g.rotate(angle, x, y);
            g.setColor(colors[random.nextInt(colors.length)]);
            g.drawString(String.valueOf(code.charAt(k)), x - 10, y + 8);
            g.rotate(-angle, x, y);
        }

        // 前景弧线
        g.setStroke(new BasicStroke(1.5f));
        g.setColor(new Color(255, 217, 15, 180));
        g.drawArc(-20, rand(0, 20), WIDTH + 40, rand(40, 60), 0, 180);

        g.dispose();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(img, "png", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("生成验证码图片失败", e);
        }
    }

    private int rand(int min, int max) {
        return random.nextInt(max - min + 1) + min;
    }
}
