package com.fenglin.springboottest.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 用户进度接口鉴权：拦截 /api/progress，校验请求头 X-User-Token，
 * 校验通过后把令牌对应的账号写入请求属性 authAccount，控制器以该账号为准，
 * 避免前端冒名读写他人进度。
 */
@Configuration
public class ProgressAuthInterceptor implements HandlerInterceptor, WebMvcConfigurer {

    public static final String ATTR_ACCOUNT = "authAccount";

    @Autowired
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/progress");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String token = request.getHeader("X-User-Token");
        String account = userService.validateToken(token);
        if (account != null) {
            request.setAttribute(ATTR_ACCOUNT, account);
            return true;
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                Result.fail(401, "未登录或登录已过期，请重新登录")));
        return false;
    }
}
