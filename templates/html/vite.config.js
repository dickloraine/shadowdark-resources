import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
/*  NOT STANDALONE  */
/*  STANDALONE  */
/*  import { viteSingleFile } from 'vite-plugin-singlefile';
 */
/*  END  */

export default defineConfig({
  /*  NOT BASEURL  */
  /*  BASEURL  */
  /*  base: 'APP_BASE_URL',
   */
  /*  END  */

  /*  NOT STANDALONE  */
  plugins: [preact()],
  build: {
    target: 'esnext',
  },
  /*  STANDALONE  */
  /*  plugins: [preact(), viteSingleFile()],
   */
  /*  END  */
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
