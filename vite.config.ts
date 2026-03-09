import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

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
  plugins: [
    dts(),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [['@babel/plugin-proposal-decorators', { loose: true, version: '2022-03' }]],
      },
    }),
  ],
});
