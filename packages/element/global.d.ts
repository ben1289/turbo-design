export {}

declare module 'vue' {
  export interface GlobalComponents {
    TConfigProvider: typeof import('@turbo-design/element')['ConfigProvider']
    TDialog: typeof import('@turbo-design/element')['Dialog']
    TGridCard: typeof import('@turbo-design/element')['GridCard']
    TSearchInput: typeof import('@turbo-design/element')['SearchInput']
    TSearchMultipleInput: typeof import('@turbo-design/element')['SearchMultipleInput']
    TScreenAdapter: typeof import('@turbo-design/element')['ScreenAdapter']
    TSeamlessScroll: typeof import('@turbo-design/element')['SeamlessScroll']
    TTable: typeof import('@turbo-design/element')['Table']
    TTooltip: typeof import('@turbo-design/element')['Tooltip']
  }
}
