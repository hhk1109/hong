<script setup>
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'forgot', 'signup'])

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const errors = reactive({ username: '', password: '' })

/* 记住我：回填上次的用户名 */
onMounted(() => {
  const saved = localStorage.getItem('minion:username')
  if (saved) {
    form.username = saved
    form.remember = true
  }
})

function validate() {
  errors.username = ''
  errors.password = ''
  if (!form.username.trim()) errors.username = '请输入香蕉账号'
  if (!form.password) errors.password = '请输入密码'
  return !errors.username && !errors.password
}

function onSubmit() {
  if (props.loading) return
  if (!validate()) return
  emit('submit', {
    username: form.username.trim(),
    password: form.password,
    remember: form.remember
  })
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <form autocomplete="off" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <input
        v-model="form.username"
        type="text"
        placeholder="香蕉账号 / 用户名"
        aria-label="用户名"
      />
      <span class="icon" aria-hidden="true">🍌</span>
      <p v-if="errors.username" class="error">{{ errors.username }}</p>
    </div>

    <div class="field">
      <input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="密码（别告诉格鲁！）"
        aria-label="密码"
      />
      <span
        class="icon toggle-pass"
        :title="showPassword ? '隐藏密码' : '显示密码'"
        role="button"
        tabindex="0"
        @click="togglePassword"
        @keydown.enter="togglePassword"
        @keydown.space.prevent="togglePassword"
      >
        {{ showPassword ? '🙈' : '👁️' }}
      </span>
      <p v-if="errors.password" class="error">{{ errors.password }}</p>
    </div>

    <div class="remember">
      <label>
        <input v-model="form.remember" type="checkbox" />
        记住我
      </label>
      <a href="#" @click.prevent="emit('forgot')">忘记密码？</a>
    </div>

    <button type="submit" class="btn" :disabled="loading">
      {{ loading ? '登录中…' : '登 录 🍌' }}
    </button>

    <p class="register">
      还没有账号？ <a href="#" @click.prevent="emit('signup')">注册一个小黄人</a>
    </p>
  </form>
</template>

<style scoped>
form {
  padding: 0 30px;
}

.field {
  position: relative;
  margin-bottom: 16px;
}

.field input {
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 2px solid #ececec;
  border-radius: 16px;
  font-size: 1rem;
  color: var(--ink);
  background: #fbfbfb;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  font-family: inherit;
}

.field input:focus {
  border-color: var(--minion-yellow);
  box-shadow: 0 0 0 4px rgba(255, 217, 15, 0.25);
  background: #fff;
}

.field .icon {
  position: absolute;
  right: 14px;
  top: 22px;
  transform: translateY(-50%);
  font-size: 1.2rem;
  cursor: pointer;
  user-select: none;
}

.toggle-pass {
  transition: transform 0.15s;
}

.toggle-pass:hover,
.toggle-pass:focus-visible {
  transform: translateY(-50%) scale(1.15);
}

.error {
  color: #e05b5b;
  font-size: 0.78rem;
  margin: 6px 4px 0;
}

.remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--soft);
  margin: -2px 2px 18px;
}

.remember label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.remember input {
  accent-color: var(--minion-yellow-dark);
  width: 16px;
  height: 16px;
}

.remember a {
  color: var(--minion-blue-dark);
  text-decoration: none;
}

.remember a:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 18px;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: #5a4500;
  font-family: inherit;
  background: linear-gradient(180deg, var(--minion-yellow) 0%, var(--minion-yellow-dark) 100%);
  box-shadow: 0 8px 0 #d9a800, 0 12px 18px rgba(217, 168, 0, 0.4);
  transition: transform 0.08s, box-shadow 0.08s;
}

.btn:active:not(:disabled) {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #d9a800, 0 4px 8px rgba(217, 168, 0, 0.4);
}

.btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.register {
  text-align: center;
  margin-top: 18px;
  font-size: 0.9rem;
  color: var(--soft);
}

.register a {
  color: var(--minion-blue-dark);
  text-decoration: none;
  font-weight: bold;
}

.register a:hover {
  text-decoration: underline;
}
</style>
