const gulp = require('gulp');

//copy all but not image/html/js/css
gulp.task('copyToDist', function(cb) {
	return gulp.src([
		'build/**/*.*',
	])
	.pipe(gulp.dest('dist/'));
})
// IMAGE
const imagemin = require('gulp-imagemin');

gulp.task('imagemin', function(cb) {
    return gulp.src('build/**/*.+(jpg|jpeg|png|gif|svg)')
        .pipe(imagemin({
            progressive: true,
			optimizationLevel: 1
        }))
        .pipe(gulp.dest('dist/'));
});


// CSS +  JS
useref = require('gulp-useref');
gulpif = require('gulp-if'),
uglify = require('gulp-uglify'),
minifyCss = require('gulp-minify-css');

gulp.task('html', function () {
    return gulp.src(['build/**/*.js'])
        // .pipe(useref())
        .pipe( uglify() )
        // .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist/'));
});

var jsonmin = require('gulp-jsonmin');
gulp.task('json', function () {
    return gulp.src(['build/**/*.json'])
        .pipe( jsonmin() )
        .pipe(gulp.dest('dist/'));
});
