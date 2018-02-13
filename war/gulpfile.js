const gulp = require('gulp');
const prettierEslint = require('./gulp-plugins/prettier-eslint');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const jasmine = require('gulp-jasmine');
const size = require('gulp-size');
const argv = require('yargs').argv;
const replace = require('gulp-replace');
const babel = require("gulp-babel");
const path = require('path');
const process = require('process');
const filterBy = require('gulp-filter-by');
const transform = require('gulp-transform');
const rename = require("gulp-rename");
const jsonConcat = require('gulp-json-concat');
require('babel-core/register');

const config = require('./api_config.json');

function handleError(err) {
	console.log(err.toString());
	process.exit(1);
}

function setConfig() {
	if (argv.api_path) config.api_path = argv.api_path; //CLI args overwrite JSON config
	if (argv.local) config.api_path = 'http://localhost:8888/_ah/api';
	if (argv.slocal) config.api_path = 'https://localhost:8888/_ah/api';
	console.log('Configured server adress: ' + config.api_path);
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

gulp.task('combine-messages', ['bundle-task'], () =>
	gulp.src('./messages/**/*.json', { base: './' })
		.pipe(jsonConcat('en.json', function(data) {
			const messages = {};
			for(const messageIdents of Object.values(data)) {
				for(const messageIdent of messageIdents) {
					if(messages[messageIdent.id] != undefined) {
						if (messages[messageIdent.id] == messageIdent.defaultMessage) continue;
						throw new Error(`Colliding message identifiers found: ${messageIdent.id}`);
					}
					messages[messageIdent.id] = messageIdent.defaultMessage;
				}
			}
			return new Buffer(JSON.stringify(messages, null, 2));
		})).on('error', error => console.error(error))
		.pipe(gulp.dest('./dist/messages'))
		.pipe(gulp.dest('../target/qdacity-war/dist/messages/'))
);

gulp.task('generate-language-template', ['combine-messages'], () =>
	gulp.src('./dist/messages/en.json', { base: './' })
		.pipe(jsonConcat('en.json', function(data) {
			const messages = data.en; // en.json contents
			for(const key in messages) {
				messages[key] = 'TRαNsLÄTəD “STRiNG”';
			}
			return new Buffer(JSON.stringify(messages, null, 2));
		})).on('error', error => console.error(error))
		.pipe(rename({ basename: 'test'}))
		.pipe(gulp.dest('./dist/messages'))
		.pipe(gulp.dest('../target/qdacity-war/dist/messages/'))
);

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
				},
				output: {
					ascii_only: true
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
