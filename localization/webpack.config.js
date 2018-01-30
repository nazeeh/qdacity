const path = require('path');
const NpmInstallPlugin = require('npm-install-webpack-plugin');

module.exports = {
	entry: {
		plugin: './src/index.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: path.join(__dirname, 'node_modules'),
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env'],
					}
				}
			},
			{
				test: /\.js$/,
				exclude: path.join(__dirname, 'node_modules'),
				use: {
					loader: 'eslint-loader',
					options: {
						fix: true
					}
				}
			}
		]
	},
	plugins: [
		new NpmInstallPlugin()
	]
};
