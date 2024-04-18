<script setup lang="ts">
import { computed } from 'vue'
import { ElDatePicker, ElInput, ElOption, ElSelect } from 'element-plus'
import type { VariableInputProps } from './variableInput'

defineOptions({ name: 'VariableInput' })

const props = withDefaults(defineProps<VariableInputProps>(), {
  enumData: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'enter'): void
}>()

const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

function toTimestamp(date: Date) {
  value.value = date.getTime()
}
</script>

<template>
  <ElSelect v-if="type === 'enum'" v-model="value" placeholder=" " clearable>
    <ElOption
      v-for="(data, index) in enumData"
      :key="index"
      :label="data.label"
      :value="data.value"
    />
  </ElSelect>
  <ElDatePicker
    v-else-if="type === 'date'"
    v-model="value"
    type="date"
    clearable
    style="width: 100%"
    @change="toTimestamp"
  />
  <ElDatePicker
    v-else-if="type === 'datetime'"
    v-model="value"
    type="datetime"
    clearable
    style="width: 100%"
    @change="toTimestamp"
  />
  <ElInput v-else v-model="value" clearable @keydown.enter.prevent="emit('enter')" />
</template>

<style scoped lang="scss"></style>
