var gulp = require('gulp');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');
var beautify = require('gulp-beautify');
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

gulp.task('bundle', function() {
	return gulp.src('') //doesn't matter what to put as src, 
						//since webpack.config fetches from entry points
	.pipe(webpack( require('./webpack.config.js') )).on('error', handleError)
	.pipe(gulp.dest('dist/js/'));
});

gulp.task('minify', function() {
	 return gulp.src('./dist/js/*.js', {base: './'})
      .pipe(uglify())
      .pipe(gulp.dest('./'));
});


gulp.task('format', function() {
  gulp.src('./assets/js/**/*.{js,jsx}', {base: './'})
    .pipe(beautify({indent_with_tabs: true, operator_position: "after-newline",jslint_happy: true, e4x: true, wrap_line_length: 0}))
    .pipe(gulp.dest('./'))
});
 
gulp.task('watch',function() {
	gulp.watch('assets/**/*.{js,jsx}',['bundle'])
});
 
gulp.task('default', ['bundle','watch']);