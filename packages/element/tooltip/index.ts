import { withInstall } from '@turbo-design/utils'
import _Tooltip from './src/tooltip.vue'

export const Tooltip = withInstall(_Tooltip)
export default Tooltip

export type TooltipInstance = InstanceType<typeof _Tooltip>
