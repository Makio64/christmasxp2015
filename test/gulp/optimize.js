/**
 * Optimize final files
 */

var gulp 		= require('gulp');
var path 		= require('./config').path;

var imageOptimizationLevel = require('./config').imageOptimizationLevel;

var imagemin	= require('gulp-imagemin');
var cssmin 		= require('gulp-cssmin');

var rev 		= require('gulp-rev');
var collect 	= require('gulp-rev-collector');

var gzip 		= require('gulp-gzip');

gulp.task( 'copyToDist', function() {
	gulp.src([
			path.static+'**/*.*',
			path.static+'.*',
			'!'+path.static+'img/**/*.*',
			'!'+path.static+'vendor/**/*.*',
			'!'+path.static+'**/*.map'
		])
		.pipe(gulp.dest(path.dist))

	return gulp.src([
			path.build+'**/*.*',
			'!'+path.build+'css/**/*.*',
			'!'+path.build+'js/**/*.map',
			'!'+path.build+'js/bundle.js'
		])
		.pipe(gulp.dest(path.dist))
})

gulp.task('imagemin', function() {
  return gulp.src(path.static+path.img+'**/*.*')
	.pipe(imagemin({
		optimizationLevel: imageOptimizationLevel
	}))
	.pipe(gulp.dest(path.dist+path.img))
});


gulp.task('cssmin', function () {
	return gulp.src(path.build+'/**/*.css')
		.pipe(cssmin())
		.pipe(rev())
		.pipe(gulp.dest(path.dist))
		.pipe(rev.manifest({ path: 'manifest.json',merge: true }))
		.pipe(gulp.dest( path.dist+'rev/css' ) );
});

gulp.task('rev-js', function () {
	return gulp.src(path.build+'/js/bundle.js', {base:path.build})
		.pipe(rev())
		.pipe(gulp.dest(path.dist))
		.pipe(rev.manifest({ path: 'manifest.json',merge: true }))
		.pipe(gulp.dest( path.dist+'rev/js' ) );
});

gulp.task('rev', function() {
	return gulp.src([path.dist+'rev/**/*.json', path.dist+'**.html'])
		.pipe( collect({
			replaceReved: true,
		}) )
		.pipe( gulp.dest('dist') );
});

gulp.task('gzip-deploy', function () {
	console.log(path.dist)
	return gulp.src(path.dist+'**/*')
		.pipe(gzip())
		.pipe(gulp.dest(path.dist));
});
