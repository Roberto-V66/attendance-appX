import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		alias: {
			'$components': 'src/components', // Now, `$components` points to `src/components`
			'$utils': 'src/utils',           // `$utils` points to `src/utils`
		  },
		adapter: adapter()
	},
	preprocess: vitePreprocess()
};

export default config;
