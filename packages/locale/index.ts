import zhCN from './lang/zh-CN'
import enUS from './lang/en-US'

export default {
  zhCN,
  enUS,
}

export interface TranslatePair {
  [key: string]: string | TranslatePair
}

export interface Language extends TranslatePair {
  name: string
}
