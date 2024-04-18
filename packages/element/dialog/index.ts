import { withInstall } from '@turbo-design/utils'
import _Dialog from './src/dialog.vue'

export const Dialog = withInstall(_Dialog)
export default Dialog

export type DialogInstance = InstanceType<typeof _Dialog>
