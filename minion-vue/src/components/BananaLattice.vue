<script setup>
import bananaUrl from '../assets/banana-cutout.png'

defineProps({
  spacing: { type: Number, default: 132 },
  height: { type: Number, default: 180 },
  opacity: { type: Number, default: 0.42 }
})
</script>

<template>
  <!-- 背景香蕉墙：真实香蕉照片抠图平铺 -->
  <svg class="banana-lattice" aria-hidden="true" focusable="false">
    <defs>
      <!-- 一组 4 片香蕉，位置/旋转/大小各不相同，避免看出平铺规律 -->
      <pattern
        id="bananaLatticePattern"
        :width="spacing * 4"
        :height="spacing * 2"
        patternUnits="userSpaceOnUse"
      >
        <image
          :href="bananaUrl"
          x="0"
          y="0"
          :height="height"
          :width="height * 0.33"
          :transform="`rotate(-18 ${height * 0.165} ${height / 2})`"
        />
        <image
          :href="bananaUrl"
          :x="spacing * 2 + 30"
          :y="spacing + 24"
          :height="height * 0.82"
          :width="height * 0.82 * 0.33"
          :transform="`rotate(158 ${spacing * 2 + 30 + height * 0.82 * 0.165} ${spacing + 24 + height * 0.41})`"
        />
        <image
          :href="bananaUrl"
          :x="spacing * 2 - 16"
          :y="spacing * 0.5"
          :height="height * 0.66"
          :width="height * 0.66 * 0.33"
          :transform="`rotate(36 ${spacing * 2 - 16 + height * 0.66 * 0.165} ${spacing * 0.5 + height * 0.33})`"
        />
        <image
          :href="bananaUrl"
          :x="spacing * 0.42"
          :y="spacing * 1.42"
          :height="height * 0.6"
          :width="height * 0.6 * 0.33"
          :transform="`rotate(-155 ${spacing * 0.42 + height * 0.6 * 0.165} ${spacing * 1.42 + height * 0.3})`"
        />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#bananaLatticePattern)" :opacity="opacity" />
  </svg>
</template>

<style scoped>
.banana-lattice {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  pointer-events: none;
}
</style>
