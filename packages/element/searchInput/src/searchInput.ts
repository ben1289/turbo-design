import type { PopoverTableProps } from './components/popoverTable'

export interface SearchInputProps
  extends Pick<PopoverTableProps, 'columns' | 'fetchData' | 'alwaysFetch'> {
  modelValue: string
  label: string
  type?: 'plain' | 'complex' | 'all'
  labelKey?: string
  valueKey?: string
  manualInput?: boolean
}
