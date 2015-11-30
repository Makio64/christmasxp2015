var src 	= './src/';
var build 	= './build/';
var dist 	= './dist/';
var static 	= './static/';

module.exports =
{
	imageOptimizationLevel : 2,
	port : 9000,
	path :
	{
		build : build,
		src : src ,
		dist : dist,
		static : static,
		img: 'img/',
		jade : src+'jade/',
		coffee : src+'coffee/',
		stylus : src+'stylus/',
		glsl : src+'glsl/',
		sprite : src+'/img.sprite.src/',
		data : static+'data/',
		vendors: static+'vendors/'
	}
};
