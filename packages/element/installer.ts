import type { App, Plugin } from 'vue'
import { ConfigProvider } from './configProvider'
import { Dialog } from './dialog'
import { GridCard } from './gridCard'
import { SearchInput, SearchMultipleInput } from './searchInput'
import { ScreenAdapter } from './screenAdapter'
import { SeamlessScroll } from './seamlessScroll'
import { Table } from './table'
import { Tooltip } from './tooltip'

function makeInstaller(components: Plugin[] = []) {
  return {
    install(app: App) {
      components.forEach(component => app.use(component))
    },
  }
}

export default makeInstaller([
  ConfigProvider,
  Dialog,
  GridCard,
  SearchInput,
  SearchMultipleInput,
  ScreenAdapter,
  SeamlessScroll,
  Table,
  Tooltip,
])
