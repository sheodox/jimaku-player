import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	server: {
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: '3000',
		},
	},
	build: {
		manifest: true,
		outDir: './build/static',
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				//format: 'iife',
				manualChunks: () => 'everything.js',
				inlineDynamicImports: true,
			},
			input: {
				subtitler: './src/static/subtitler/main.ts',
				host: './src/static/local-player/host/host.ts',
				player: './src/static/local-player/player/player.ts',
				//these entries are just for development, not necessary to do build
				//in the prod builda full build but keeping them here for visibility
				//'subrip-test': './src/static/test/subrip/subrip-test.ts',
				//'subrip-test-player': './src/static/test/subrip/test-player.ts',
			},
		},
	},
});
