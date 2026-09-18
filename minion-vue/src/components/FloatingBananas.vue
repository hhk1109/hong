<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: { type: Number, default: 5 }
})

/* 每片香蕉的位置 / 大小 / 动画延迟，与原始 CSS 保持一致 */
const presets = [
  { top: '12%', left: '8%', fontSize: '2rem', animationDelay: '0s' },
  { top: '70%', left: '15%', animationDelay: '1.2s', fontSize: '2.6rem' },
  { top: '20%', right: '10%', animationDelay: '2s', fontSize: '2rem' },
  { bottom: '12%', right: '14%', animationDelay: '0.6s', fontSize: '1.8rem' },
  { top: '50%', left: '6%', animationDelay: '3s', fontSize: '1.6rem' }
]

const items = computed(() => presets.slice(0, props.count))
</script>

<template>
  <svg
    v-for="(s, i) in items"
    :key="i"
    class="floaty"
    :style="s"
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <!-- 香蕉图形（替代原来的 emoji，跨平台渲染一致） -->
    <path
      d="M20 18 C22 52 44 76 78 80 C86 81 88 72 81 68 C52 52 36 36 32 16 C30 9 19 10 20 18 Z"
      fill="#FFE04B"
      stroke="#E0B600"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M26 24 C30 52 48 68 74 74"
      fill="none"
      stroke="#FFF3B0"
      stroke-width="3.5"
      stroke-linecap="round"
      opacity="0.9"
    />
    <path
      d="M20 18 C24 12 30 9 33 14"
      fill="none"
      stroke="#8B6B1F"
      stroke-width="5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.floaty {
  position: absolute;
  opacity: 0.35;
  user-select: none;
  pointer-events: none;
  animation: bob 6s ease-in-out infinite;
  z-index: 1;
}
</style>
