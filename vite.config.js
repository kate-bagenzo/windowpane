import { defineConfig } from 'vite';
import { watchAndRun } from 'vite-plugin-watch-and-run';
import { json5Plugin } from 'vite-plugin-json5';

export default defineConfig({
  base: "./",
  publicDir: "story/assets",
  build: {
    minify: false
  },
  plugins: [
    json5Plugin(),
    watchAndRun([
      {
        name: 'rebuild-images',
        watch: '**/story/assets/**/*.*',
        run: 'node engine/functions/grab-files.js'
      },
      {
        name: 'generate-css',
        watch: '**/story/config.jsonc',
        run: 'node engine/functions/config-css.js'
      }
    ])
  ]
});