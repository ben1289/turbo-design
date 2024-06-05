<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElInput } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'
import type { InputInstance } from 'element-plus'
import PopoverTable from './components/popoverTable.vue'
import PopoverScrollPanel from './components/popoverScrollPanel.vue'
import type { GetFetchData } from './types'
import type { SearchInputProps } from './searchInput'
import type { PopoverTableProps } from './components/popoverTable'

defineOptions({ name: 'TSearchInput' })

const props = withDefaults(defineProps<SearchInputProps>(), {
  type: 'all',
  labelKey: 'label',
  valueKey: 'value',
  columns: () => [],
  alwaysFetch: false,
  manualInput: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SearchInputProps['modelValue']): void
  (e: 'update:label', value: SearchInputProps['label']): void
  (e: 'change', value: SearchInputProps['modelValue'], row: Row): void
}>()

type Row = GetFetchData<typeof props.fetchData>

const inputLabel = ref('')

watch(
  () => props.label,
  (label) => {
    inputLabel.value = label
  },
  { immediate: true },
)

const poTableValue = ref<PopoverTableProps['modelValue']>([])
watch(poTableValue, (rows) => {
  if (rows.length === 1) {
    change(rows[0]!)
  }
})

/**
 * 根据 labelKey和valueKey 确定 label和value
 * @param row
 */
function change(row: Row) {
  emit('update:modelValue', row[props.valueKey])
  emit('update:label', row[props.labelKey])
  emit('change', row[props.valueKey], row)
}

/**
 * input控件 change 事件
 */
function inputChangeHandler(label: string) {
  if (props.manualInput) {
    change({ [props.labelKey]: label, [props.valueKey]: label })
    return
  }
  if (inputLabel.value === '') {
    change({ [props.labelKey]: '', [props.valueKey]: '' })
  } else if (inputLabel.value !== props.label) {
    inputLabel.value = props.label
  }
}

const scrollPanelRef = ref<InstanceType<typeof PopoverScrollPanel> | null>(null)
const plainInput = ref<InputInstance | null>(null)

/**
 * input控件 input 事件
 */
const inputEventHandler = useDebounceFn((queryStr) => {
  scrollPanelRef.value?.show(queryStr)
}, 300)
</script>

<template>
  <div class="t-search-input">
    <ElInput
      v-if="type === 'complex'"
      v-bind="$attrs"
      v-model="inputLabel"
      @change="inputChangeHandler"
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      <template #append>
        <PopoverTable
          v-model="poTableValue"
          :columns="columns"
          :fetch-data="fetchData"
          :always-fetch="alwaysFetch"
          :disabled="!!$attrs.disabled"
        />
      </template>
    </ElInput>

    <PopoverScrollPanel
      v-else
      ref="scrollPanelRef"
      :reference-ref="plainInput"
      :label-key="labelKey"
      :value-key="valueKey"
      :fetch-data="fetchData"
      @change="change"
    >
      <template #reference>
        <ElInput
          ref="plainInput"
          v-bind="$attrs"
          v-model="inputLabel"
          @input="inputEventHandler"
          @change="inputChangeHandler"
          @keyup.enter="() => scrollPanelRef?.singleRowSelect()"
        >
          <template v-if="$slots.prepend" #prepend>
            <slot name="prepend" />
          </template>
          <template v-if="type === 'all'" #append>
            <PopoverTable
              v-model="poTableValue"
              :columns="columns"
              :fetch-data="fetchData"
              :always-fetch="alwaysFetch"
              :disabled="!!$attrs.disabled"
            />
          </template>
        </ElInput>
      </template>
    </PopoverScrollPanel>
  </div>
</template>

<style scoped lang="scss">
.t-search-input {
  display: inline-block;

  :deep(.el-input-group__prepend) {
    background-color: #fff;
  }

  :deep(.el-input-group__append) {
    padding: 0;

    .el-button {
      height: 100%;
      margin: 0;
      padding: 8px;
    }
  }
}
</style>
