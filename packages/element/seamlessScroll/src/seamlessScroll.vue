<script setup lang="ts">
import { computed, ref, toValue, watchEffect } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { SeamlessScrollProps } from './seamlessScroll'

defineOptions({ name: 'TSeamlessScroll' })

const props = withDefaults(defineProps<SeamlessScrollProps>(), {
  speed: 24,
  direction: 'vertical',
})

const container = ref<HTMLElement | null>(null)
const wrapper = ref<HTMLElement | null>(null)
const { height: containerHeight } = useElementSize(container)
const { height: wrapperHeight } = useElementSize(wrapper)

const enableScroll = ref(false)
watchEffect(() => {
  enableScroll.value
    = (toValue(enableScroll) ? toValue(wrapperHeight) / 2 : toValue(wrapperHeight))
    > toValue(containerHeight)
})

const speed = computed(() =>
  toValue(enableScroll) ? toValue(wrapperHeight) / (props.speed * 2) : 0,
)

const translate = computed(() =>
  props.direction === 'vertical' ? 'translateY(-50%)' : 'translateX(-50%)',
)
</script>

<template>
  <div ref="container" class="t-seamless-scroll">
    <div ref="wrapper" class="scroll-wrapper" :class="{ 'is-scroll': enableScroll }">
      <slot />
      <slot v-if="enableScroll" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes scroll {
  to {
    transform: v-bind(translate);
  }
}

.t-seamless-scroll {
  overflow: hidden;

  .scroll-wrapper.is-scroll {
    animation: scroll calc(v-bind(speed) * 1s) linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  }
}
</style>
