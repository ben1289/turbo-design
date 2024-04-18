import { withInstall } from '@turbo-design/utils'
import _ConfigProvider from './src/configProvider.vue'

export const ConfigProvider = withInstall(_ConfigProvider)
export default ConfigProvider

export type ConfigProviderInstance = InstanceType<typeof _ConfigProvider>
