var gulp        = require('gulp');

var path        = require('./config').path;
var pp 			= require('path');
var port        = require('./config').port;

var webpack     = require("webpack");
var webpackGulp = require('gulp-webpack');

var argv        = require('yargs').string('module').argv;
var fs			= require('fs');

var entryCoffee = path.coffee
var argvmodule = argv.module
if(argv.module){

	var tasks = fs.readdirSync(entryCoffee+'modules/');

	reg = new RegExp(argv.module,"gi");
	tasks.forEach(function(task) {
		if(reg.test(task)){
			argv.module = task;
		}
	})

	var entryFile = argv.module.toString()
		entryFile = entryFile.split("_")[1]

	entryCoffee += 'modules/'+argv.module+'/'+entryFile+'.coffee'
}

else{
	entryCoffee += 'Preloader.coffee'
}

gulp.task('webpack', function() {
	return createWebpack(false,false)
});

gulp.task('webpack-watch', function() {
	return createWebpack(false,true)
});

gulp.task('webpack-build', function() {
	return createWebpack(true,false)
});

function createWebpack(build,watch){
	console.log(argv.module)
	//default
	var plugins = []
	var debug 	= true
	var devtool = 'source-map'
	var vendors = __dirname+'/../'+path.vendors

	if(build||!watch){
		plugins.push( new webpack.optimize.OccurenceOrderPlugin() )
		plugins.push( new webpack.optimize.DedupePlugin() )
		plugins.push( new webpack.optimize.CommonsChunkPlugin({children: true, async: true}) )
	}

	if(build){
		plugins.push( new webpack.optimize.UglifyJsPlugin({sourceMap:false,compress: {warnings: false}}) )
		debug 	= false
		devtool = ''
	}

	plugins.push(new webpack.ProvidePlugin({
		PIXI: "PIXI",
		TweenMax: "TweenMax",
	}))

	// TEST
	// plugins.push( new webpack.optimize.DedupePlugin() )
	// plugins.push( new webpack.optimize.AggressiveMergingPlugin() )

	return gulp.src(entryCoffee)
			.pipe(webpackGulp({
				devtool: devtool,
				debug: debug,
				watch: watch,
				watchOptions:{
					aggregateTimeout: 50
				},
				cache:false,
				devServer:{
					port:port
				},
				module: {
					loaders: [
						{ test: /\.coffee$/, loader: 'coffee' },
					],
				},
				output: {
					path: __dirname+'/../'+path.build+'js/',
					filename: argvmodule?'bundle'+argvmodule+'.js':'bundle.js',
					chunkFilename: "[id].[hash].bundle.js",
					publicPath:'./js/'
				},
				resolve: {
					extensions:['','.coffee','.glsl','.fs','.vs','.json'],
					root:[
						__dirname+'/../'+path.coffee,
						__dirname+'/../'+path.data,
						__dirname+'/../'+path.glsl
					],
					alias: {
						PIXI: vendors+"pixi/pixi.js",
						TweenMax: vendors+"gsap/src/uncompressed/TweenMax.js",
					}
				},
				plugins:plugins
			}))
			.pipe(gulp.dest(path.build+'js/'));
}
