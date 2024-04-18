<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElOption, ElSelect } from 'element-plus'
import { useLocale } from '@turbo-design/hooks'
import { useCondition } from '../hooks'
import type { Condition, ConditionSelectProps, ValueType } from './conditionSelect'

defineOptions({ name: 'ConditionSelect' })

const props = defineProps<ConditionSelectProps>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const { t } = useLocale()

const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const { conditions } = useCondition()

const options = computed<Condition[]>(() =>
  props.valueType
    ? conditions.filter((condition) => {
      if (props.conditions && props.conditions.length > 0) {
        return props.conditions?.includes(condition.value)
      } else {
        return condition.type.includes(props.valueType as ValueType)
      }
    })
    : conditions,
)

watch(options, (opts) => {
  if (opts.findIndex(cond => cond.value === value.value) === -1) {
    value.value = ''
  }
})
</script>

<template>
  <ElSelect v-model="value" :placeholder="t('element.table.selCondition')">
    <ElOption
      v-for="condition in options"
      :key="condition.value"
      :label="condition.label"
      :value="condition.value"
    />
  </ElSelect>
</template>

<style scoped lang="scss"></style>
