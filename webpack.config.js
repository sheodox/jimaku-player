const path = require('path');

module.exports = {
	mode: process.argv.includes('production') ? 'production' : 'development',
	watch: process.argv.includes('watch'),
	entry: {
		subtitler: './src/subtitler/main.js',
		host: './src/local-player/host/host.js',
		player: './src/local-player/player/player.js',
		'subrip-test': './src/test/subrip/subrip-test.js',
		'subrip-test-player': './src/test/subrip/test-player.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './static')
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
	},
	module: {
		rules: [
			{
				test: /\.(html|svelte)$/,
				use: 'svelte-loader'
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	},
	optimization: {
		usedExports: true
	}
};
