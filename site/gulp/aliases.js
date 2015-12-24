var gulp = require( "gulp" );

var runSequence = require( "run-sequence" );

gulp.task( "default", function( cb ) {
	runSequence( [ "build" ], [ "browser-sync" ], [ "watch" ], cb )
} );

gulp.task( "build", function( cb ) {
	runSequence( [ "webpack", "styles-build" ], cb );
})

gulp.task( "optimize", function( cb ) {
	runSequence( [ "webpack-build", "styles-build" ], "copyToDist", [ "js", "json" ], cb );
})
