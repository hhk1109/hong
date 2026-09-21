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
    │   ├── main.css               # 全局样式：设计变量 / 香蕉底色 / 公共动画
    │   ├── minion-bob.jpg         # 小黄人 Bob 剧照（白底，multiply 混合用）
    │   └── banana-cutout.png      # 香蕉照片抠图（透明背景）
    └── components/
        ├── BananaLattice.vue      # 背景香蕉墙（照片抠图 SVG pattern 平铺）
        ├── FloatingBananas.vue    # 背景飘浮香蕉（34 片照片，确定性随机布局）
        ├── CaptchaCanvas.vue      # 图形验证码（Canvas 绘制 / 点击刷新 / 校验）
        ├── MinionPhoto.vue        # 小黄人剧照（multiply 混合融入头部）
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

## 页面改造说明（最新一版：真实照片版）

素材为用户提供的两张图片：小黄人 Bob 抱泰迪熊的剧照（`src/assets/minion-bob.jpg`）、
真香蕉照片（已抠图去蓝底去手，`src/assets/banana-cutout.png`）。

| 项目 | 改动 |
| --- | --- |
| 背景 | 两层真实香蕉照片：底层是香蕉抠图 `<pattern>` 平铺墙（`BananaLattice.vue`），上层是 34 片会飘动的香蕉照片（`FloatingBananas.vue`），大小/透明度/速度各不相同做出景深 |
| 小黄人 | 换成电影剧照（`MinionPhoto.vue`）：白底照片用 `mix-blend-mode: multiply` 融入浅色头部渐变，保留上下浮动动画。**注意不能加 `filter`，drop-shadow 会使混合失效** |
| 验证码 | `CaptchaCanvas.vue`：Canvas 绘制 4 位字符，干扰线/噪点/随机旋转颜色，点击或 🔄 刷新，字符集剔除易混的 `0Oo1lI`，校验忽略大小写 |
| 账号长度 | **11 ~ 13 位数字**，`maxlength=13` + 实时过滤非数字，`n/13` 计数，不足提示还差几位 |
| 密码长度 | **11 位以内**，`maxlength=11`，`n/11` 计数 |

香蕉抠图由 Python 脚本处理：蓝色背景按「R 通道显著大于 B」剔除、手部/袖口按区域置透明、
手指压在香蕉上的部分用邻近黄色像素修补、alpha 收边 + 羽化去蓝边。

`FloatingBananas.vue` 用 `Math.sin` 做确定性伪随机，每次刷新香蕉布局一致，不会闪烁。

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
