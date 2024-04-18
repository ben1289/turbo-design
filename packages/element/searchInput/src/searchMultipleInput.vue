<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import TagInput from './components/tagInput.vue'
import PopoverTable from './components/popoverTable.vue'
import PopoverScrollPanel from './components/popoverScrollPanel.vue'
import type { GetFetchData } from './types'
import type { SearchMultipleInputProps } from './searchMultipleInput'

defineOptions({ name: 'TSearchMultipleInput' })

const props = withDefaults(defineProps<SearchMultipleInputProps>(), {
  type: 'all',
  alwaysFetch: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SearchMultipleInputProps['modelValue']): void
  (e: 'change', value: SearchMultipleInputProps['modelValue']): void
}>()

type Row = GetFetchData<typeof props.fetchData>

const scrollPanelRef = ref<InstanceType<typeof PopoverScrollPanel> | null>(null)
const tagInputRef = ref<InstanceType<typeof TagInput> | null>(null)

const inputLabel = ref('')
const inputValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  },
})
watch(inputValue, (rows) => {
  scrollPanelRef.value?.setSelectRows(rows)
})

function scrollPanelChange(rows: Row | Row[]) {
  inputValue.value = rows as Row[]
}

/**
 * input控件 input 事件
 */
const inputEventHandler = useDebounceFn((queryStr) => {
  scrollPanelRef.value?.show(queryStr)
}, 300)
</script>

<template>
  <div class="t-search-multiple-input">
    <TagInput
      v-if="type === 'complex'"
      ref="tagInputRef"
      v-model="inputValue"
      v-model:label="inputLabel"
      :label-key="labelKey"
      :value-key="valueKey"
      :max-tags="maxTags"
      :disabled="!!$attrs.disabled"
      readonly
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      <template #append>
        <PopoverTable
          v-model="inputValue"
          :multiple="true"
          :row-key="valueKey"
          :columns="columns"
          :fetch-data="fetchData"
          :always-fetch="alwaysFetch"
          :disabled="!!$attrs.disabled"
        />
      </template>
    </TagInput>

    <PopoverScrollPanel
      v-else
      ref="scrollPanelRef"
      :reference-ref="tagInputRef"
      :label-key="labelKey"
      :value-key="valueKey"
      :fetch-data="fetchData"
      multiple
      :disabled="!!$attrs.disabled"
      @change="scrollPanelChange"
      @hide="inputLabel = ''"
    >
      <template #reference>
        <TagInput
          ref="tagInputRef"
          v-model="inputValue"
          v-model:label="inputLabel"
          :label-key="labelKey"
          :value-key="valueKey"
          :max-tags="maxTags"
          :disabled="!!$attrs.disabled"
          @input="inputEventHandler"
          @keyup.enter="() => scrollPanelRef?.singleRowSelect()"
        >
          <template v-if="$slots.prepend" #prepend>
            <slot name="prepend" />
          </template>
          <template v-if="type === 'all'" #append>
            <PopoverTable
              v-model="inputValue"
              :multiple="true"
              :row-key="valueKey"
              :columns="columns"
              :fetch-data="fetchData"
              :always-fetch="alwaysFetch"
              :disabled="!!$attrs.disabled"
            />
          </template>
        </TagInput>
      </template>
    </PopoverScrollPanel>
  </div>
</template>

<style scoped lang="scss">
.t-search-multiple-input {
  display: inline-block;

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
