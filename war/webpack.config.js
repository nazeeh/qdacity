var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		'index' : './assets/js/pages/index/index.js'
    },
	resolve: {
    alias: {
         "jquery": path.join(__dirname, "./assets/js/jquery-stub.js"),
		 "endpoints": path.resolve(__dirname, "./assets/js/common/endpoints"),
		 "modals": path.resolve(__dirname, "./assets/js/common/modals"),
    }
},
    output: {
        path: __dirname,
        filename: '[name].dist.js'
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        react: "React"
    },
    module: {
        loaders: [
			{
				test: /\.((png|jpg|gif|svg|eot|ttf|woff|woff2)(\?|=|.|[a-z]|[0-9])*)$/,
				loader: 'url-loader',
				options: {
				  limit: 10000
				}
			}
        ],
		rules: [
			{
				test: path.join(__dirname, 'assets/js'),
				use: {
					loader: 'babel-loader',
					options: {
					  presets: ['es2015', 'react']
					}
				}
			},
			{
				test: /\.css$/, 
				use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
			}
		]
    },
  
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    }
  }),
  
	  new ExtractTextPlugin({
		  filename: "styles.css",
		  allChunks: true
	  })
    ],
    stats: {
        // Nice colored output
        colors: true,
		// Adds time to completion when bundling
		timings: true
    },
    // Create Sourcemaps for the bundle
    
};
