const gulp = require('gulp');
const prettierEslint = require('./gulp-plugins/prettier-eslint');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const jasmine = require('gulp-jasmine');
const size = require('gulp-size');
const argv = require('yargs').argv;
const replace = require('gulp-replace');
require('babel-core/register');

const config = require('./api_config.json');

function handleError(err) {
	console.log(err.toString());
	process.exit(1);
}

function setConfig() {
	if (argv.api_path) config.api_path = argv.api_path; //CLI args overwrite JSON config
	if (argv.local) config.api_path = 'http://localhost:8888/_ah/api';
	if (argv.api_version) config.api_version = argv.api_version;
	if (argv.client_id) config.client_id = argv.client_id;
}

gulp.task('bundle-ci', ['bundle', 'set-constants-ci']);

gulp.task('bundle', ['format', 'bundle-task']);

gulp.task('format', () => {
	gulp
		.src([
			'**/*.jsx',
			'**/*.js',
			'!dist/**',
			'!WEB-INF/**',
			'!node_modules/**',
			'!components/**',
			'!tests/**'
		])
		.pipe(prettierEslint())
		.pipe(gulp.dest('./'));
});

gulp.task('bundle-task', function() {
	setConfig();
	return (gulp
		.src('') //doesn't matter what to put as src,
	//since webpack.config fetches from entry points
		.pipe(webpack(require('./webpack.config.js')))
		.on('error', handleError)
		.pipe(replace('$API_PATH$', config.api_path))
		.pipe(replace('$API_VERSION$', config.api_version))
		.pipe(replace('$CLIENT_ID$', config.client_id))
		.pipe(replace('$SYNC_SERVICE$', config.sync_service))
		.pipe(gulp.dest('dist/js/'))
		.pipe(gulp.dest('../target/qdacity-war/dist/js/')) );
});

gulp.task('set-react-production', function() {
	return gulp
		.src('./*.jsp', {
			base: './'
		})
		.pipe(replace('react.js', 'react.min.js'))
		.pipe(replace('react-dom.js', 'react-dom.min.js'))
		.pipe(gulp.dest('./'));
});

gulp.task('minify', function() {
	return gulp
		.src('../target/qdacity-war/dist/js/*.js', {
			base: './'
		})
		.pipe(
			uglify({
				mangle: {
					toplevel: true,
					eval: true
				},
				compress: {
					unused: true,
					pure_getters: true,
					evaluate: true,
					booleans: true,
					hoist_funs: true,
					collapse_vars: true,
					drop_console: true
				}
			})
		)
		.pipe(
			size({
				showFiles: true,
				gzip: true
			})
		)
		.pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
	setConfig();
	return (gulp
		.src('') //doesn't matter what to put as src,
	//since webpack.config fetches from entry points
		.pipe(
			webpack(
				Object.assign(require('./webpack.config.js'), {
					watch: true
				})
			)
		)
		.on('error', handleError)
		.pipe(replace('$API_PATH$', config.api_path))
		.pipe(replace('$API_VERSION$', config.api_version))
		.pipe(replace('$CLIENT_ID$', config.client_id))
		.pipe(replace('$SYNC_SERVICE$', config.sync_service))
		.pipe(gulp.dest('dist/js/'))
		.pipe(gulp.dest('../target/qdacity-war/dist/js/')) );
});

gulp.task('test', () => gulp.src('./tests/*.js').pipe(jasmine()));

gulp.task('default', ['watch']);
