const config = require( "xmas/core/config" )

class Loader {

	constructor() {}

	loadConfig(cb) {
		const xhr = new XMLHttpRequest()
		xhr.overrideMimeType( "application/json" )
		xhr.open( "GET", "/xp.json?" + ( Math.random() * 10000 >> 0 ), true )
		xhr.onreadystatechange = () => {
			if ( xhr.readyState == 4 && xhr.status == "200" ) {
				this._countComplete++
				config.data = JSON.parse( xhr.responseText )
				if(cb)cb();
			}
		}
		xhr.send( null )
	}
}

module.exports = new Loader()
