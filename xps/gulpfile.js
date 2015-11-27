var gulp 		= require( 'gulp' )
var fs			= require('fs')
var argv 		= require('yargs').usage('limit: $0 -limit [limit]').argv
var gutil		= require('gulp-util')

gulp.task('generate', function (cb) {

	limit = (argv.limit!=undefined)?argv.limit:24

	o = {
		totalDay:limit,
		days:{}
	}

	var dayFolder = fs.readdirSync('./');

	dayFolder.forEach(function(day) {
		if(parseInt(day) && parseInt(day)<=limit){
			var xps = fs.readdirSync('./'+day+'/');
			xps.forEach(function(xp) {
				if(o.days[parseInt(day)] == undefined)
					o.days[parseInt(day)] = []

				xpMeta = require('./'+day+'/'+xp+'/'+'info.json')
				meta = {
					title:xpMeta.title,
					author:xpMeta.author,
					website:xpMeta.website,
					twitter:xpMeta.twitter,
					folder:xp
				}
				o.days[parseInt(day)].push(meta)
			})
		}

	});

	return string_src("xp.json", JSON.stringify(o, null, 4)).pipe(gulp.dest('./'))

})

function string_src(filename, string) {
 	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
    	this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    	this.push(null)
  	}
  	return src
}
