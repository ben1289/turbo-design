import type { Condition } from './conditionSelect'

export interface QueryParam {
  fieldProp: string
  condition: Condition['value']
  value: string
}

export interface QueryFormProps {
  params: QueryParam[]
  formItemWidth?: number
}
