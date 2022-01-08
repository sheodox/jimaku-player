import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

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
	base: path.join(process.cwd(), './build/static/'),
	build: {
		manifest: true,
		outDir: './build/static',
		rollupOptions: {
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
