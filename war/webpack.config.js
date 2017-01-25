var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: {
        'project-dashboard': './assets/js/pages/project-dashboard/project-dashboard.js',
		'personal-dashboard' :  './assets/js/pages/personal-dashboard/personal-dashboard.js',
		'index' : './assets/js/pages/index/index.js',
		'coding-editor' : './assets/js/pages/coding-editor/coding-editor.js',
		'admin' : './assets/js/pages/admin/admin.js',
		'uml-editor' : './assets/js/pages/uml-editor/uml-editor.js',
    },
	resolve: {
    alias: {
         "jquery": path.join(__dirname, "./assets/js/jquery-stub.js")
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
        colors: true
    },
    // Create Sourcemaps for the bundle
    
};
