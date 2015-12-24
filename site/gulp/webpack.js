var gulp        	= require('gulp');
var path        	= require('./config').paths;
var webpack 			= require('webpack');
var webpackSteam  = require('webpack-stream');
var argv        	= require('yargs').string('module').argv;
var fs						= require('fs');

gulp.task('webpack', function() { return createWebpack(false,false)});
gulp.task('webpack-build', function() {return createWebpack(true,false)});

function createWebpack(build,watch){
	var plugins = []

	if(build){
		plugins.push( new webpack.optimize.OccurenceOrderPlugin() )
		plugins.push( new webpack.optimize.DedupePlugin() )
		plugins.push( new webpack.optimize.CommonsChunkPlugin({children: true, async: true}) )
		plugins.push( new webpack.optimize.UglifyJsPlugin({sourceMap:false,compress: {warnings: false}}) )
		devtool = ''
	}

	plugins.push(new webpack.ProvidePlugin({
		PIXI: "PIXI",
		TweenMax: "TweenMax",
		dat: "dat",
		page: "page",
	}))

	return gulp.src(path.scripts+'main.js').pipe(webpackSteam({
		devtool: 'source-map',
		debug:false,
		cache:false,
		module: {
			loaders: [
				// we don't have shaders??
				// { test: /\.(glsl|vs|fs)$/, loader: 'shader' },
				{ test: /\.json$/, loader: 'json' },
				{ test: /\.jsx?$/, exclude: /(node_modules|bower_components)/,loader: 'babel',query: {presets: ['es2015']} },
				// { test: /\.js$/, exclude: [__dirname, 'node_modules'], loader: ['raw','script']  }
			],
		},
		// glsl: { chunkPath: __dirname+'/../'+path.glsl+'chunks' },
		output: {
			path: __dirname+'/../'+path.build+'js/',
			filename: 'bundle.js',
			chunkFilename: "[id].[hash].bundle.js",
			publicPath:'./js/'
		},
		resolve: {
			extensions:['','.glsl','.fs','.vs','.json','.js'],
			root:[
				__dirname+'/../'+path.scripts,
				__dirname+'/../'+path.data,
				__dirname+'/../'+path.vendors,
				__dirname+'/../'+path.glsl
			],
			alias: {
				page: __dirname+'/../'+path.vendors+"page.js",
				PIXI: __dirname+'/../'+path.vendors+"pixi.js",
				dat: __dirname+'/../'+path.vendors+"dat.gui.js",
				TweenMax: __dirname+'/../'+path.vendors+"TweenMax.js",
			}
		},
		plugins:plugins
	})).pipe(gulp.dest(path.build+'js/'));
}
