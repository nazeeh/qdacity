var gulp = require('gulp');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');

var paths = {
  scripts: ['assets/js/**/*.js'],
  images: 'assets/img/**/*'
};

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
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
 
gulp.task('watch',function() {
	gulp.watch('assets/**/*.{js,jsx}',['bundle'])
});
 
gulp.task('default', ['watch']);