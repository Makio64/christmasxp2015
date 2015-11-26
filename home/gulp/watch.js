var gulp = require( "gulp" );

var paths = require( "./config" ).paths;

gulp.task( "watch", [ "watch-scripts" ] );

gulp.task( "watch-scripts", function() {

  gulp.watch( paths.build + "js/**/*.js", [ "reload" ] );

} );
