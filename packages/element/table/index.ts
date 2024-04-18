import { withInstall } from '@turbo-design/utils'
import _Table from './src/table.vue'

export const Table = withInstall(_Table)
export default Table

export type TableInstance = InstanceType<typeof _Table>
