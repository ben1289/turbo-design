<script setup lang="ts">
import { nextTick, ref, toRef } from 'vue'
import { useWindowSize, watchThrottled } from '@vueuse/core'
import type { ScreenAdapterProps } from './screenAdapter'

defineOptions({ name: 'TScreenAdapter' })

const props = withDefaults(defineProps<ScreenAdapterProps>(), {
  width: 1920,
  height: 1080,
  throttle: 300,
})

const { width: windowWidth, height: windowHeight } = useWindowSize()
const screenContainer = ref<HTMLElement | null>(null)

watchThrottled(
  [windowWidth, windowHeight],
  ([width, height]) => {
    const widthRate = width / props.width
    const heightRate = height / props.height
    const rate = Math.min(widthRate, heightRate)
    nextTick(() => {
      if (screenContainer.value) {
        screenContainer.value.style.transform = `scale(${rate}) translate(-50%, -50%)`
      }
    })
  },
  { throttle: toRef(() => props.throttle), immediate: true },
)
</script>

<template>
  <div class="t-screen-adapter">
    <div ref="screenContainer" class="screen-container">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.t-screen-adapter {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  :deep(.screen-container) {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(v-bind(width) * 1px);
    height: calc(v-bind(height) * 1px);
    transform-origin: left top;
    transition: all 0.3s;
  }
}
</style>
