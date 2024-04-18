<script setup lang="ts">
import { computed, onMounted, provide, ref, toRef, toValue, useAttrs, watch } from 'vue'
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElMessageBox,
  ElPagination,
  ElPopover,
  ElScrollbar,
  ElTable,
  ElTooltip,
} from 'element-plus'
import { useStorage, watchIgnorable } from '@vueuse/core'
import { cloneDeep, groupBy } from 'lodash-es'
import draggable from 'vuedraggable/src/vuedraggable'
import { useElLoading, useLocale } from '@turbo-design/hooks'
import { MagicStick, Menu, Operation, Refresh, Search, Sort } from '@element-plus/icons-vue'
import type { ButtonInstance, TableInstance } from 'element-plus'
import { Tooltip } from '../../tooltip'
import QueryForm from './components/queryForm.vue'
import QuickQuery from './components/quickQuery.vue'
import AdvancedQuery from './components/advancedQuery.vue'
import TableColumn from './tableColumn.vue'
import type { Button, Column, QueryParams, SortParam, StoredColumn } from './types'
import type { TableProps } from './table'
import type { QueryParam } from './components/queryForm'

defineOptions({ name: 'TTable', inheritAttrs: false })

const props = withDefaults(defineProps<TableProps>(), {
  buttons: () => [],
  loading: false,
  columns: () => [],
  queryColumns: () => [],
  data: () => [],
  total: 0,
  pagerCount: document.body.clientWidth < 992 ? 5 : 7,
  rowHeight: 30,
  immediateQuery: true,
  refreshable: true,
  pagination: true,
  presetParams: () => [],
})

const emit = defineEmits<{
  (e: 'query', params: QueryParams, isReset: boolean): void
}>()

const attrs = useAttrs()

const propId = toRef(() => props.id)
const propColumns = toRef(() => props.columns)
const propQueryColumns = toRef(() => props.queryColumns)

provide('tableId', propId.value)
provide('columns', propColumns.value)
provide('queryColumns', propQueryColumns.value)

defineExpose({ getQueryParams, activeQuery, getElTable })

const { t } = useLocale()

/*
 * Button
 */
const showBtn = ref<ButtonInstance | null>(null)
const moreBtn = ref<ButtonInstance | null>(null)
const showButtons = ref<Button[]>([])
const moreButtons = ref<Button[]>([])
watch(
  () => props.buttons,
  (buttons) => {
    const { showBtn = [], moreBtn = [] } = groupBy(buttons, btn =>
      btn.pinMore ? 'moreBtn' : 'showBtn')
    showButtons.value = showBtn
    moreButtons.value = moreBtn
  },
  {
    immediate: true,
  },
)

/**
 * 控制按钮 disabled 状态
 * @param effect
 * @param rule
 */
function controlBtnDisabled(effect: Button['effect'], rule: Button['rule']): boolean {
  if (!enableSelection.value)
    return false
  const rowsLen = selectRows.value.length
  if (
    (effect === 'empty' && rowsLen !== 0)
    || (effect === 'single' && rowsLen !== 1)
    || (effect === 'multi' && rowsLen < 1)
  ) {
    return true
  }
  if (rule) {
    if (rowsLen > 0) {
      return !selectRows.value.every(row => rule(cloneDeep(row)))
    } else {
      return !rule()
    }
  }
  return false
}

/**
 * 按钮 click 事件
 * @param rawClick
 * @param disabled
 * @param effect
 */
function buttonClick(rawClick: Button['click'], disabled: boolean, effect: Button['effect']) {
  if (!rawClick || disabled)
    return
  let params: Parameters<typeof rawClick>[0]
  if (enableSelection.value) {
    if (!effect || effect === 'multi') {
      params = cloneDeep(selectRows.value)
    } else if (effect === 'single') {
      params = cloneDeep(selectRows.value[0])
    }
  }
  rawClick(params)
}

/*
 * 查询
 */
const quickQuery = ref<InstanceType<typeof QuickQuery> | null>(null)
const advancedQuery = ref<InstanceType<typeof AdvancedQuery> | null>(null)
const defaultQueryParams = toRef(() => props.presetParams.map(param => ({ ...param, value: '' })))
const storedQueryParams = propId.value
  ? useStorage<QueryParam[]>(`TableQueryParams_${propId.value}`, defaultQueryParams.value)
  : ref([])
const queryParams = ref<QueryParam[]>(cloneDeep(storedQueryParams.value))

watch(storedQueryParams, (storedParams) => {
  query(cloneDeep(storedParams))
})

