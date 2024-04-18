import { withInstall } from '@turbo-design/utils'
import _SearchInput from './src/searchInput.vue'
import _SearchMultipleInput from './src/searchMultipleInput.vue'

const SearchInput = withInstall(_SearchInput)
const SearchMultipleInput = withInstall(_SearchMultipleInput)

export { SearchInput, SearchMultipleInput }
export default SearchInput

export type SearchInputInstance = InstanceType<typeof _SearchInput>
export type SearchMultipleInputInstance = InstanceType<typeof _SearchMultipleInput>
