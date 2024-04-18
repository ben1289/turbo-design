<script setup lang="ts">
import { computed, onMounted, ref, toRef, toValue, useSlots } from 'vue'
import { ElPagination } from 'element-plus'
import { throttleFilter, useElementSize, watchIgnorable } from '@vueuse/core'
import { useElLoading, useLocale } from '@turbo-design/hooks'
import type { GridCardProps } from './gridCard'

defineOptions({ name: 'TGridCard' })

const props = withDefaults(defineProps<GridCardProps>(), {
  width: 400,
  height: 200,
  gap: 10,
  loading: false,
  data: () => [],
  total: 0,
  pagerCount: document.body.clientWidth < 992 ? 5 : 7,
})

const emit = defineEmits<{
  (e: 'query', params: { pageNo: number, pageSize: number }): void
}>()

const slots = useSlots()

defineExpose({ getQueryParams, activeQuery })

const { t } = useLocale()

/*
 * 网格卡片
 */
const gridContainer = ref<HTMLElement | null>(null)
const { width: containerWidth, height: containerHeight } = useElementSize(gridContainer)
const rowNum = computed(() =>
  Math.floor((toValue(containerHeight) + props.gap) / (props.height + props.gap)),
)
const colNum = computed(() =>
  Math.floor((toValue(containerWidth) + props.gap) / (props.width + props.gap)),
)
const renderCard = ref(true)

onMounted(() => {
  useElLoading(
    toRef(() => props.loading),
    gridContainer.value as HTMLElement,
  )
})

/*
 * 分页
 */
const pageNo = ref(1)
const pageSize = computed(() => {
  let size = toValue(rowNum) * toValue(colNum)
  if (slots.fixed) {
    size--
  }
  return size
})

const { ignoreUpdates: ignorePageUpdates } = watchIgnorable([pageNo, pageSize], emitQuery, {
  eventFilter: throttleFilter(500),
})

function emitQuery() {
  renderCard.value = toValue(pageNo) > 0 && toValue(pageSize) > 0
  if (toValue(renderCard)) {
    emit('query', getQueryParams())
  }
}

function getQueryParams() {
  return { pageNo: toValue(pageNo), pageSize: toValue(pageSize) }
}

function activeQuery({ reset } = { reset: false }) {
  if (reset) {
    ignorePageUpdates(() => {
      pageNo.value = 1
    })
  }
  emitQuery()
}
</script>

<template>
  <div class="t-grid-card">
    <div ref="gridContainer" class="grid-container">
      <div v-if="$slots.fixed" class="grid-card is-fixed">
        <slot name="fixed" />
      </div>
      <template v-if="renderCard">
        <div
          v-for="(item, index) in data"
          :key="cardKey ? item[cardKey] : index"
          class="grid-card"
          :class="{ 'has-title': $slots.title }"
        >
          <template v-if="$slots.title">
            <div class="card-title">
              <slot name="title" v-bind="item" />
            </div>
            <div class="card-content">
              <slot v-bind="item" />
              <template v-if="$slots.panel">
                <img
                  class="pull-up-icon"
                  src="./assets/images/pullUp.svg"
                  alt=""
                  draggable="false"
                >
                <div class="card-panel">
                  <slot name="panel" v-bind="item" />
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <slot v-bind="item" />
            <template v-if="$slots.panel">
              <img class="pull-up-icon" src="./assets/images/pullUp.svg" alt="" draggable="false">
              <div class="card-panel">
                <slot name="panel" v-bind="item" />
              </div>
            </template>
          </template>
        </div>
      </template>
    </div>
    <ElPagination
      v-model:current-page="pageNo"
      :page-size="pageSize"
      :pager-count="pagerCount"
      :total="total"
      layout="total, prev, pager, next, jumper, slot"
      background
    >
      <span style="margin-left: 10px">
        {{ t('element.gridCard.totalPage', { pages: Math.ceil(total / pageSize) }) }}
      </span>
    </ElPagination>
  </div>
</template>

<style scoped lang="scss">
.t-grid-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .grid-container {
    display: grid;
    grid-template:
      repeat(v-bind(rowNum), calc(v-bind(height) * 1px))
      / repeat(v-bind(colNum), calc(v-bind(width) * 1px));
    grid-gap: calc(v-bind(gap) * 1px);
    justify-content: center;
    flex: 1;
    margin: -5px;
    padding: 5px;
    overflow: hidden;

    .grid-card {
      position: relative;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 1.5px 2.5px 8px rgba(64, 158, 255, 0.6);
      }

      &.has-title {
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .card-content {
        position: relative;
      }

      .pull-up-icon {
        position: absolute;
        bottom: 3px;
        left: calc(50% - 10px);
        width: 20px;
        animation: float 3s ease-in-out infinite;

        &:hover + .card-panel {
          @extend .card-panel-hover;
        }
      }

      .card-panel {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(12px);
        border-radius: 8px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;

        &:hover {
          @extend .card-panel-hover;
        }
      }

      .card-panel-hover {
        top: 0;
        opacity: 1;
        visibility: visible;
      }
    }
  }

  & > .el-pagination {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
}

@keyframes float {
  from {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  to {
    transform: translateY(0);
  }
}
</style>
