import defineConfig from '@antfu/eslint-config'

export default defineConfig({
  formatters: true,
  typescript: true,
  vue: true,
  rules: {
    'style/brace-style': ['error', '1tbs'],
    'curly': 'off',
    'ts/no-use-before-define': 'off',
  },
})
