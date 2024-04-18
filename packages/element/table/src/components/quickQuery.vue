<script setup lang="ts">
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { ElButton, ElOption, ElSelect } from 'element-plus'
import { useLocale } from '@turbo-design/hooks'
import { Dialog } from '../../../dialog'
import { useColToField } from '../hooks'
import VariableInput from './variableInput.vue'
import ConditionSelect from './conditionSelect.vue'
import type { QueryParam } from './queryForm'

defineOptions({ name: 'QuickQuery' })

const emit = defineEmits<{
  (e: 'query', params: QueryParam[]): void
  (e: 'reset'): void
}>()

defineExpose({ open })

const { t } = useLocale()

const { fields } = useColToField()

const visible = ref(false)
const params = reactive<QueryParam>({
  fieldProp: '',
  condition: '',
  value: '',
})
const field = computed(() => fields.value.find(f => f.prop === params.fieldProp))
watch(field, () => {
  params.value = ''
})

function open() {
  visible.value = true
}

function query() {
  visible.value = false
  emit('query', params.fieldProp ? [toRaw(params)] : [])
}

function reset() {
  visible.value = false
  for (const key in params) {
    params[key as keyof QueryParam] = ''
  }
  emit('reset')
}
</script>

<template>
  <Dialog v-model="visible" :title="t('element.table.quickSearch')">
    <div class="form-item">
      <ElSelect v-model="params.fieldProp" :placeholder="t('element.table.selField')" filterable>
        <ElOption v-for="fld in fields" :key="fld.prop" :label="fld.label" :value="fld.prop" />
      </ElSelect>

      <ConditionSelect
        v-model="params.condition"
        :value-type="field?.valueType"
        :conditions="field?.conditions"
        @change="params.value = ''"
      />

      <VariableInput
        v-if="!['IS_NULL', 'IS_NOT_NULL'].includes(params.condition)"
        v-model="params.value"
        :type="field?.valueType"
        :enum-data="field?.enumData"
        @enter="query"
      />
    </div>

    <template #footer>
      <ElButton type="primary" @click="query">
        {{ t('element.common.query') }}
      </ElButton>
      <ElButton @click="reset">
        {{ t('element.common.reset') }}
      </ElButton>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.form-item {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
}
</style>
