export type ValueType = 'string' | 'number' | 'date' | 'datetime' | 'enum'

export interface Condition {
  label: string
  value:
    | ''
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'GE'
    | 'LT'
    | 'LE'
    | 'IS_NULL'
    | 'IS_NOT_NULL'
    | 'IN'
    | 'NOT_IN'
    | 'BOTH'
    | 'LEFT'
    | 'RIGHT'
  type: ValueType[]
}

export interface ConditionSelectProps {
  modelValue: string
  valueType?: ValueType
  conditions?: Condition['value'][]
}
