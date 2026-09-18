<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const svgRef = ref(null)
const leftEye = ref(null)
const rightEye = ref(null)

const MAX_OFFSET = 6 // 瞳孔最大位移(px)

function updateEyes(clientX, clientY) {
  ;[leftEye.value, rightEye.value].forEach((g) => {
    if (!g) return
    const r = g.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const ang = Math.atan2(dy, dx)
    const dist = Math.min(MAX_OFFSET, Math.hypot(dx, dy) / 20)
    g.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`
  })
}

/* 节流到下一帧，避免高频 mousemove 造成抖动 */
let ticking = false
let lastX = 0
let lastY = 0

function onMouseMove(e) {
  lastX = e.clientX
  lastY = e.clientY
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    updateEyes(lastX, lastY)
    ticking = false
  })
}

function onTouchMove(e) {
  const t = e.touches[0]
  if (t) updateEyes(t.clientX, t.clientY)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
})
</script>

<template>
  <svg
    ref="svgRef"
    class="minion"
    viewBox="0 0 200 200"
    role="img"
    aria-label="小黄人"
  >
    <!-- 身体 -->
    <ellipse cx="100" cy="120" rx="62" ry="70" fill="#FFD90F" stroke="#E0B600" stroke-width="3" />
    <!-- 背带裤上沿 -->
    <path d="M48 120 Q100 95 152 120 L150 150 Q100 132 50 150 Z" fill="#3B6FE0" />
    <!-- 左右背带 -->
    <rect x="62" y="92" width="10" height="40" rx="4" fill="#3B6FE0" />
    <rect x="128" y="92" width="10" height="40" rx="4" fill="#3B6FE0" />
    <!-- 中间纽扣 -->
    <circle cx="100" cy="128" r="6" fill="#2A55B8" />
    <!-- 口袋 -->
    <rect x="84" y="140" width="32" height="22" rx="4" fill="#2A55B8" />
    <!-- 手臂 -->
    <path d="M40 128 q-16 10 -14 34" stroke="#FFD90F" stroke-width="14" fill="none" stroke-linecap="round" />
    <path d="M160 128 q16 10 14 34" stroke="#FFD90F" stroke-width="14" fill="none" stroke-linecap="round" />
    <!-- 手套 -->
    <circle cx="25" cy="164" r="11" fill="#3A3A3A" />
    <circle cx="175" cy="164" r="11" fill="#3A3A3A" />
    <!-- 腿 -->
    <rect x="78" y="182" width="16" height="16" rx="6" fill="#3A3A3A" />
    <rect x="106" y="182" width="16" height="16" rx="6" fill="#3A3A3A" />
    <!-- 护目镜带 -->
    <rect x="40" y="62" width="120" height="14" rx="7" fill="#5a5a5a" />

    <!-- 左眼（跟随鼠标） -->
    <g ref="leftEye" class="goggle-eye">
      <circle cx="76" cy="74" r="30" fill="#e8e8e8" stroke="#5a5a5a" stroke-width="4" />
      <circle cx="76" cy="74" r="22" fill="#fff" />
      <circle cx="76" cy="74" r="11" fill="#6b4a2b" />
      <circle cx="76" cy="74" r="5" fill="#1a1a1a" />
      <circle cx="71" cy="69" r="3" fill="#fff" />
    </g>

    <!-- 右眼（跟随鼠标） -->
    <g ref="rightEye" class="goggle-eye">
      <circle cx="124" cy="74" r="30" fill="#e8e8e8" stroke="#5a5a5a" stroke-width="4" />
      <circle cx="124" cy="74" r="22" fill="#fff" />
      <circle cx="124" cy="74" r="11" fill="#6b4a2b" />
      <circle cx="124" cy="74" r="5" fill="#1a1a1a" />
      <circle cx="119" cy="69" r="3" fill="#fff" />
    </g>

    <!-- 头发 -->
    <path d="M86 48 q4 -14 8 0" stroke="#3A3A3A" stroke-width="3" fill="none" />
    <path d="M98 44 q4 -16 8 0" stroke="#3A3A3A" stroke-width="3" fill="none" />
    <path d="M110 48 q4 -14 8 0" stroke="#3A3A3A" stroke-width="3" fill="none" />
    <!-- 嘴巴 -->
    <path d="M88 108 q12 10 24 0" stroke="#7a5a2a" stroke-width="3" fill="none" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.minion {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  display: block;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.18));
  animation: bob 4s ease-in-out infinite;
}

/* 眼睛位移用 CSS 过渡做缓动；transform-origin 保持中心 */
.goggle-eye {
  transition: transform 0.12s ease-out;
  transform-origin: center;
}

.minion:hover {
  animation-play-state: paused;
}
</style>
