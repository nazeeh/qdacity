var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: {
		'index' : './assets/js/pages/index/index.js',
		'coding-editor' : './assets/js/pages/coding-editor/coding-editor.js',
		'uml-editor' : './assets/js/pages/uml-editor/uml-editor.js',
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
                loader: 'babel-loader',
                test: path.join(__dirname, 'assets/js'),
                query: {
                  presets: ['es2015', 'react'],
                },
            },
			  {
    test: /\.css$/, 
    loader: 'style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]'
}
        ]
    },
  
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
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
