# 小黄人登录 · Minion Login (Vue 3 版)

由原单文件 HTML（`minion-login.html`）重构而成的 Vue 3 + Vite 项目。

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器 → http://localhost:5173
npm run build   # 打包到 dist/
npm run preview # 本地预览打包结果
```

## 目录结构

```
minion-vue/
├── index.html                     # 应用入口（Vite 模板）
├── package.json
├── vite.config.js                 # Vite 配置（@ 别名 / base: './'）
├── .gitignore
├── README.md
├── public/                        # 静态资源，原样拷贝
└── src/
    ├── main.js                    # 应用启动入口
    ├── App.vue                    # 页面骨架 + 登录业务逻辑
    ├── assets/
    │   └── main.css               # 全局样式：设计变量 / 页面底色 / 公共动画
    └── components/
        ├── FloatingBananas.vue    # 背景飘浮香蕉
        ├── MinionSvg.vue          # 小黄人 SVG + 眼睛跟随鼠标
        ├── LoginForm.vue          # 登录表单（校验 / 密码显隐 / 记住我）
        └── ToastMessage.vue       # 底部提示气泡
```

## 相比原版 HTML 的改动

**架构拆分**：原本一个 283 行的 `minion-login.html`（HTML + CSS + JS 全混在一起）按职责拆成 4 个组件 + 1 个全局样式文件。

**状态管理改为响应式**：原先用 `document.getElementById` 手动读值、手动操作 DOM class，
现在改用 Vue 的 `ref` / `reactive` + `v-model`，UI 完全由数据驱动。

| 原版做法 | Vue 版做法 |
| --- | --- |
| `document.getElementById('password').value` | `v-model="form.password"` |
| `pass.type = pass.type === 'password' ? ...` | `:type="showPassword ? 'text' : 'password'"` |
| `toast.classList.add('show')` + `setTimeout` | `<Transition>` 组件 + `defineExpose` 暴露的 `show()` |
| 逐行 `forEach` 遍历眼睛元素 | `ref` 绑定 + `v-for` / 组件复用 |
| 内联 `style.transform` 直接改 DOM | 保留（眼睛位移属高频动画，直接改 style 性能更优） |

**新增能力**：

- 表单校验，用户名/密码为空时逐字段提示（原版只在提交时弹一句 toast）
- 「记住我」真正生效 —— 用户名存入 `localStorage`，下次自动回填
- 提交按钮 loading 态，防止重复提交
- 图形替换为 SVG 香蕉（原版用 🍌 emoji，在不同系统渲染差异大）
- 移动端 `touchmove` 支持，眼睛在手机上也能跟着手指转
- 无障碍：`role` / `aria-label` / `aria-live`、键盘可操作、支持 `prefers-reduced-motion`

## 接后端接口

登录逻辑集中在 `src/App.vue` 的 `handleLogin`，把注释里的假请求换成真实接口即可：

```js
async function handleLogin({ username, password, remember }) {
  submitting.value = true
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!res.ok) throw new Error('登录失败')
    // ... 登录成功后的跳转 / 存 token
  } finally {
    submitting.value = false
  }
}
```

跨域调试时在 `vite.config.js` 里加 `server.proxy` 即可。

## 说明

`vite.config.js` 中设置了 `base: './'`，因此 `npm run build` 产物可以直接双击
`dist/index.html` 打开（无需起服务器）。