/**
 * 查询
 * @param params
 */
function query(params: QueryParam[]) {
  queryParams.value = params
  emitQuery()
}

/**
 * 重置
 */
function resetQuery() {
  queryParams.value = []
  elTableRef.value?.clearSort()
  sortParams.value = null
  pageNoIgnoreWatch(() => {
    pageNo.value = 1
  })
  emitQuery(true)
}

/**
 * 保存查询参数
 * @param params
 */
function saveQueryParams(params: QueryParam[]) {
  storedQueryParams.value = params
}

/**
 * 恢复默认查询参数
 */
function initQueryParams() {
  storedQueryParams.value = defaultQueryParams.value
}

/**
 * 清除查询参数
 */
function clearQueryParams() {
  storedQueryParams.value = []
}

/**
 * 获取查询参数
 */
function getQueryParams() {
  let params = {}
  if (props.pagination) {
    params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }
  }
  if (props.id && queryParams.value.length > 0) {
    params = {
      ...params,
      params: queryParams.value,
    }
  }
  if (sortParams.value != null) {
    params = {
      ...params,
      sort: sortParams.value,
    }
  }
  return params
}

function emitQuery(isReset = false) {
  emit('query', getQueryParams(), isReset)
}

/**
 * 主动查询
 * @param options
 * @param options.reset
 * @param options.pageNo
 */
function activeQuery(options?: { reset?: boolean, pageNo?: number }) {
  const { reset = false, pageNo: pgNo } = options ?? {}
  if (reset) {
    resetQuery()
  } else {
    if (pgNo) {
      pageNoIgnoreWatch(() => {
        pageNo.value = pgNo
      })
    }
    emitQuery()
  }
}

/*
 * Checkbox
 */
const storedCols = propId.value
  ? useStorage<StoredColumn[]>(`TableCols_${propId.value}`, [])
  : ref([])
const showCols = ref<(string | number)[]>([])
const localColumns = ref<Column[]>([])

/**
 * 加载列配置
 */
function loadColsConfig() {
  if (storedCols.value.length > 0) {
    const columns = cloneDeep(props.columns)
    storedCols.value.forEach(({ id, show, width }) => {
      if (show) {
        showCols.value.push(id)
      }
      const tempCol = columns.find(col => col.id === id)
      if (tempCol) {
        tempCol.width = width
        localColumns.value.push(tempCol)
      }
    })
  } else {
    showCols.value = props.columns.filter(col => !col.defaultHide).map(col => col.id)
    localColumns.value = cloneDeep(props.columns)
  }
}
loadColsConfig()

/**
 * 重置列配置
 */
function resetColsConfig() {
  ElMessageBox.confirm(t('element.table.resetColTip'), t('element.common.tip'), { type: 'warning' })
    .then(() => {
      storedCols.value = []
      loadColsConfig()
    })
    .catch(() => null)
}

function cbLabelByCol(col: Column) {
  switch (col.type) {
    case 'selection':
      return t('element.table.selectCol')
    case 'index':
      return t('element.table.indexCol')
    case 'expand':
      return t('element.table.expandCol')
    default:
      return col.label ? col.label : t('element.table.unknownCol')
  }
}

/**
 * 保存列顺序及显示情况
 */
function saveColumns() {
  storedCols.value = localColumns.value.map(({ id, width }) => ({
    id,
    show: showCols.value.includes(id),
    width,
  }))
}

/*
 * table
 */
const tableBox = ref<HTMLElement | null>(null)
const elTableRef = ref<TableInstance | null>(null)
const selectRows = ref<Record<string, any>[]>([])
const enableSelection = computed(
  () => props.columns.findIndex(col => col.type === 'selection') !== -1,
)
const sortParams = ref<SortParam | null>(null)
let startIndex = 0

watch(
  () => props.data,
  (data: Record<string, any>[]) => {
    const rowKey = (attrs['row-key'] ?? attrs.rowKey) as string
    if (rowKey && selectRows.value.length > 0 && data?.length > 0) {
      // 刷新列表后保留选中的行，且赋予最新数据
      selectRows.value = toValue(selectRows).map(
        row => data.find(r => row[rowKey] === r[rowKey]) ?? row,
      )
    }
    // 计算当前页起始索引
    startIndex = (toValue(pageNo) - 1) * toValue(pageSize)
  },
)

/**
 * 根据高度自适应 table 行数
 */
