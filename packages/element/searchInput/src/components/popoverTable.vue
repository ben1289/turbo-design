<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElButton, ElInput, ElPagination, ElPopover, ElTable, ElTableColumn } from 'element-plus'
import { differenceWith, isEqual } from 'lodash-es'
import { useElLoading, useLocale } from '@turbo-design/hooks'
import { Search } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'
import type { GetFetchData } from '../types'
import type { PopoverTableProps } from './popoverTable'

defineOptions({ name: 'PopoverTable' })

const props = withDefaults(defineProps<PopoverTableProps>(), {
  multiple: false,
  alwaysFetch: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', rows: Row[]): void
}>()

const { t } = useLocale()

type Row = GetFetchData<typeof props.fetchData>

const poVisible = ref(false)
const tableRef = ref<TableInstance | null>(null)
const loading = ref(false)
const queryStr = ref('')
const tbData = ref<Row[]>([])
const tbTotal = ref(0)
const selectRows = computed({
  get() {
    return props.modelValue
  },
  set(rows) {
    emit('update:modelValue', rows)
  },
})
const pageNo = ref(1)
const pageSize = ref(20)

watch([pageNo, pageSize], () => {
  query()
})

nextTick(() => {
  useElLoading(loading, tableRef.value?.$el)
})

async function query() {
  loading.value = true
  const params = {
    queryStr: queryStr.value,
    pageNo: pageNo.value,
    pageSize: pageSize.value,
  }
  const { data, total } = await props.fetchData(params)
  loading.value = false
  tbData.value = data
  tbTotal.value = total
  setSelectionRows()
}

function beforeEnterHandler() {
  if (props.alwaysFetch || tbData.value.length === 0) {
    queryStr.value = ''
    pageNo.value = 1
    query()
  } else {
    setSelectionRows()
  }
}

function rowClick(row: Row) {
  // @ts-expect-error  element-plus 类型声明 bug
  tableRef.value?.toggleRowSelection(row)
}

function rowSelChange(rows: Row[]) {
  selectRows.value = rows
}

function rowDblclick(row: Row) {
  selectRows.value = [row]
  poVisible.value = false
}

function setSelectionRows() {
  if (!props.multiple || !props.rowKey || !tableRef.value)
    return
  const selectedRows = tableRef.value.getSelectionRows()
  const unSelection = differenceWith(selectedRows, selectRows.value, isEqual)
  const selection = differenceWith(selectRows.value, selectedRows, isEqual).map(
    row => tbData.value.find(data => isEqual(row, data)) ?? row,
  )
  for (const row of unSelection) {
    tableRef.value.toggleRowSelection(row, false)
  }
  for (const row of selection) {
    tableRef.value.toggleRowSelection(row, true)
  }
}
</script>

<template>
  <ElPopover
    v-model:visible="poVisible"
    trigger="click"
    width="auto"
    popper-style="minWidth: 25rem"
    @before-enter="beforeEnterHandler"
  >
    <template #reference>
      <ElButton :icon="Search" :disabled="!!$attrs.disabled" />
    </template>

    <ElInput v-model="queryStr" @keyup.enter="query">
      <template #append>
        <ElButton :icon="Search" @click="query" />
      </template>
    </ElInput>
    <ElTable
      ref="tableRef"
      :data="tbData"
      height="230"
      :row-key="rowKey"
      v-on="
        multiple
          ? { rowClick, selectionChange: rowSelChange }
          : { rowDblclick }
      "
    >
      <ElTableColumn
        v-if="multiple"
        type="selection"
        align="center"
        width="60"
        reserve-selection
      />
      <ElTableColumn
        v-for="(col, i) in columns"
        :key="i"
        :show-overflow-tooltip="!['selection', 'expand'].includes(col.type)"
        v-bind="col"
      >
        <template v-if="col.slot" #default="scope">
          <slot :name="col.slot" v-bind="scope" />
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      v-show="tbTotal > 0"
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :total="tbTotal"
      layout="total, prev, next, jumper, ->, slot"
      background
    >
      <span>
        {{ t('element.input.totalPage', { pages: Math.ceil(tbTotal / pageSize) }) }}
      </span>
    </ElPagination>
  </ElPopover>
</template>

<style scoped lang="scss">
.el-input {
  width: 80%;

  :deep(.el-input-group__append) {
    padding: 0;

    .el-button {
      height: 100%;
      margin: 0;
      padding: 8px 12px;
    }
  }
}

.el-table {
  margin: 8px 0;

  :deep(.el-popper.is-dark .el-popper__arrow::before) {
    border: 1px solid var(--el-text-color-primary);
    background: var(--el-text-color-primary);
    right: 0;
  }
}
</style>
