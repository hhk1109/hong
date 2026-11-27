## [16:15] - [功能实现]: 登录页按截图风格重构并加入 3D 视觉层次

- **文件**: `hong-main/stardew-login-page/index.html`, `hong-main/stardew-login-page/server.js`
- **决策**: 不修改打包后的 Vue 组件逻辑；将主题 CSS 与打包 JS 内联到 `index.html`，避开静态资源在 Chrome 中被错误返回 HTML 导致白屏的问题。样式用 `:has(.panel-wrap[data-v-c8d0c897])` 精确限定登录页。
- **验证**: agent-browser 桌面/375px/320px 截图；空提交与短口令 toast 文案不变；注册链接可达；`/api/auth/login` 代理返回 401 业务响应；axe violations 0；console errors 0。
