// svelte.config.js
import adapter from '@sveltejs/adapter-vercel'; // Or netlify, etc.
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(), // Defaults are usually fine
    alias: {
      '$components': 'src/components',
      '$utils': 'src/utils'
    }
    // Remove kit.prerender or set entries carefully if you want some pages static
    // and others dynamic.
    // For pages with actions, ensure they have `export const prerender = false;`
  },
  preprocess: vitePreprocess()
};
export default config;