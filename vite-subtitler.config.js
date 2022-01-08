import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	build: {
		manifest: false,
		outDir: './build/subtitler',
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				format: 'iife',
				assetFileNames: '[name].[ext]',
				entryFileNames: '[name].js',
			},
			input: { subtitler: './src/static/subtitler/main.ts' },
			//we need to inline the css into the bundle. vite doesn't seem to let you do that
			//so we need to use a plugin that does it manually>
			//originally from https://stackoverflow.com/a/68954980/2675087
			plugins: [
				{
					apply: 'build',
					enforce: 'post',
					name: 'pack-css',
					generateBundle(opts, bundle) {
						const {
							'style.css': { source: rawCss },
							'subtitler.js': component,
						} = bundle;

						const IIFEcss = `
							(function() {
								try {
									if (!document.head.querySelector('#jimaku-player-css')){
										const elementStyle = document.createElement('style');
										elementStyle.id = "jimaku-player-css";
										elementStyle.innerText = ${JSON.stringify(rawCss)}
										document.head.appendChild(elementStyle)
									}
								} catch(error) {
									console.error(error, 'unable to concat style inside the bundled file')
								}
							})()`;

						component.code += IIFEcss;

						// remove from final bundle
						delete bundle['style.css'];
					},
				},
			],
		},
	},
});
