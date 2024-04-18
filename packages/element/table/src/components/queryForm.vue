<script setup lang="ts">
import { computed, ref, toValue, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import { ElButton, ElForm, ElFormItem, ElIcon } from 'element-plus'
import { useLocale } from '@turbo-design/hooks'
import { useElementSize } from '@vueuse/core'
import { ArrowDownBold } from '@element-plus/icons-vue'
import { Tooltip } from '../../../tooltip'
import { useColToField, useCondition } from '../hooks'
import VariableInput from './variableInput.vue'
import CollapseTransition from './collapseTransition.vue'
import type { QueryFormProps, QueryParam } from './queryForm'

defineOptions({ name: 'QueryForm', inheritAttrs: false })

const props = withDefaults(defineProps<QueryFormProps>(), {
  formItemWidth: 350,
})

const emit = defineEmits<{
  (e: 'query', params: QueryParam[]): void
  (e: 'reset'): void
}>()

const { t } = useLocale()
const { getField } = useColToField()
const { getLabelByVal } = useCondition()

const firstRow = ref<HTMLElement | null>(null)
const { width: firstRowWidth } = useElementSize(firstRow)
const firstRowNum = computed(() => {
  const width = toValue(firstRowWidth)
  if (width) {
    return Math.floor((width + 20) / (props.formItemWidth + 20))
  }
  return 2
})

const cloneParams = ref<QueryParam[]>([])
watch(
  () => props.params,
  (params) => {
    cloneParams.value = cloneDeep(params)
  },
  {
    immediate: true,
  },
)

const more = ref(false)

function query() {
  emit('query', cloneParams.value)
}

function reset() {
  cloneParams.value.forEach((param) => {
    param.value = ''
  })
  emit('reset')
}
</script>

<template>
  <div class="query-form">
    <ElForm @submit.prevent>
      <div ref="firstRow" class="flex-box" style="margin-bottom: 10px">
        <ElFormItem
          v-for="(param, index) in cloneParams.slice(0, firstRowNum)"
          :key="index"
          :prop="param.fieldProp"
        >
          <template #label>
            <Tooltip class="prop-label">
              {{ getField(param.fieldProp)?.label }}
            </Tooltip>
            <span class="condition-label">{{ getLabelByVal(param.condition) }}</span>
          </template>
          <VariableInput
            v-if="!['IS_NULL', 'IS_NOT_NULL'].includes(param.condition)"
            v-model="param.value"
            :type="getField(param.fieldProp)?.valueType"
            :enum-data="getField(param.fieldProp)?.enumData"
            style="width: 100%"
            @enter="query"
          />
          <div v-else />
        </ElFormItem>
      </div>
      <CollapseTransition v-if="cloneParams.length > firstRowNum" class="flex-box">
        <div v-show="more" id="moreBox">
          <ElFormItem
            v-for="(param, index) in cloneParams.slice(firstRowNum)"
            :key="index"
            :prop="param.fieldProp"
          >
            <template #label>
              <Tooltip class="prop-label">
                {{ getField(param.fieldProp)?.label }}
              </Tooltip>
              <span class="condition-label">{{ getLabelByVal(param.condition) }}</span>
            </template>
            <VariableInput
              v-if="!['IS_NULL', 'IS_NOT_NULL'].includes(param.condition)"
              v-model="param.value"
              :type="getField(param.fieldProp)?.valueType"
              :enum-data="getField(param.fieldProp)?.enumData"
              style="width: 100%"
              @enter="query"
            />
            <div v-else />
          </ElFormItem>
        </div>
      </CollapseTransition>
    </ElForm>
    <div>
      <ElButton v-if="cloneParams.length > firstRowNum" type="primary" link @click="more = !more">
        {{ t('element.common.more') }}
        <ElIcon class="more-icon" :style="more ? 'transform: rotate(180deg)' : ''">
          <ArrowDownBold />
        </ElIcon>
      </ElButton>
      <ElButton type="primary" @click="query">
        {{ t('element.common.query') }}
      </ElButton>
      <ElButton @click="reset">
        {{ t('element.common.reset') }}
      </ElButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.query-form {
  display: grid;
  grid-template-columns: 1fr auto;

  .flex-box {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
  }

  :deep(.el-form-item) {
    width: calc(v-bind(formItemWidth) * 1px);
    margin: 0;

    .el-form-item__label {
      .prop-label {
        max-width: 90px;
      }

      .condition-label {
        margin-left: 12px;
        color: #000;
      }
    }
  }

  .more-icon {
    margin-left: 5px;
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  :deep(.el-select) {
    .el-input {
      width: 100%;
    }
  }
}
</style>
