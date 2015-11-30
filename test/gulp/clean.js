var gulp 	= require( 'gulp' );
var del 	= require( 'del' );
var path 	= require( './config' ).path;

gulp.task('clean', function(cb) {
	return del([path.build], cb);
});

gulp.task('clean:dist', function (cb) {
	return del([path.dist], cb);
});

gulp.task('cleanRev', function (cb) {
	return del([path.dist+'/rev'], cb);
});