onMounted(() => {
  if (props.pagination) {
    const tbHeight = tableBox.value?.clientHeight
    if (tbHeight) {
      const size = Math.round((tbHeight - 40) / props.rowHeight)
      if (size > 0) {
        if (!pageSizes.value.includes(size)) {
          pageSizes.value.push(size)
          pageSizes.value.sort((a, b) => a - b)
        }
        pageSizeIgnoreWatch(() => {
          pageSize.value = size
        })
      }
    }
  }

  useElLoading(
    toRef(() => props.loading),
    elTableRef.value?.$el,
  )

  if (!props.immediateQuery)
    return
  emitQuery()
})

/**
 * cell 单击事件
 * @param row
 * @param column
 * @param cell
 */
function cellClick(row: any, column: any, cell: HTMLElement) {
  if (!enableSelection.value)
    return
  const { type } = column
  if (type === 'selection' && !cell.querySelector('.el-checkbox.is-disabled')) {
    // @ts-expect-error  element-plus 类型声明 bug
    elTableRef.value?.toggleRowSelection(row)
  }
}

/**
 * cell 双击事件
 * @param row
 * @param column
 * @param cell
 */
function cellDblclick(row: any, column: any, cell: HTMLElement) {
  if (!enableSelection.value)
    return
  const { type } = column
  if (type !== 'selection' && !cell.parentElement?.querySelector('.el-checkbox.is-disabled')) {
    elTableRef.value?.clearSelection()
    elTableRef.value?.toggleRowSelection(row, true)
  }
}

/**
 * 行多选 change 事件
 * @param rows
 */
function rowsChange(rows: any) {
  if (!enableSelection.value)
    return
  if (props.singleSelection && rows.length > 1) {
    toValue(elTableRef)?.clearSelection()
    toValue(elTableRef)?.toggleRowSelection(rows[rows.length - 1], true)
    return
  }
  selectRows.value = rows
}

/**
 * 保存列拖拽宽度
 */
function colWidthChange(newWidth: any, _: any, column: any) {
  if (!props.id)
    return
  const localColumn = localColumns.value.find(col => col.id === column.columnKey)
  if (localColumn) {
    localColumn.width = newWidth
    saveColumns()
  }
}

/**
 * 列排序
 * @param prop
 * @param order
 */
function colSortChange({ prop, order }: any) {
  if (order) {
    sortParams.value = {
      fieldProp: prop,
      order: order.toString().replaceAll('ending', ''),
    }
  } else {
    sortParams.value = null
  }
  emitQuery()
}

/**
 * 自定义连续索引
 * @param index
 */
function customIndex(index: number) {
  return startIndex + index + 1
}

/**
 * 获取 elTableRef
 */
function getElTable(): TableInstance {
  return elTableRef.value as TableInstance
}

/*
 * Pagination
 */
const pageNo = ref(1)
const pageSize = ref(20)
const pageSizes = ref([10, 20, 30, 50, 100])

const { ignoreUpdates: pageNoIgnoreWatch } = watchIgnorable(pageNo, () => {
  emitQuery()
})

const { ignoreUpdates: pageSizeIgnoreWatch } = watchIgnorable(pageSize, (size) => {
  if (pageNo.value !== 1 && pageNo.value * size > props.total) {
    pageNo.value = 1
  }
  emitQuery()
})
</script>

