<script setup>
import { ref, onBeforeUnmount } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

function show(msg, duration = 2200) {
  message.value = msg
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, duration)
}

function hide() {
  clearTimeout(timer)
  visible.value = false
}

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ show, hide })
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" role="status" aria-live="polite">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  background: var(--ink);
  color: #fff;
  padding: 14px 26px;
  border-radius: 30px;
  font-size: 1rem;
  z-index: 99;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.2, 1.2, 0.4, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(120px);
}
</style>
