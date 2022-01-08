// babel is only used for jest to load typescript files
module.exports = {
	presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
};
