import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
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
    dts(),
  ],
})
