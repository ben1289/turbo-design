<script setup lang="ts">
import { computed } from 'vue'
import { ElInput, ElTag, ElTooltip } from 'element-plus'
import type { TagInputProps } from './tagInput'

defineOptions({ name: 'TagInput' })

const props = withDefaults(defineProps<TagInputProps>(), {
  labelKey: 'label',
  valueKey: 'value',
})

const emit = defineEmits<{
  (e: 'update:label', label: TagInputProps['label']): void
  (e: 'update:modelValue', value: TagInputProps['modelValue']): void
}>()

const inputLabel = computed({
  get() {
    return props.label
  },
  set(label) {
    emit('update:label', label)
  },
})
const inputValue = computed({
  get() {
    return props.modelValue ?? []
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

function removeTag(value: any) {
  const removeIndex = inputValue.value.findIndex(val => val[props.valueKey] === value)
  inputValue.value.splice(removeIndex, 1)
}
</script>

<template>
  <ElInput v-bind="$attrs" v-model="inputLabel" class="tag-input">
    <template #prefix>
      <ElTag
        v-for="(value, index) in inputValue.slice(0, maxTags)"
        :key="value[valueKey] ?? index"
        type="info"
        :closable="!$attrs.disabled"
        @close="removeTag(value[valueKey])"
      >
        {{ value[labelKey] }}
      </ElTag>
      <ElTooltip
        v-if="maxTags != null && maxTags >= 0 && inputValue.length > maxTags"
        effect="light"
      >
        <ElTag type="info">
          +{{ inputValue.length - maxTags }}
        </ElTag>
        <template #content>
          <div style="display: grid; grid-template-columns: repeat(4, auto); margin-right: -6px">
            <ElTag
              v-for="(value, index) in inputValue.slice(maxTags)"
              :key="value[valueKey] ?? index"
              type="info"
              :closable="!$attrs.disabled"
              style="margin: 4px 6px 4px 0"
              @close="removeTag(value[valueKey])"
            >
              {{ value[labelKey] }}
            </ElTag>
          </div>
        </template>
      </ElTooltip>
    </template>
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </ElInput>
</template>

<style scoped lang="scss">
.tag-input {
  :deep(.el-input-group__prepend) {
    background-color: #fff;
  }

  & > :deep(.el-input__wrapper) {
    flex-wrap: wrap;
    justify-content: flex-start;

    .el-input__prefix {
      max-width: 100%;
      height: auto;

      .el-input__prefix-inner {
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    .el-input__inner {
      flex: 1;
      min-width: 20%;
    }

    input[readonly] {
      display: none;
    }
  }

  &.is-disabled > :deep(.el-input__wrapper) {
    cursor: not-allowed;
  }

  .el-tag {
    margin: 4px 6px 4px 0;
  }
}
</style>