<template>
  <div class="t-table">
    <QueryForm
      v-if="storedQueryParams.length > 0"
      :params="storedQueryParams"
      :form-item-width="formItemWidth"
      @query="query"
      @reset="resetQuery"
    />

    <div v-if="$slots.btnPrepend" class="btn-prepend">
      <slot name="btnPrepend" />
    </div>

    <div class="btn-box">
      <div style="flex: 1">
        <template v-for="(btn, i) in showButtons" :key="i">
          <ElButton
            ref="showBtn"
            :disabled="controlBtnDisabled(btn.effect, btn.rule)"
            v-bind="btn"
            @click="buttonClick(btn.click, (showBtn as any)?.[i].disabled, btn.effect)"
          >
            {{ btn.content }}
          </ElButton>
        </template>
        <ElPopover v-if="moreButtons.length > 0" trigger="click" popper-style="padding: 6px 0">
          <template #reference>
            <ElButton :icon="Menu">
              {{ t('element.common.more') }}
            </ElButton>
          </template>
          <ElScrollbar max-height="350px">
            <ul>
              <template v-for="(btn, i) in moreButtons" :key="i">
                <li>
                  <ElButton
                    ref="moreBtn"
                    text
                    :disabled="controlBtnDisabled(btn.effect, btn.rule)"
                    @click="buttonClick(btn.click, (moreBtn as any)?.[i].disabled, btn.effect)"
                  >
                    {{ btn.content }}
                  </ElButton>
                </li>
              </template>
            </ul>
          </ElScrollbar>
        </ElPopover>
      </div>
      <div>
        <ElTooltip v-if="refreshable" :content="t('element.common.refresh')">
          <ElButton :icon="Refresh" circle @click="emitQuery()" />
        </ElTooltip>
        <template v-if="id">
          <ElTooltip :content="t('element.table.quickSearch')">
            <ElButton :icon="Search" circle @click="quickQuery?.open" />
          </ElTooltip>
          <ElTooltip :content="t('element.table.advancedSearch')">
            <ElButton
              :icon="MagicStick"
              circle
              @click="advancedQuery?.open(cloneDeep(storedQueryParams))"
            />
          </ElTooltip>
          <ElPopover trigger="click" width="180px" @hide="saveColumns">
            <template #reference>
              <ElButton :icon="Operation" circle />
            </template>
            <ElScrollbar max-height="300px" view-style="padding: 0 8px">
              <ElCheckboxGroup v-model="showCols">
                <draggable
                  v-model="localColumns"
                  item-key="id"
                  handle=".drag-handle"
                  animation="200"
                >
                  <template #item="{ element: col }">
                    <div class="drag-item">
                      <ElCheckbox :label="col.id">
                        <Tooltip style="width: 90px">
                          {{ cbLabelByCol(col) }}
                        </Tooltip>
                      </ElCheckbox>
                      <ElIcon class="drag-handle">
                        <Sort />
                      </ElIcon>
                    </div>
                  </template>
                </draggable>
              </ElCheckboxGroup>
            </ElScrollbar>
            <ElButton style="width: 100%; margin-top: 8px" @click="resetColsConfig">
              {{ t('element.common.reset') }}
            </ElButton>
          </ElPopover>

          <QuickQuery ref="quickQuery" @query="query" @reset="resetQuery" />
          <AdvancedQuery
            ref="advancedQuery"
            :show-init="presetParams.length > 0"
            @query="query"
            @reset="resetQuery"
            @save-params="saveQueryParams"
            @init-params="initQueryParams"
            @clear-params="clearQueryParams"
          />
        </template>
      </div>
    </div>

    <div v-if="$slots.btnAppend" class="btn-append">
      <slot name="btnAppend" />
    </div>

    <div ref="tableBox" class="el-table-box">
      <ElTable
        ref="elTableRef"
        :class="{ 'single-selection': singleSelection }"
        height="100%"
        stripe
        :border="!!id"
        :data="data"
        v-bind="$attrs"
        @cell-click="cellClick"
        @cell-dblclick="cellDblclick"
        @selection-change="rowsChange"
        @header-dragend="colWidthChange"
        @sort-change="colSortChange"
      >
        <TableColumn
          v-for="column in localColumns?.filter((c: Column) => showCols.includes(c.id))"
          :key="column.id"
          :column="column"
          v-bind="column.type === 'index' ? { index: customIndex } : {}"
        >
          <template v-for="(_value, key) in $slots" :key="key" #[key]="scope">
            <slot :name="key" v-bind="scope" />
          </template>
        </TableColumn>
      </ElTable>
    </div>

    <ElPagination
      v-if="pagination"
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper, slot"
      background
      v-bind="paginationConfig"
    >
      <span style="margin-left: 10px">
        {{ t('element.table.totalPage', { pages: Math.ceil(total / pageSize) }) }}
      </span>
    </ElPagination>
  </div>
</template>

<style scoped lang="scss">
.t-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;

  .btn-box {
    display: flex;
    align-items: flex-end;
  }

  .el-table-box {
    position: relative;
    flex: 1;

    :deep(.el-table) {
      position: absolute;

      tr:has(td.el-table-column--selection .is-checked) td {
        background-color: #ecf5ff;
      }

      &.single-selection th.el-table-column--selection .cell {
        display: none;
      }

      td.el-table__cell {
        height: calc(v-bind(rowHeight) * 1px);
        padding: 0;

        &.cell-pointer {
          cursor: pointer;
        }
      }

      .cell {
        word-break: normal;
        overflow-wrap: break-word;
      }

      .el-popper {
        max-width: 20%;
      }
    }
  }

  .el-pagination {
    display: flex;
    justify-content: flex-end;
  }
}

ul {
  padding: 0;
  margin: 0;
  list-style-type: none;

  li > .el-button {
    width: 100%;
    justify-content: start;
  }
}

.drag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  line-height: 1.5rem;

  .drag-handle {
    cursor: move;
  }
}
</style>
