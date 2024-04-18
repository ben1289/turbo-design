import { withInstall } from '@turbo-design/utils'
import _GridCard from './src/gridCard.vue'

export const GridCard = withInstall(_GridCard)
export default GridCard

export type GridCardInstance = InstanceType<typeof _GridCard>
