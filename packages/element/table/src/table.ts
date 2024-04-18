import type { QueryFormProps } from './components/queryForm'
import type { Button, Column, PresetParam, QueryColumn } from './types'

export interface TableProps extends Pick<QueryFormProps, 'formItemWidth'> {
  id?: string
  buttons?: Button[]
  loading?: boolean
  columns?: Column[]
  queryColumns?: QueryColumn[]
  data?: any[]
  total?: number
  pagerCount?: number
  rowHeight?: number
  immediateQuery?: boolean
  refreshable?: boolean
  pagination?: boolean
  paginationConfig?: Record<string, any>
  presetParams?: PresetParam[]
  singleSelection?: boolean
}
