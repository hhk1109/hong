<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import CaptchaCanvas from './CaptchaCanvas.vue'

const props = defineProps({
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'forgot', 'signup'])

/* ---------------- 长度规则 ----------------
   账号：11 ~ 13 位数字
   密码：11 位以内
------------------------------------------- */
const USERNAME_MIN = 11
const USERNAME_MAX = 13
const PASSWORD_MAX = 11

const form = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const showPassword = ref(false)
const captchaRef = ref(null)
const errors = reactive({ username: '', password: '', captcha: '' })

/* 账号只允许数字，且最多 13 位 */
const usernameFilled = computed(() => form.username.replace(/\D/g, '').length)
const passwordLen = computed(() => form.password.length)

function onUsernameInput(e) {
  // maxlength 之外再兜一层：粘贴/输入法也可能带进非数字
  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, USERNAME_MAX)
  form.username = digitsOnly
  e.target.value = digitsOnly
}

/* 记住我：回填上次的账号 */
onMounted(() => {
  const saved = localStorage.getItem('minion:username')
  if (saved) {
    form.username = saved.replace(/\D/g, '').slice(0, USERNAME_MAX)
    form.remember = true
  }
})

/* 用户开始修改某一项时，立即清掉该项的旧报错，避免红字挂着不走 */
watch(
  () => form.username,
  () => {
    if (errors.username) errors.username = ''
  }
)
watch(
  () => form.password,
  () => {
    if (errors.password) errors.password = ''
  }
)
watch(
  () => form.captcha,
  () => {
    if (errors.captcha) errors.captcha = ''
  }
)

function validate() {
  errors.username = ''
  errors.password = ''
  errors.captcha = ''

  const u = form.username.trim()
  if (!u) {
    errors.username = '请输入账号'
  } else if (!/^\d+$/.test(u)) {
    errors.username = '账号只能是数字'
  } else if (u.length < USERNAME_MIN) {
    errors.username = `账号长度为 ${USERNAME_MIN}~${USERNAME_MAX} 位，还差 ${USERNAME_MIN - u.length} 位`
  } else if (u.length > USERNAME_MAX) {
    errors.username = `账号长度不能超过 ${USERNAME_MAX} 位`
  }

  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length > PASSWORD_MAX) {
    errors.password = `密码不能超过 ${PASSWORD_MAX} 位，当前 ${form.password.length} 位`
  }

  if (!form.captcha.trim()) {
    errors.captcha = '请输入验证码'
  } else if (captchaRef.value && !captchaRef.value.validate(form.captcha)) {
    errors.captcha = '验证码不正确'
    captchaRef.value.refresh()
    form.captcha = ''
  }

  return !errors.username && !errors.password && !errors.captcha
}

function onSubmit() {
  if (props.loading) return
  if (!validate()) return
  emit('submit', {
    username: form.username.trim(),
    password: form.password,
    captcha: form.captcha.trim(),
    remember: form.remember
  })
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

function onCaptchaChange() {
  errors.captcha = ''
  form.captcha = ''
}

defineExpose({ captchaRef })
</script>

<template>
  <form autocomplete="off" novalidate @submit.prevent="onSubmit">
    <!-- 账号：11~13 位数字 -->
    <div class="field">
      <input
        :value="form.username"
        type="text"
        inputmode="numeric"
        :maxlength="13"
        :placeholder="`账号（${11}~${13} 位数字）`"
        aria-label="账号，11 到 13 位数字"
        :aria-invalid="!!errors.username"
        @input="onUsernameInput"
      />
      <span class="icon" aria-hidden="true">🍌</span>
      <p class="counter" :class="{ warn: usernameFilled > 0 && usernameFilled < 11 }">
        {{ usernameFilled }}/13
      </p>
      <p v-if="errors.username" class="error">{{ errors.username }}</p>
    </div>

    <!-- 密码：11 位以内 -->
    <div class="field">
      <input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        :maxlength="11"
        placeholder="密码（11 位以内）"
        aria-label="密码，最多 11 位"
        :aria-invalid="!!errors.password"
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
      <p class="counter" :class="{ warn: passwordLen > 11 }">{{ passwordLen }}/11</p>
      <p v-if="errors.password" class="error">{{ errors.password }}</p>
    </div>

    <!-- 验证码 -->
    <div class="captcha-row">
      <div class="field captcha-input-wrap">
        <input
          v-model="form.captcha"
          type="text"
          :maxlength="4"
          placeholder="验证码"
          aria-label="验证码"
          autocomplete="off"
          spellcheck="false"
          :aria-invalid="!!errors.captcha"
        />
      </div>
      <CaptchaCanvas ref="captchaRef" :length="4" :width="108" :height="44" @change="onCaptchaChange" />
    </div>
    <p v-if="errors.captcha" class="error captcha-error">{{ errors.captcha }}</p>

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
  padding: 14px 72px 14px 16px;
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

.field input[aria-invalid="true"] {
  border-color: #f0a3a3;
  background: #fffafa;
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

/* 字数计数器 */
.counter {
  position: absolute;
  right: 46px;
  top: 22px;
  transform: translateY(-50%);
  font-size: 0.72rem;
  color: #b9b9b9;
  pointer-events: none;
  letter-spacing: 0.5px;
}

.counter.warn {
  color: #e8a33d;
}

.error {
  color: #e05b5b;
  font-size: 0.78rem;
  margin: 6px 4px 0;
}

/* ---------------- 验证码一行 ---------------- */
.captcha-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 0;
}

.captcha-input-wrap {
  flex: 1 1 auto;
  min-width: 0;
  margin-bottom: 16px;
}

.captcha-input-wrap input {
  padding: 14px 16px;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.captcha-row :deep(.captcha) {
  margin-top: 2px;
}

.captcha-error {
  margin: -12px 4px 14px;
}

.remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--soft);
  margin: 0 2px 18px;
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
