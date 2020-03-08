const path = require('path');

module.exports = {
	mode: process.argv.includes('production') ? 'production' : 'development',
	watch: process.argv.includes('watch'),
	entry: './src/main.js',
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
				exclude: /node_modules/,
				use: 'svelte-loader'
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	}
};
