var webpackConfig = require('./webpack.config.js');

const ChromiumRevision = require('puppeteer/package.json').puppeteer
	.chromium_revision;
const Downloader = require('puppeteer/utils/ChromiumDownloader');
const revisionInfo = Downloader.revisionInfo(
	Downloader.currentPlatform(),
	ChromiumRevision
);

process.env.CHROME_BIN = revisionInfo.executablePath;

const instrumentationRule = {
	test: /\.js$|\.jsx$/,
	use: {
		loader: 'istanbul-instrumenter-loader',
		options: { esModules: true }
	},
	enforce: 'post',
	exclude: /node_modules|\.spec\.js$/
};

webpackConfig.module.rules.push(instrumentationRule);

// Karma configuration
// Generated on Mon Sep 04 2017 15:00:17 GMT+0200 (W. Europe Daylight Time)

module.exports = function(config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine-jquery', 'jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'components/jQuery/jquery-3.2.1.slim.min.js',
			'components/node_module/jasmine-jquery/lib/jasmine-jquery.js',
			'tests/unit-tests/**/*.js',
			'tests/unit-tests/**/*.jsx'
		],

		// list of files to exclude
		exclude: ['tests/unit-tests/**/*Skip.*'],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'tests/unit-tests/**/*.js': ['webpack'],
			'tests/unit-tests/**/*.jsx': ['webpack']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress', 'coverage-istanbul'],
		coverageIstanbulReporter: {
			reports: ['html', 'text-summary'],
			fixWebpackSourcePaths: true
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_DEBUG,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,

		webpack: webpackConfig
	});
};
