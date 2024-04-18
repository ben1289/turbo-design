import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [/@turbo-design\/*/, 'element-plus', 'vue'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: '.',
        },
      ],
    },
    lib: {
      entry: './index.ts',
    },
  },
  plugins: [
    vue(),
    dts(),
  ],
})
