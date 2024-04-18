import { withInstall } from '@turbo-design/utils'
import _ScreenAdapter from './src/screenAdapter.vue'

export const ScreenAdapter = withInstall(_ScreenAdapter)
export default ScreenAdapter

export type ScreenAdapterInstance = InstanceType<typeof _ScreenAdapter>
