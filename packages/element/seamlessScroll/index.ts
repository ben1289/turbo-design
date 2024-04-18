import { withInstall } from '@turbo-design/utils'
import _SeamlessScroll from './src/seamlessScroll.vue'

export const SeamlessScroll = withInstall(_SeamlessScroll)
export default SeamlessScroll

export type SeamlessScrollInstance = InstanceType<typeof _SeamlessScroll>
