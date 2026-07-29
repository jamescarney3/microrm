/*
  eslint-disable import/newline-after-import --
  ignoring the dts import breaks this rule, disabling here since config
  file import formatting doesn't have any effect outside of this file
*/
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'; // eslint-disable-line import/default

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
  plugins: [dts()],
});
