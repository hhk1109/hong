<script setup>
import { ref } from 'vue'
import BananaLattice from './components/BananaLattice.vue'
import FloatingBananas from './components/FloatingBananas.vue'
import MinionPhoto from './components/MinionPhoto.vue'
import LoginForm from './components/LoginForm.vue'
import ToastMessage from './components/ToastMessage.vue'

/* ---------------- Toast 提示 ---------------- */
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}

/* ---------------- 登录逻辑 ---------------- */
const submitting = ref(false)

async function handleLogin({ username, password, captcha, remember }) {
  submitting.value = true
  try {
    // 这里替换成真实的登录接口，例如：
    // const res = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password, captcha })
    // })
    await new Promise((r) => setTimeout(r, 600))

    if (remember) {
      localStorage.setItem('minion:username', username)
    } else {
      localStorage.removeItem('minion:username')
    }

    showToast(`Bello, ${username}! 登录成功 🎉`)
  } catch (err) {
    showToast('🍌 哎呀，香蕉传送门出错了')
  } finally {
    submitting.value = false
  }
}

function handleForgot() {
  showToast('别担心，香蕉能帮你找回密码 🍌')
}

function handleSignup() {
  showToast('注册小黄人… Banana! 🍌🍌')
}
</script>

<template>
  <div class="page">
    <!-- 背景：先用香蕉照片铺满整屏 -->
    <BananaLattice :spacing="128" :height="150" :opacity="0.34" />
    <!-- 再叠一层会飘动的香蕉（大小/深浅/速度都不同，制造景深） -->
    <FloatingBananas :count="34" />

    <div class="card">
      <div class="card-top">
        <MinionPhoto />
      </div>

      <h1 class="title">小黄人登录</h1>
      <p class="subtitle">说 <b>"Bello!"</b> 然后进来玩吧 🍌</p>

      <LoginForm
        :loading="submitting"
        @submit="handleLogin"
        @forgot="handleForgot"
        @signup="handleSignup"
      />
    </div>

    <ToastMessage ref="toastRef" />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card {
  position: relative;
  width: 380px;
  max-width: 92vw;
  background: #fff;
  border-radius: 32px;
  padding: 0 0 30px;
  box-shadow: 0 24px 60px rgba(120, 90, 0, 0.32), 0 0 0 6px rgba(255, 255, 255, 0.35);
  z-index: 2;
  overflow: hidden;
  animation: pop 0.6s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.card-top {
  background:
    radial-gradient(circle at 50% 30%, #fffdf4 0%, #fff7d6 62%, #ffefad 100%);
  padding: 22px 0 16px;
  text-align: center;
  position: relative;
}

.card-top::after {
  content: "";
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 108%;
  height: 32px;
  background: var(--minion-yellow);
  border-radius: 50%;
}

.title {
  text-align: center;
  margin: 20px 0 4px;
  color: var(--ink);
  font-size: 1.5rem;
  letter-spacing: 1px;
}

.subtitle {
  text-align: center;
  color: var(--soft);
  font-size: 0.9rem;
  margin-bottom: 18px;
}

.subtitle :deep(b) {
  color: var(--minion-blue-dark);
}
</style>
