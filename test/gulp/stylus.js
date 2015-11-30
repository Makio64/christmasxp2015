var gulp 	= require( 'gulp' );

var path	= require('./config').path;

var gutil 	= require( 'gulp-util' );
var notify 	= require( 'gulp-notify' );
var plumber = require( 'gulp-plumber' );

var stylus 	= require( 'gulp-stylus' );
var nib		= require('nib');

gulp.task( 'stylus', function() {
	return gulp.src( path.stylus+'main.styl' )
		.pipe(plumber())
		.pipe( stylus( { use: [ nib() ], sourcemap: {inline: true} } ) )
			.on( 'error', gutil.log )
			.on( 'error', gutil.beep )
			.on( 'error', notify.onError('Error: <%= error.message %>') )
		.pipe( gulp.dest( path.build+'css/' ) )
		.pipe( notify({ onLast: true, message:'Stylus compile with success!'}) );
} );
