const gulp = require('gulp');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const beautify = require('gulp-beautify');
const jasmine = require('gulp-jasmine');
const size = require('gulp-size');
const argv = require('yargs').argv;
const replace = require('gulp-replace');
require('babel-core/register'); 

const config = require('./api_config.json');
 
var paths = {
  scripts: ['assets/js/**/*.js'],
  images: 'assets/img/**/*'
};

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

function jsBeautify(file){
	console.log(file);
	fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
			throw err;
		}
		console.log(beautify(data, { indent_size: 2 }));
	});
}

function prettify(){
	  var config = setup(options);

	return through.obj(function (file, encoding, callback) {
		var oldContent;
		var newContent;
		var type = null;

		if (file.isNull()) {
		  callback(null, file);
		  return;
		}

		if (file.isStream()) {
		  callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
		  return;
		}

		// Check if current file should be treated as JavaScript, HTML, CSS or if it should be ignored
		['js', 'css', 'html'].some(function (value) {
		  // Check if at least one element in 'file_types' is suffix of file basename
		  if (config[value].file_types.some(function (suffix) {
			return _.endsWith(path.basename(file.path), suffix);
		  })) {
			type = value;
			return true;
		  }

		  return false;
		});

		// Initialize properties for reporter
		file.jsbeautify = {};
		file.jsbeautify.type = type;
		file.jsbeautify.beautified = false;
		file.jsbeautify.canBeautify = false;

		if (type) {
		  oldContent = file.contents.toString('utf8');
		  newContent = beautify[type](oldContent, config[type]);

		  if (oldContent.toString() !== newContent.toString()) {
			if (doValidation) {
			  file.jsbeautify.canBeautify = true;
			} else {
			  file.contents = new Buffer(newContent);
			  file.jsbeautify.beautified = true;
			}
		  }
		}

		callback(null, file);
	});
}

function setConfig(){
	if (argv.api_path) config.api_path = argv.api_path; //CLI args overwrite JSON config
	if (argv.local) config.api_path = 'https://localhost:8888/_ah/api';
	if (argv.api_version) config.api_version = argv.api_version;
	if (argv.client_id) config.client_id = argv.client_id;
}

gulp.task('bundle-ci', ['bundle', 'set-constants-ci']);

gulp.task('bundle', ['format','bundle-task']);

gulp.task('bundle-task', function() {
	setConfig();
	return gulp.src('') //doesn't matter what to put as src, 
						//since webpack.config fetches from entry points
	.pipe(webpack(require('./webpack.config.js'))).on('error', handleError)
	.pipe(replace('$API_PATH$', config.api_path))
	.pipe(replace('$API_VERSION$', config.api_version))
	.pipe(replace('$CLIENT_ID$', config.client_id))
	.pipe(gulp.dest('dist/js/'));
});

gulp.task('set-react-production', function() {
	return gulp.src('./*.html', {base: './'})
	.pipe(replace('react.js', 'react.min.js'))
	.pipe(replace('react-dom.js', 'react-dom.min.js'))
	.pipe(gulp.dest('./'));
});

gulp.task('minify', function() {
	 return gulp.src('./dist/js/*.js', {base: './'})
      .pipe(uglify())
	  .pipe(size({showFiles: true, gzip: true}))
      .pipe(gulp.dest('./'));
});


gulp.task('format', function() {
  gulp.src('./assets/js/**/*.{js,jsx}', {base: './'})
    .pipe(beautify({indent_with_tabs: true, operator_position: "after-newline",jslint_happy: true, e4x: true, wrap_line_length: 0}))
    .pipe(gulp.dest('./'))
});
 
gulp.task('watch',function() {
	setConfig();
	return gulp.src('') //doesn't matter what to put as src, 
						//since webpack.config fetches from entry points
	.pipe(webpack( Object.assign(require('./webpack.config.js'), {watch:true}) )).on('error', handleError)
	.pipe(replace('$API_PATH$', config.api_path))
	.pipe(replace('$API_VERSION$', config.api_version))
	.pipe(replace('$CLIENT_ID$', config.client_id))
	.pipe(gulp.dest('dist/js/'));
});

gulp.task('test', () =>
    gulp.src('./tests/*.js').pipe(jasmine())
);
 
gulp.task('default', ['watch']);