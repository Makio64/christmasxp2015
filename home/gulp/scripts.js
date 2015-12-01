var gulp = require( "gulp" );
var gutil = require( "gulp-util" );
var plumber = require( "gulp-plumber" );

var browserify = require( "browserify" );
var babelify = require( "babelify" );
var watchify = require( "watchify" );
var source = require( "vinyl-source-stream" );

//

var paths = require( "./config" ).paths;

var w = null;

gulp.task( "scripts", function() {
  create( false );
} );

function create( isBuild ) {
  _isBuild = isBuild;

  watchify.args.paths = [ paths.scripts ];
  watchify.args.extensions = [ ".js" ];
  watchify.args.debug = false;
  watchify.args.fullPaths = false;

  var b = browserify( paths.scripts + "main.js", watchify.args );
  b.transform( babelify );

  w = watchify( b, { poll: true } );
  w.on( "update", bundle );

  return bundle();
}

function bundle() {
  return w.bundle()
            .on( "error", gutil.log )
          .pipe( source( "main.js" ) )
          .pipe( gulp.dest( paths.build + "/js" ) );
}
