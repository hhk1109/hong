<script setup>
import { computed } from 'vue'
import bananaUrl from '../assets/banana-cutout.png'

const props = defineProps({
  count: { type: Number, default: 34 }
})

/* 用确定性伪随机生成位置，保证每次刷新布局一致、不闪动 */
function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

const ITEMS = 34

const items = computed(() => {
  const list = []
  for (let i = 0; i < Math.min(props.count, ITEMS); i++) {
    const r1 = pseudoRandom(i + 1)
    const r2 = pseudoRandom(i + 101)
    const r3 = pseudoRandom(i + 211)
    const r4 = pseudoRandom(i + 307)
    const r5 = pseudoRandom(i + 419)

    // 香蕉照片是竖长条（宽:高 ≈ 1:3），按高度分档制造景深
    const h = 56 + Math.round(r1 * 96) // 56 ~ 152 px
    const opacity = 0.3 + r2 * 0.4 // 0.30 ~ 0.70

    list.push({
      src: bananaUrl,
      left: `${(r3 * 96).toFixed(2)}%`,
      top: `${(r4 * 92).toFixed(2)}%`,
      height: `${h}px`,
      opacity: opacity.toFixed(2),
      // 每片香蕉的初始旋转 + 浮动幅度都不一样
      '--rot': `${Math.round(-60 + r5 * 120)}deg`,
      '--rise': `${Math.round(16 + r2 * 30)}px`,
      '--sway': `${Math.round(-14 + r1 * 28)}px`,
      animationDelay: `${(r3 * 7).toFixed(2)}s`,
      animationDuration: `${(5 + r4 * 5).toFixed(2)}s`
    })
  }
  return list
})
</script>

<template>
  <div class="banana-field" aria-hidden="true">
    <img
      v-for="(s, i) in items"
      :key="i"
      class="floaty"
      :style="s"
      :src="s.src"
      alt=""
      draggable="false"
    />
  </div>
</template>

<style scoped>
.banana-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.floaty {
  position: absolute;
  width: auto;
  user-select: none;
  pointer-events: none;
  transform-origin: center;
  animation-name: bananaFloat;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform;
  filter: drop-shadow(0 6px 8px rgba(120, 90, 0, 0.18));
}

/* 旋转 + 上下浮动 + 左右轻摆，用 CSS 变量让每片香蕉互不同步 */
@keyframes bananaFloat {
  0% {
    transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg));
  }
  50% {
    transform: translate3d(var(--sway, 10px), calc(var(--rise, 22px) * -1), 0)
      rotate(calc(var(--rot, 0deg) + 14deg));
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg));
  }
}
</style>
