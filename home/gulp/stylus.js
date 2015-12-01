var gulp = require( "gulp" );
var plumber = require( "gulp-plumber" );
var browserSync = require( "browser-sync" );

var stylus = require( "gulp-stylus" );
var nib = require( "nib" );

var paths = require( "./config" ).paths;

gulp.task( "styles", function() {
  create( false );
} );

gulp.task( "styles-build", function() {
  create( true );
} );

function create( isBuild ) {
  var opts = {}
  opts.use = [ nib() ];
  opts.compress = isBuild;
  opts.sourcemap = isBuild ? false : { inline: true };
  opts.url = { name: "url64" };
  return gulp.src( paths.styles + "main.styl" )
             .pipe( plumber() )
             .pipe( stylus( opts) )
             .pipe( plumber.stop() )
             .pipe( gulp.dest( ( isBuild ? paths.build : paths.dist ) + "/css" ) )
             .pipe( browserSync.stream() );
}
