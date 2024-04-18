<script setup lang="ts">
import { computed, ref, toValue } from 'vue'
import { ElIcon, ElInfiniteScroll, ElPopover, ElScrollbar } from 'element-plus'
import { onClickOutside } from '@vueuse/core'
import { useLocale } from '@turbo-design/hooks'
import { Check } from '@element-plus/icons-vue'
import type { ScrollbarInstance } from 'element-plus'
import type { MaybeElementRef } from '@vueuse/core'
import type { GetFetchData } from '../types'
import type { PopoverScrollPanelProps } from './popoverScrollPanel'

defineOptions({ name: 'PopoverScrollPanel' })

const props = withDefaults(defineProps<PopoverScrollPanelProps>(), {
  multiple: false,
  labelKey: 'label',
  valueKey: 'value',
})

const emit = defineEmits<{
  (e: 'change', rows: Row | Row[]): void
}>()

const vInfiniteScroll = ElInfiniteScroll

defineExpose({ show, setSelectRows, singleRowSelect })

const { t } = useLocale()

type Row = GetFetchData<typeof props.fetchData>

const poVisible = ref(false)
let queryStr = ''
let pageNo = 1
const scrollLoading = ref(false)
const dataRows = ref<Row[]>([])
const dataTotal = ref(0)
const dataIsEmpty = computed<boolean>(() => dataRows.value.length === 0)
const scrollDisabled = computed<boolean>(
  () => scrollLoading.value || dataIsEmpty.value || dataRows.value.length >= dataTotal.value,
)

const scrollbar = ref<ScrollbarInstance | null>(null)
onClickOutside(scrollbar as MaybeElementRef, (e) => {
  if (props.referenceRef?.$el.contains(e.target))
    return
  poVisible.value = false
})

/**
 * 对外暴露 显示并根据 str 查询
 * @param str
 */
async function show(str: string) {
  queryStr = str
  pageNo = 1
  dataRows.value = []
  if (queryStr) {
    poVisible.value = true
    scrollLoading.value = true
    const params = { queryStr, pageNo, pageSize: 20 }
    const { data, total } = await props.fetchData(params)
    scrollLoading.value = false
    dataRows.value = data
    dataTotal.value = total
  }
}

/**
 * 对外暴露 若只有一行则选中
 */
function singleRowSelect() {
  if (dataRows.value.length === 1) {
    rowClick(dataRows.value[0]!)
    poVisible.value = false
  }
}

/**
 * 滚动加载事件
 */
async function scrollLoadHandler() {
  pageNo++
  scrollLoading.value = true
  const params = { queryStr, pageNo, pageSize: 20 }
  const { data } = await props.fetchData(params)
  scrollLoading.value = false
  dataRows.value.push(...data)
}

const selectRows = ref<Row[]>([])
function rowClick(row: Row) {
  if (props.multiple) {
    const index = selectRows.value.findIndex(r => r[props.valueKey] === row[props.valueKey])
    if (index !== -1) {
      selectRows.value.splice(index, 1)
    } else {
      selectRows.value.push(row)
    }
    emit('change', toValue(selectRows))
  } else {
    emit('change', row)
    poVisible.value = false
  }
}

/**
 * 对外暴露 设置选中的行
 * @param rows
 */
function setSelectRows(rows: Row[]) {
  selectRows.value = rows
}
</script>

<template>
  <ElPopover
    :visible="poVisible"
    :width="referenceRef?.$el.clientWidth ?? 200"
    :disabled="!!$attrs.disabled"
    popper-style="padding: 6px 0"
  >
    <template #reference>
      <slot name="reference" />
    </template>

    <ElScrollbar ref="scrollbar" max-height="230px">
      <ul v-infinite-scroll="scrollLoadHandler" :infinite-scroll-disabled="scrollDisabled">
        <li
          v-for="(row, index) in dataRows"
          :key="row[valueKey] ?? index"
          :class="{ 'is-selected': selectRows.some((r: Row) => r[valueKey] === row[valueKey]) }"
          @click="rowClick(row)"
        >
          <span>{{ row[labelKey] }}</span>
          <ElIcon><Check /></ElIcon>
        </li>
        <li v-if="scrollLoading" class="msg-tip">
          {{ t('element.input.loading') }}
        </li>
        <li v-else-if="dataIsEmpty" class="msg-tip">
          {{ t('element.input.empty') }}
        </li>
      </ul>
    </ElScrollbar>
  </ElPopover>
</template>

<style scoped lang="scss">
ul {
  margin: 0;
  padding: 0;
  list-style-type: none;

  li {
    &:not(.msg-tip) {
      display: flex;
      justify-content: space-between;
      padding: 5px 15px;
      cursor: pointer;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .el-icon {
        display: none;
      }
    }

    &.msg-tip {
      padding: 10px 15px;
      text-align: center;
    }

    &.is-selected {
      color: var(--el-color-primary);
      font-weight: bold;

      .el-icon {
        display: unset;
      }
    }
  }
}
</style>
