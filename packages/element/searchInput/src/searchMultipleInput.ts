import type { TagInputProps } from './components/tagInput'
import type { PopoverTableProps } from './components/popoverTable'

export interface SearchMultipleInputProps
  extends Omit<TagInputProps, 'label'>, Pick<PopoverTableProps, 'columns' | 'fetchData' | 'alwaysFetch'> {
  type?: 'plain' | 'complex' | 'all'
}
