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

	var dayFolder = fs.readdirSync('./')

	var index = 0

	var files = [
		'!gulpfile.js',
		'!node_modules/',
		'!package.json',
		'!README.md'
	]

	dayFolder.forEach(function(day) {
		if(parseInt(day) && parseInt(day)<=limit){
			files.push(day+'/**/*.*')
			var xps = fs.readdirSync('./'+day+'/');
			xps.forEach(function(xp) {
				if(o.days[parseInt(day)] == undefined)
					o.days[parseInt(day)] = []

				xpMeta = require('./'+day+'/'+xp+'/'+'infos.json')
				meta = {
					uid:index,
					title:xpMeta.title,
					author:xpMeta.author,
					website:xpMeta.website,
					twitter:xpMeta.twitter,
					folder:'/'+xp+'/',
					path:'/'+day+'/'+xp+'/'
				}

				o.days[parseInt(day)].push(meta)
				index++
			})

			//Copy the files
			gulp.src(files).pipe(gulp.dest('../site/build/'+day))
		}

	});
	o.totalXP = index
	string_src("xp.json", JSON.stringify(o, null, 4)).pipe(gulp.dest('../site/build'))

})

function string_src(filename, string) {
 	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
    	this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    	this.push(null)
  	}
  	return src
}
