import type { FetchData } from '../types'

export interface Column {
  slot?: string
  [k: string]: any
}

export interface PopoverTableProps {
  modelValue: Record<string, any>[]
  multiple?: boolean
  rowKey?: string
  columns: Column[]
  fetchData: FetchData
  alwaysFetch?: boolean
}
