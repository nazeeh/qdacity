const fs = require('fs');
const gulp = require('gulp');
const prettierEslint = require('./gulp-plugins/prettier-eslint');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const jasmine = require('gulp-jasmine');
const connect = require('gulp-connect');
const size = require('gulp-size');
const argv = require('yargs').argv;
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const path = require('path');
const process = require('process');
const filterBy = require('gulp-filter-by');
const transform = require('gulp-transform');
const rename = require('gulp-rename');
const diff = require('gulp-diff');
const chalk = require('chalk');
const log = require('fancy-log');
const jsonConcat = require('gulp-json-concat');
require('babel-core/register');
require('babel-polyfill');

const tf = require('../localization/translationFile');
const config = require('./api_config.json');

function handleError(err) {
	console.log(err.toString());
	process.exit(1);
}

function setConfig() {
	//CLI args overwrite JSON config
	if (argv.api_path) config.api_path = argv.api_path;
	if (argv.local) config.api_path = 'http://localhost:8888/_ah/api';
	if (argv.slocal) config.api_path = 'https://localhost:8888/_ah/api';
	console.log('Configured server adress: ' + config.api_path);
	if (argv.local || argv.slocal) config.sync_service = 'http://localhost:8080';
	console.log('Configured rts server adress: ' + config.sync_service);
	if (argv.api_version) config.api_version = argv.api_version;
	if (argv.client_id) config.client_id = argv.client_id;
	if (argv.local) config.test_mode = true; else config.test_mode = false;
}

gulp.task('bundle-ci', ['bundle', 'set-constants-ci']);

gulp.task('bundle', ['format', 'bundle-task']);

gulp.task('format', () => {
	return gulp
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

gulp.task('generate-language-files', () => {
	const templateFile = tf.TranslationFile.fromContent(
		fs.readFileSync('translations/template.txt', 'utf8')
	);
	const template = templateFile.getMessageIdents();

	return (
		gulp
		.src('translations/*.txt')
		.pipe(
			transform('utf8', (content, file) => {
				const translationFile = tf.TranslationFile.fromContent(content);
				const identList = translationFile.getMessageIdents();
				const messages = {};
				let fail = false;
				identList.forEach(ident => {
					if (messages[ident.id]) {
						log(chalk.yellow(`Duplicate ident ${chalk.bold(ident.id)}`));
						fail = true;
						return;
					}
					messages[ident.id] = ident.defaultMessage;
				});
				const result = JSON.stringify(messages, null, '\t');
				template.forEach(ident => {
					if (!messages.hasOwnProperty(ident.id)) {
						log(
							chalk.yellow(
								`Ident ${chalk.bold(ident.id)} is missing in translation`
							)
						);
						fail = true;
						return;
					}
					delete messages[ident.id];
				});
				fail |= Object.keys(messages).length > 0;
				if (fail) {
					for (const id of Object.keys(messages)) {
						log(
							chalk.yellow(
								`Ident ${chalk.bold(id)} does not exist in template`
							)
						);
					}
					log.error(
						chalk.red.bold(
							`Translation file ${file.relative} does not match template`
						)
					);
					// We do not throw here for several reasons.
					// a) Missing identifier is not a fatal error,
					//   neither are duplicates nor additional identifiers
					// b) we want to traverse all files and explain all errors
					// c) one file should not keep others from being processed
					// this checker might be reworked to allow the pipeline to fail
					//return Promise.reject('Translation file invalid.');
				}
				return result;
			})
		)
		.on('error', error => {
			log.error(chalk.red.bold(error));
			process.exit(1);
		})
		.pipe(rename({ extname: '.json' }))
		.pipe(gulp.dest('dist/messages/'))
		.pipe(gulp.dest('../target/qdacity-war/dist/messages/'))
	// check if messages -> template -> messages is stable
		.pipe(
			filterBy(file => {
				return file.relative.match(/template.json$/);
			})
		)
		.pipe(rename({ basename: 'en' }))
		.pipe(diff('dist/messages/'))
		.pipe(diff.reporter({ fail: true }))
		.on('error', error => {
			log.error(
				chalk.red.bold(
					'Template cannot reassemble extracted messages.\n' +
							'If you did not modify the template than its a bug'
				)
			);
			process.exit(1);
		})
	);
});

gulp.task('translation-watch', () => {
	const watcher = gulp.watch('translations/*.txt', ['generate-language-files']);
	return watcher;
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
		.pipe(replace('$TEST_MODE$', config.test_mode))
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

gulp.task('webpack-watch', function() {
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
		.pipe(replace('$TEST_MODE$', config.test_mode))
		.pipe(gulp.dest('dist/js/'))
		.pipe(gulp.dest('../target/qdacity-war/dist/js/'))
        .pipe(connect.reload())
	);
});

gulp.task('sw', function() {
	gulp
		.src('assets/js/service-worker/sw.js')
		.pipe(gulp.dest('../target/qdacity-war/'))
        .pipe(connect.reload());
});

gulp.task('sw-watch', function () {
    gulp.watch('assets/js/service-worker/sw.js', ['sw']);
});

gulp.task('connect', function() {
    connect.server({
        livereload: true,
		port:8090
    });
});

gulp.task('unit-tests', () =>
	gulp.src('./tests/unit-tests/**/*.js').pipe(jasmine())
);
gulp.task('acceptance-tests', () =>
	gulp
		.src('./tests/acceptance-tests/**/*.js')
		.pipe(jasmine())
		.on('error', handleError)
);

gulp.task('watch', ['webpack-watch', 'translation-watch', 'sw-watch']);

gulp.task('acceptance-tests', () => {
	const basePath = './tests/acceptance-tests/';
	gulp.src([
		basePath + '*.js', 
		basePath + 'coding-editor/*.js'
	]).pipe(jasmine()).on('error', handleError);
});

gulp.task('default', ['watch', 'connect']);
