import type { ValueType } from './conditionSelect'

export type EnumData = { label: string, value: any }[]

export interface VariableInputProps {
  modelValue: any
  type?: ValueType
  enumData?: EnumData
}
