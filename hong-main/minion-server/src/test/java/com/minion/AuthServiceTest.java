package com.minion;

import com.minion.common.BizException;
import com.minion.dto.LoginRequest;
import com.minion.dto.RegisterRequest;
import com.minion.entity.User;
import com.minion.mapper.UserMapper;
import com.minion.service.AuthService;
import com.minion.service.CaptchaStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 注册/登录功能集成测试（真实连接本地 MySQL）
 * 验证码：直接向 CaptchaStore 写入已知 code 模拟"用户看到了图片"
 */
@SpringBootTest
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CaptchaStore captchaStore;

    /** 生成一个不会重复的 12 位数字账号 */
    private String uniqueUsername() {
        String ts = String.valueOf(System.currentTimeMillis());
        return ("1000000" + ts).substring(("1000000" + ts).length() - 12);
    }

    @Test
    void contextLoads() {
        assertNotNull(authService);
        assertNotNull(userMapper);
        assertNotNull(captchaStore);
    }

    @Test
    void registerAndLogin() {
        String username = uniqueUsername();
        String password = "banana123";
        String captchaId = captchaStore.put("AB2D");

        // 1. 注册成功
        User user = authService.register(buildRegister(username, password, captchaId, "AB2D"));
        assertNotNull(user.getId(), "注册后应能拿到自增主键");

        // 2. 密码必须已加密存储（不能是明文）
        User dbUser = userMapper.selectById(user.getId());
        assertTrue(dbUser.getPassword().startsWith("$2"), "密码应使用 BCrypt 加密存储");

        // 3. 重复注册应被拒绝
        String captchaId2 = captchaStore.put("XY7K");
        assertThrows(BizException.class,
                () -> authService.register(buildRegister(username, password, captchaId2, "XY7K")),
                "同一账号重复注册应抛出业务异常");

        // 4. 正确密码可登录
        String captchaId3 = captchaStore.put("QW9P");
        Map<String, Object> loginResult = authService.login(buildLogin(username, password, captchaId3, "QW9P"));
        assertEquals(username, String.valueOf(loginResult.get("username")));

        // 5. 错误密码登录应被拒绝
        String captchaId4 = captchaStore.put("MM5N");
        assertThrows(BizException.class,
                () -> authService.login(buildLogin(username, "wrong-pass", captchaId4, "MM5N")),
                "密码错误应抛出业务异常");

        // 6. 不存在的账号登录应被拒绝
        String captchaId5 = captchaStore.put("HH3R");
        assertThrows(BizException.class,
                () -> authService.login(buildLogin("99999999999", password, captchaId5, "HH3R")),
                "账号不存在应抛出业务异常");
    }

    @Test
    void captchaMustBeValid() {
        String username = uniqueUsername();

        // 1. 验证码错误应被拒绝
        String captchaId = captchaStore.put("AB2D");
        assertThrows(BizException.class,
                () -> authService.register(buildRegister(username, "banana123", captchaId, "XXXX")),
                "验证码错误应抛出业务异常");

        // 2. 验证码是一次性的：同一 captchaId 第二次使用应失败
        String username2 = uniqueUsername();
        String captchaId2 = captchaStore.put("GG7T");
        User okUser = authService.register(buildRegister(username2, "banana123", captchaId2, "GG7T"));
        assertNotNull(okUser.getId(), "注册成功");
        assertThrows(BizException.class,
                () -> authService.register(buildRegister(username2, "banana123", captchaId2, "GG7T")),
                "同一验证码重复使用应被拒绝");

        // 3. 不区分大小写：输入小写也能通过
        String username3 = uniqueUsername();
        String captchaId3 = captchaStore.put("K8LM");
        User user = authService.register(buildRegister(username3, "banana123", captchaId3, "k8lm"));
        assertNotNull(user.getId(), "小写验证码应能通过校验");
    }

    private RegisterRequest buildRegister(String username, String password, String captchaId, String captcha) {
        RegisterRequest req = new RegisterRequest();
        req.setUsername(username);
        req.setPassword(password);
        req.setCaptchaId(captchaId);
        req.setCaptcha(captcha);
        return req;
    }

    private LoginRequest buildLogin(String username, String password, String captchaId, String captcha) {
        LoginRequest req = new LoginRequest();
        req.setUsername(username);
        req.setPassword(password);
        req.setCaptchaId(captchaId);
        req.setCaptcha(captcha);
        return req;
    }
}
