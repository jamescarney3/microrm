import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'microrm',
      fileName: 'microrm',
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
      test: resolve(__dirname, './test'),
    },
  },
  plugins: [dts({ tsconfigPath: resolve(__dirname, 'tsconfig.json'), insertTypesEntry: true })],
});
