<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElDivider, ElMessageBox, ElOption, ElSelect } from 'element-plus'
import { useLocale } from '@turbo-design/hooks'
import { Minus, Plus } from '@element-plus/icons-vue'
import { Dialog } from '../../../dialog'
import { useColToField } from '../hooks'
import ConditionSelect from './conditionSelect.vue'
import VariableInput from './variableInput.vue'
import type { QueryParam } from './queryForm'
import type { AdvancedQueryProps } from './advancedQuery'

defineOptions({ name: 'AdvancedQuery' })

withDefaults(defineProps<AdvancedQueryProps>(), {
  showInit: false,
})

const emit = defineEmits<{
  (e: 'initParams'): void
  (e: 'clearParams'): void
  (e: 'saveParams', params: QueryParam[]): void
  (e: 'reset'): void
  (e: 'query', params: QueryParam[]): void
}>()

defineExpose({
  open,
})

const { t } = useLocale()
const { fields, getField } = useColToField()

const visible = ref(false)
const queryParams = ref<QueryParam[]>([
  {
    fieldProp: '',
    condition: '',
    value: '',
  },
])

/**
 * 获取有效地查询条件
 */
function getValidParams() {
  return queryParams.value.filter(item => !!item.fieldProp && !!item.condition)
}

/**
 * 打开弹窗 对外暴露
 * @param params
 */
function open(params: QueryParam[]) {
  if (params.length > 0) {
    queryParams.value = params
  } else {
    queryParams.value = [
      {
        fieldProp: '',
        condition: '',
        value: '',
      },
    ]
  }
  visible.value = true
}

/**
 * 增加查询条件
 */
function addItem() {
  queryParams.value.push({
    fieldProp: '',
    condition: '',
    value: '',
  })
}

/**
 * 移除查询条件
 * @param index
 */
function removeItem(index: number) {
  queryParams.value.splice(index, 1)
}

/**
 * 恢复默认查询条件
 */
async function initParams() {
  try {
    await ElMessageBox.confirm(t('element.table.initParamsTip'), t('element.common.tip'), {
      type: 'warning',
    })
    visible.value = false
    emit('initParams')
  } catch {}
}

/**
 * 清空查询条件
 */
async function clearParams() {
  try {
    await ElMessageBox.confirm(t('element.table.clearParamsTip'), t('element.common.tip'), {
      type: 'warning',
    })
    visible.value = false
    emit('clearParams')
  } catch {}
}

/**
 * 保存查询条件
 */
function saveParams() {
  visible.value = false
  emit('saveParams', getValidParams())
}

/**
 * 查询
 */
function query() {
  visible.value = false
  emit('query', getValidParams())
}

/**
 * 重置
 */
function reset() {
  visible.value = false
  queryParams.value.forEach(item => (item.value = ''))
  emit('reset')
}
</script>

<template>
  <Dialog v-model="visible" :title="t('element.table.advancedSearch')">
    <div class="query-form">
      <div v-for="(param, index) in queryParams" :key="index" class="query-form-item">
        <ElSelect
          v-model="param.fieldProp"
          :placeholder="t('element.table.selField')"
          filterable
          @change="param.value = ''"
        >
          <ElOption v-for="fld in fields" :key="fld.prop" :label="fld.label" :value="fld.prop" />
        </ElSelect>

        <ConditionSelect
          v-model="param.condition"
          :value-type="getField(param.fieldProp)?.valueType"
          :conditions="getField(param.fieldProp)?.conditions"
          @change="param.value = ''"
        />

        <VariableInput
          v-if="!['IS_NULL', 'IS_NOT_NULL'].includes(param.condition)"
          v-model="param.value"
          :type="getField(param.fieldProp)?.valueType"
          :enum-data="getField(param.fieldProp)?.enumData"
        />
        <div v-else />

        <ElButton type="warning" :icon="Minus" plain @click="removeItem(index)" />
      </div>
      <div style="text-align: center">
        <ElButton type="primary" :icon="Plus" plain style="width: 100px" @click="addItem" />
      </div>
    </div>

    <template #footer>
      <ElButton v-if="showInit" @click="initParams">
        {{ t('element.table.restoreDefault') }}
      </ElButton>
      <ElButton @click="clearParams">
        {{ t('element.common.clear') }}
      </ElButton>
      <ElButton type="primary" @click="saveParams">
        {{ t('element.common.save') }}
      </ElButton>
      <ElDivider direction="vertical" />
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
.query-form {
  display: grid;
  grid-gap: 10px;

  .query-form-item {
    display: grid;
    grid-template-columns: repeat(3, 1fr) auto;
    grid-gap: inherit;
  }
}
</style>
