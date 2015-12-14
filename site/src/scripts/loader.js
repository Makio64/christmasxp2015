const config = require( "xmas/core/config" )
const Emitter = require( "fz/events/Emitter" )

class Loader extends Emitter {

	constructor() {
		super()

		this._countComplete = 0

		// this._pxLoader = new PxLoader()
		// this._pxLoader.addFont( config.fonts.medium )
		// this._pxLoader.addFont( config.fonts.bold )

		this._pixiLoader = new PIXI.loaders.Loader()
    this._pixiLoader.add( "img/default.jpg" )
		this._pixiLoader.add( "img/poly_mask.png" )
		this._pixiLoader.add( "img/sprites/sprites.json" )
		this._pixiLoader.add( "img/sprites/roboto_regular.fnt" )
		this._pixiLoader.add( "img/sprites/roboto_medium.fnt" )

		this._loaderOfLoader = new PIXI.loaders.Loader()
		this._loaderOfLoader.add( "img/logo.png" )
		this._loaderOfLoader.add( "img/sprites/advent_bold.fnt" )

		this._binds = {}
		this._binds.onProgress = this._onProgress.bind( this )
		this._binds.onPixiComplete = this._onPixiComplete.bind( this )
		this._binds.onLoaderOfLoaderComplete = this._onLoaderOfLoaderComplete.bind( this )
	}

	_onProgress( e ) {
		console.log( e.completedCount, e.totalCount, e.completedCount / e.totalCount )
		// this.emit( "progress", e.completedCount / e.totalCount )
	}

	_onPixiComplete() {
    config.texShape = PIXI.Texture.fromFrame( "img/poly_mask.png" )
		this.emit( "complete" )
	}

	_onLoaderOfLoaderComplete() {
		this.emit( "ready" )

		this._pixiLoader.once( "complete", this._binds.onPixiComplete )
		this._pixiLoader.load()
	}


	load() {
		// this._pxLoader.addProgressListener( this._binds.onProgress )
		// this._pxLoader.start()

		this.loadConfig(()=>{
		console.log('load')
		this._addImages()
		this._loaderOfLoader.once( "complete", this._binds.onLoaderOfLoaderComplete )
		this._loaderOfLoader.load()
	})
	}

	loadConfig(cb) {
		const xobj = new XMLHttpRequest()
			xobj.overrideMimeType( "application/json" )
			xobj.open( "GET", "/xp.json?" + ( Math.random() * 10000 >> 0 ), true ) // Replace 'my_data' with the path to your file
			xobj.onreadystatechange = () => {
						if ( xobj.readyState == 4 && xobj.status == "200" ) {
							this._countComplete++
							config.data = JSON.parse( xobj.responseText )
				if(cb)cb();
						}
			}
			xobj.send( null )
	}

	_addImages() {
		let idx = ""
		let j = 0
		let m = 0
		let data = null
		let dataEntry = null
		const n = config.data.totalDay
		for( let i = 0; i < n; i++ ) {
			data = config.data.days[ i + 1 ]
			m = data.length
			idx = "" + ( i + 1 )
			if( i < 9 ) {
				idx = "0" + idx
			}
			for( j = 0; j < m; j++ ) {
				dataEntry = data[ j ]
				dataEntry.path = "./" + idx + dataEntry.folder
				dataEntry.pathPreview = dataEntry.path + "preview.jpg"
				this._pixiLoader.add( dataEntry.pathPreview )
			}
		}

	}

}

module.exports = new Loader()
