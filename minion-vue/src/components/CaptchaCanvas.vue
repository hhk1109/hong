<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  /* 验证码位数 */
  length: { type: Number, default: 4 },
  width: { type: Number, default: 108 },
  height: { type: Number, default: 44 }
})

const emit = defineEmits(['change'])

const canvasRef = ref(null)
const code = ref('')

/* 去掉容易看混的 0 O o 1 l I */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode() {
  let s = ''
  for (let i = 0; i < props.length; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return s
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const ctx = canvas.getContext('2d')

  canvas.width = props.width * dpr
  canvas.height = props.height * dpr
  canvas.style.width = `${props.width}px`
  canvas.style.height = `${props.height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const w = props.width
  const h = props.height

  /* 底色：淡淡的香蕉黄 */
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#fffdf0')
  bg.addColorStop(0.5, '#fff3bd')
  bg.addColorStop(1, '#ffe894')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  /* 干扰点 */
  for (let i = 0; i < 56; i++) {
    ctx.fillStyle = `rgba(${rand(120, 210)},${rand(110, 190)},${rand(20, 110)},${(
      0.15 +
      Math.random() * 0.3
    ).toFixed(2)})`
    ctx.beginPath()
    ctx.arc(rand(0, w), rand(0, h), Math.random() * 1.6 + 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  /* 干扰线 */
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${rand(150, 220)},${rand(130, 190)},${rand(30, 120)},0.5)`
    ctx.lineWidth = rand(1, 2)
    ctx.beginPath()
    ctx.moveTo(rand(0, w), rand(0, h))
    ctx.quadraticCurveTo(rand(0, w), rand(0, h), rand(0, w), rand(0, h))
    ctx.stroke()
  }

  /* 字符：逐个旋转、错位，颜色随机 */
  const step = w / (props.length + 0.5)
  const fontStack =
    '"Comic Sans MS","Segoe UI",Arial,sans-serif'

  for (let i = 0; i < code.value.length; i++) {
    const ch = code.value[i]
    const fontSize = rand(23, 29)
    const x = step * (i + 0.68)
    const y = h / 2 + rand(-3, 4)
    const angle = (rand(-26, 26) * Math.PI) / 180

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.font = `bold ${fontSize}px ${fontStack}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    /* 影子，增加层次 */
    ctx.fillStyle = 'rgba(120,90,0,0.18)'
    ctx.fillText(ch, 1.4, 1.6)

    ctx.fillStyle = ['#8a6a00', '#3b6fe0', '#c17800', '#2a55b8'][rand(0, 3)]
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  }

  /* 前景弧线，进一步干扰识别 */
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = 'rgba(255,217,15,0.75)'
    ctx.lineWidth = rand(1, 2)
    ctx.beginPath()
    ctx.moveTo(rand(0, w / 3), rand(0, h))
    ctx.quadraticCurveTo(w / 2, rand(-6, h + 6), w - rand(0, w / 3), rand(0, h))
    ctx.stroke()
  }
}

/** 重新生成验证码（外部也可通过 ref 调用） */
function refresh() {
  code.value = randomCode()
  draw()
  emit('change', code.value)
}

/** 校验，忽略大小写与首尾空格 */
function validate(input) {
  const v = (input || '').trim().toUpperCase()
  return v.length > 0 && v === code.value.toUpperCase()
}

onMounted(() => {
  refresh()
})

defineExpose({ refresh, validate, code })
</script>

<template>
  <div class="captcha">
    <canvas
      ref="canvasRef"
      class="captcha-canvas"
      role="img"
      aria-label="图形验证码，点击可刷新"
      title="看不清？点击换一张"
      @click="refresh"
    />
    <button
      type="button"
      class="captcha-refresh"
      title="看不清？点击换一张"
      aria-label="刷新验证码"
      @click="refresh"
    >
      🔄
    </button>
  </div>
</template>

<style scoped>
.captcha {
  position: relative;
  flex: 0 0 auto;
}

.captcha-canvas {
  display: block;
  border-radius: 12px;
  border: 2px solid #ececec;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.captcha-canvas:hover {
  border-color: var(--minion-yellow);
  box-shadow: 0 0 0 4px rgba(255, 217, 15, 0.22);
}

.captcha-refresh {
  position: absolute;
  right: -6px;
  top: -8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: var(--minion-yellow);
  color: #5a4500;
  font-size: 0.72rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(150, 120, 0, 0.35);
  transition: transform 0.25s;
}

.captcha-refresh:hover {
  transform: rotate(180deg) scale(1.12);
}
</style>
