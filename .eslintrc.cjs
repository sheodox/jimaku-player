module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 13,
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3',
		},
	],
	plugins: ['@typescript-eslint', 'svelte3'],
	rules: {
		// spacing is decided by prettier, don't allow eslint to have an opinion
		'no-mixed-spaces-and-tabs': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
	settings: {
		'svelte3/typescript': true,
		'svelte3/ignore-styles': () => true,
	},
};
