var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: {
        'project-dashboard': './assets/js/project-dashboard.js',
		'personal-dashboard' :  './assets/js/personal-dashboard.js',
		'index' : './assets/js/index.js',
		'coding-editor' : './assets/js/coding-editor/coding-editor.js',
    },
    output: {
        path: __dirname,
        filename: '[name].dist.js'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: path.join(__dirname, 'assets/js'),
                query: {
                  presets: ['es2015', 'react'],
                },
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
        colors: true
    },
    // Create Sourcemaps for the bundle
    
};
