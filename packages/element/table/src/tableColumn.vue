<script setup lang="ts">
import { computed, toRef, unref } from 'vue'
import { ElTableColumn } from 'element-plus'
import { omit } from 'lodash-es'
import type { TableColumnProps } from './tableColumn'

const props = defineProps<TableColumnProps>()
const column = toRef(() => props.column)
// 预置属性 融合 外部属性
const finalAttrs = computed<Record<string, any>>(() => ({
  columnKey: unref(column).id,
  showOverflowTooltip: !['selection', 'expand'].includes(unref(column).type),
  ...(unref(column).type === 'selection' ? { fixed: true, className: 'cell-pointer' } : {}),
  ...omit(unref(column), [
    'id',
    'valueType',
    'conditions',
    'enumData',
    'defaultHide',
    'slot',
    'headerSlot',
    'children',
  ]),
}))
</script>

<template>
  <ElTableColumn v-if="column?.children?.length" v-bind="finalAttrs">
    <template v-if="column.headerSlot" #header="scope">
      <slot v-if="scope.$index >= 0" :name="column.headerSlot" v-bind="scope" />
    </template>

    <template v-for="col in column.children" :key="col.id">
      <TableColumn :column="col">
        <template v-for="(value, key) in $slots" :key="key" #[key]="scope">
          <slot :name="key" v-bind="scope" />
        </template>
      </TableColumn>
    </template>
  </ElTableColumn>

  <ElTableColumn v-else v-bind="finalAttrs">
    <template v-if="column.headerSlot" #header="scope">
      <slot v-if="scope.$index >= 0" :name="column.headerSlot" v-bind="scope" />
    </template>

    <template v-if="column.slot" #default="scope">
      <slot v-if="scope.$index >= 0" :name="column.slot" v-bind="scope" />
    </template>
  </ElTableColumn>
</template>

<style scoped lang="scss"></style>
