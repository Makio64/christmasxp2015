var gulp 	= require( 'gulp' );

var path	= require('./config').path;

var gutil 	= require( 'gulp-util' );
var notify 	= require( 'gulp-notify' );
var plumber = require( 'gulp-plumber' );
var rename 	= require( 'gulp-rename' );

var jade 	= require( 'gulp-jade' );
var data 	= require( 'gulp-data' );
var argv    = require( 'yargs' ).string('module').argv;

gulp.task( 'jade', function() {
	
	var name = 'index.html'
	var bundle = 'js/bundle.js'
	var module = ''
	if(argv.module){
		name = 'module_'+argv.module+'.html'
		bundle = 'js/bundle'+argv.module+'.js'
		module = argv.module
	}
	return gulp.src( path.jade+'**/*.jade' )
		.pipe( plumber() )
		.pipe( data({
			BUNDLE:bundle,
			MODULE:module
		}) )
		.pipe( jade( {pretty: true} ) )
			.on( 'error', gutil.log )
			.on( 'error', gutil.beep )
			.on( 'error', notify.onError('Error: <%= error.message %>') )
		.pipe( notify({ onLast: true, message:'Jade compile with success!' }) )
		.pipe( rename( name ) )
		.pipe( gulp.dest( path.build ) );
} );
