<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElDialog, ElIcon, ElScrollbar } from 'element-plus'
import { useLocale } from '@turbo-design/hooks'
import type { ScrollbarInstance } from 'element-plus'
import type { DialogProps } from './dialog'

defineOptions({ name: 'TDialog', inheritAttrs: false })

const props = withDefaults(defineProps<DialogProps>(), {
  title: '',
  showFooter: true,
  defaultFullscreen: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', visible: boolean): void
  (e: 'cancel', loading: { start: () => boolean, end: () => boolean }): void
  (e: 'confirm', loading: { start: () => boolean, end: () => boolean }): void
}>()

const { t } = useLocale()

const visible = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  },
})

const fullscreen = ref(false)
watch(
  () => props.defaultFullscreen,
  () => {
    fullscreen.value = props.defaultFullscreen
  },
  { immediate: true },
)

const scrollbar = ref<ScrollbarInstance | null>(null)

const cancelLoading = ref(false)
function cancelHandler() {
  emit('cancel', {
    start: () => (cancelLoading.value = true),
    end: () => (cancelLoading.value = false),
  })
}

const confirmLoading = ref(false)
function confirmHandler() {
  emit('confirm', {
    start: () => (confirmLoading.value = true),
    end: () => (confirmLoading.value = false),
  })
}
</script>

<template>
  <ElDialog
    v-bind="$attrs"
    v-model="visible"
    class="t-dialog"
    :close-on-click-modal="false"
    :fullscreen="fullscreen"
    align-center
    draggable
    @close="scrollbar?.setScrollTop(0)"
    @closed="fullscreen = defaultFullscreen"
  >
    <template #header>
      <span>{{ title }}</span>
      <ElButton link @click="fullscreen = !fullscreen">
        <ElIcon>
          <svg
            v-if="!fullscreen"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M5 5h5v2H7v3H5V5m9 0h5v5h-2V7h-3V5m3 9h2v5h-5v-2h3v-3m-7 3v2H5v-5h2v3h3Z"
            />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M14 14h5v2h-3v3h-2v-5m-9 0h5v5H8v-3H5v-2m3-9h2v5H5V8h3V5m11 3v2h-5V5h2v3h3Z"
            />
          </svg>
        </ElIcon>
      </ElButton>
    </template>

    <ElScrollbar ref="scrollbar">
      <slot />
    </ElScrollbar>

    <template v-if="showFooter" #footer>
      <slot name="footer">
        <ElButton :loading="cancelLoading" @click="cancelHandler">
          {{ cancelText ?? t('element.dialog.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="confirmLoading" @click="confirmHandler">
          {{ confirmText ?? t('element.dialog.confirm') }}
        </ElButton>
      </slot>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.el-dialog.t-dialog {
  display: grid;
  grid-template-rows: auto 1fr auto;

  &:not(.is-fullscreen) {
    max-height: 95vh;
  }

  .el-dialog__header {
    display: flex;
    gap: 10px;
    margin: 0;

    & > span {
      flex: 1;
      font-size: 18px;
    }

    & > button {
      display: inline-flex;
      align-items: center;
      position: unset;
      width: auto;
      height: auto;
      font-size: 20px;

      &.el-dialog__headerbtn {
        font-size: 18px;
      }

      & > * {
        color: var(--el-button-text-color);
        transition: color 0.3s;
      }

      &:hover > * {
        color: var(--el-color-primary);
      }
    }
  }

  .el-dialog__body {
    padding: 10px 20px;
    overflow: hidden;

    & > .el-scrollbar {
      padding-right: 15px;
      margin-right: -15px;
    }
  }
}
</style>
