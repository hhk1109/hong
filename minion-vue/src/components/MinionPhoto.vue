<script setup>
import bobImg from '../assets/minion-bob.jpg'
</script>

<template>
  <div class="minion-stage">
    <!-- 抱泰迪熊的 Bob（用户提供的电影剧照） -->
    <img
      :src="bobImg"
      class="minion-photo"
      alt="小黄人 Bob 抱着泰迪熊"
      draggable="false"
    />
  </div>
</template>

<style scoped>
.minion-stage {
  position: relative;
  display: flex;
  justify-content: center;
}

/* 白底照片用 multiply 混合，白底自然融入浅色头部。
   注意：不能加 filter（drop-shadow 会让 mix-blend-mode 失效） */
.minion-photo {
  width: 168px;
  height: auto;
  display: block;
  mix-blend-mode: multiply;
  animation: bob 4s ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
}

.minion-stage:hover .minion-photo {
  animation-play-state: paused;
}
</style>
