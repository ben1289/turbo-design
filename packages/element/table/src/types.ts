import type { Condition, ValueType } from './components/conditionSelect'
import type { QueryParam } from './components/queryForm'
import type { EnumData } from './components/variableInput'

export interface Button {
  content?: string
  effect?: 'empty' | 'single' | 'multi'
  rule?: (row?: any) => boolean
  click?: (row?: any) => void
  pinMore?: boolean
  [k: string]: any
}

export interface Column {
  id: string | number
  valueType?: ValueType
  conditions?: Condition['value'][]
  enumData?: EnumData
  defaultHide?: boolean
  slot?: string
  headerSlot?: string
  children?: Column[]
  [k: string]: any
}

export interface QueryColumn {
  label: string
  prop: string
  valueType: ValueType
  conditions?: Condition['value'][]
  enumData?: EnumData
}

export interface PresetParam {
  fieldProp: string
  condition: Exclude<Condition['value'], ''>
}

export interface StoredColumn {
  id: Column['id']
  show: boolean
  width: string | number
}

export interface SortParam {
  fieldProp: string
  order: 'asc' | 'desc'
}

export interface QueryParams {
  params?: QueryParam[]
  sort?: SortParam
  pageNo?: number
  pageSize?: number
}
