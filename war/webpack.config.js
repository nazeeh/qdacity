var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('babel-register'); // replace nodes require with babels on-the-fly c.
var ExtractMessagesPlugin = require('../localization/webpack').default;
var BabelFormatMessagesPlugin = require('../localization/babel').default;

module.exports = {
	bail: true,
	entry: {
		index: './assets/js/pages/index/index.js'
	},
	resolve: {
		alias: {
			jquery: path.join(__dirname, './assets/js/jquery-stub.js'),
			endpoints: path.resolve(__dirname, './assets/js/common/endpoints'),
			modals: path.resolve(__dirname, './assets/js/common/modals')
		}
	},
	output: {
		path: __dirname,
		filename: '[name].dist.js'
	},
	externals: {
		// require("jquery") is external and available
		//  on the global var jQuery
		//react: "React"
	},
	module: {
		rules: [
			{
				test: path.join(__dirname, 'assets/js'),
				use: {
					loader: 'babel-loader',
					options: {
						metadataSubscribers: [ExtractMessagesPlugin.metadataSubscriber],
						presets: ['env', 'react'],
						plugins: [
							['react-intl', {
								extractSourceLocation: true
							}],
							[BabelFormatMessagesPlugin, {
								test: false,
								debug: false,
							}],
							//until there is a working solution we cannot use this in development
							//'transform-react-inline-elements'
						]
					}
				}
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						}
					]
				})
			},
			{
				test: /\.((png|jpg|gif|svg|eot|ttf|woff|woff2)(\?|=|.|[a-z]|[0-9])*)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 10000
						}
					}
				]
			}
		]
	},

	plugins: [
		// Avoid publishing files when compilation fails
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),

		new ExtractMessagesPlugin({
			outputPath: __dirname
		}),

		new ExtractTextPlugin({
			filename: 'styles.css',
			allChunks: true
		})
	],
	stats: {
		// Nice colored output
		colors: true,
		// Adds time to completion when bundling
		timings: true
	}
	// Create Sourcemaps for the bundle
};
