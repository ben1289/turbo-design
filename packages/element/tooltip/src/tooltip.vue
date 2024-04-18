<script setup lang="ts">
import { computed, ref, toValue } from 'vue'
import { ElTooltip } from 'element-plus'
import { useElementSize } from '@vueuse/core'
import { pick } from 'lodash-es'

defineOptions({ name: 'TTooltip', inheritAttrs: false })

const outer = ref<HTMLElement | null>(null)
const inner = ref<HTMLElement | null>(null)
const { width: outerWidth } = useElementSize(outer)
const { width: innerWidth } = useElementSize(inner)
const isTip = computed(() => toValue(innerWidth) > toValue(outerWidth))
</script>

<template>
  <ElTooltip :disabled="!isTip" placement="top" v-bind="$attrs">
    <template #content>
      <slot />
    </template>

    <div ref="outer" class="t-tooltip" v-bind="pick($attrs, ['class', 'style'])">
      <div ref="inner" class="tooltip-content">
        <slot />
      </div>
      <slot />
    </div>
  </ElTooltip>
</template>

<style scoped lang="scss">
.t-tooltip {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .tooltip-content {
    display: inline-block;
    position: absolute;
    opacity: 0;
  }
}
</style>
