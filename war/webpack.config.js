var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: {
        'project-dashboard': './assets/js/project-dashboard.js',
		'personal-dashboard' :  './assets/js/personal-dashboard.js',
		'index' : './assets/js/index.js',
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
                  presets: 'es2015',
                },
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    
};
