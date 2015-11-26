var gulp = require( "gulp" );

var browserSync = require( "browser-sync" );

var paths = require( "./config" ).paths;

gulp.task( "browser-sync", function() {
  browserSync.init( {
    server: {
      baseDir: [ paths.build ]
    }
  } );
} );

gulp.task( "reload", function() {
  browserSync.reload();
});

gulp.task( "reload-stream", function() {
  browserSync.stream();
});
