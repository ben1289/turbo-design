import { computed, inject, toValue } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Column, QueryColumn, StoredColumn } from '../types'

export default function useColToField() {
  const tableId = inject('tableId', '')
  const columns = inject<Column[]>('columns', [])
  const queryColumns = inject<QueryColumn[]>('queryColumns', [])
  const storedCols = useStorage<StoredColumn[]>(`TableCols_${tableId}`, [])
  const hideColIds = computed(() =>
    toValue(storedCols)
      .filter(col => !col.show)
      .map(col => col.id),
  )

  const fields = computed(() =>
    [
      ...columns.filter(
        col =>
          !toValue(hideColIds).includes(col.id)
          && col.prop
          && col.valueType
          && !(toValue(storedCols).length === 0 && col.defaultHide),
      ),
      ...queryColumns,
    ].map(({ label, prop, valueType, conditions, enumData }) => ({
      label,
      prop,
      valueType,
      conditions,
      enumData,
    })),
  )

  const cacheFields = new Map()
  function getField(fieldProp: string) {
    if (cacheFields.has(fieldProp)) {
      return cacheFields.get(fieldProp)
    }
    const field = toValue(fields).find(field => field.prop === fieldProp)
    if (field) {
      cacheFields.set(fieldProp, field)
      return field
    }
    return null
  }

  return {
    fields,
    getField,
  }
}
