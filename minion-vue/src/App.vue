<script setup>
import { ref, reactive, computed } from 'vue'
import FloatingBananas from './components/FloatingBananas.vue'
import MinionSvg from './components/MinionSvg.vue'
import LoginForm from './components/LoginForm.vue'
import ToastMessage from './components/ToastMessage.vue'

/* ---------------- Toast 提示 ---------------- */
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}

/* ---------------- 登录逻辑 ---------------- */
const submitting = ref(false)

async function handleLogin({ username, password, remember }) {
  submitting.value = true
  try {
    // 这里替换成真实的登录接口，例如：
    // const res = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
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
    <FloatingBananas :count="5" />

    <div class="card">
      <div class="card-top">
        <MinionSvg />
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
  width: 360px;
  max-width: 92vw;
  background: #fff;
  border-radius: 32px;
  padding: 0 0 34px;
  box-shadow: 0 24px 60px rgba(120, 90, 0, 0.28);
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
  background: linear-gradient(180deg, var(--minion-blue) 0%, var(--minion-blue-dark) 100%);
  padding: 22px 0 14px;
  text-align: center;
  position: relative;
}

.card-top::after {
  content: "";
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 108%;
  height: 30px;
  background: var(--minion-blue);
  border-radius: 50%;
}

.title {
  text-align: center;
  margin: 18px 0 4px;
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
