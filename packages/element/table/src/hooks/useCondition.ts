import { useLocale } from '@turbo-design/hooks'
import type { Condition } from '../components/conditionSelect'

export default function useCondition() {
  const { t } = useLocale()

  const conditions: Condition[] = [
    { label: t('element.common.EQ'), value: 'EQ', type: ['string', 'number', 'date', 'datetime', 'enum'] },
    { label: t('element.common.NE'), value: 'NE', type: ['string', 'number', 'date', 'datetime', 'enum'] },
    { label: t('element.common.GT'), value: 'GT', type: ['number', 'date', 'datetime'] },
    { label: t('element.common.GE'), value: 'GE', type: ['number', 'date', 'datetime'] },
    { label: t('element.common.LT'), value: 'LT', type: ['number', 'date', 'datetime'] },
    { label: t('element.common.LE'), value: 'LE', type: ['number', 'date', 'datetime'] },
    { label: t('element.common.IS_NULL'), value: 'IS_NULL', type: ['string', 'number', 'date', 'datetime', 'enum'] },
    { label: t('element.common.IS_NOT_NULL'), value: 'IS_NOT_NULL', type: ['string', 'number', 'date', 'datetime', 'enum'] },
    { label: t('element.common.IN'), value: 'IN', type: ['string'] },
    { label: t('element.common.NOT_IN'), value: 'NOT_IN', type: ['string'] },
    { label: t('element.common.BOTH'), value: 'BOTH', type: ['string'] },
    { label: t('element.common.LEFT'), value: 'LEFT', type: ['string'] },
    { label: t('element.common.RIGHT'), value: 'RIGHT', type: ['string'] },
  ]

  function getLabelByVal(value: Condition['value']) {
    return conditions.find(cond => cond.value === value)?.label
  }

  return {
    conditions,
    getLabelByVal,
  }
}
