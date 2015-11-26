var gulp = require( "gulp" );

var runSequence = require( "run-sequence" );

gulp.task( "default", function( cb ) {

  runSequence( [ "build" ], [ "browser-sync" ], [ "watch" ], cb )

} );

gulp.task( "build", function( cb ) {

  runSequence( [ "scripts" ], cb );

})
