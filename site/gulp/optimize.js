const gulp = require('gulp');

//copy all but not image/html/js/css
gulp.task('copyToDist', function(cb) {
	return gulp.src([
		'build/**/*.*',
		'!build/**/*.map'
	])
	.pipe(gulp.dest('dist/'));
})
// IMAGE
const imagemin = require('gulp-imagemin');

gulp.task('imagemin', function(cb) {
		return gulp.src('build/**/*.+(jpg|jpeg|png|gif|svg)')
				.pipe(imagemin({
						progressive: true,
						optimizationLevel: 3
				}))
				.pipe(gulp.dest('dist/'));
});

// CSS +  JS
useref = require('gulp-useref');
gulpif = require('gulp-if'),
uglify = require('gulp-uglify'),
minifyCss = require('gulp-minify-css');

gulp.task('js', function () {
		return gulp.src('build/js/**/*.js')
				.pipe( uglify() )
				.pipe(gulp.dest('dist/js'));
});

var jsonmin = require('gulp-jsonmin');
gulp.task('json', function () {
		return gulp.src(['build/**/*.json'])
				.pipe( jsonmin() )
				.pipe(gulp.dest('dist/'));
});
