const config = require( "xmas/core/config" )
const Emitter = require( "fz/events/Emitter" )
const loaderConfig = require( "loader" )

class LoaderPixi extends Emitter {

	constructor() {
		super()
		this._countComplete = 0

		this._pixiLoader = new PIXI.loaders.Loader()
		this._pixiLoader.add( "img/default.jpg" )
		this._pixiLoader.add( "img/poly_mask.png" )
		this._pixiLoader.add( "img/sprites/sprites.json" )
		this._pixiLoader.add( "img/sprites/roboto_regular.fnt" )
		this._pixiLoader.add( "img/sprites/roboto_medium.fnt" )

		this._loaderOfLoader = new PIXI.loaders.Loader()
		this._loaderOfLoader.add( "img/logo.png" )
		this._loaderOfLoader.add( "img/sprites/advent_bold.fnt" )

		this.load = this.load.bind(this)
		this.addImages = this.addImages.bind(this)
		this.binds = {}
		this.binds.onProgress = this.onProgress.bind( this )
		this.binds.onPixiComplete = this.onPixiComplete.bind( this )
		this.binds.onLoaderOfLoaderComplete = this.onLoaderOfLoaderComplete.bind( this )
	}

	onProgress( e ) {
		console.log( e.completedCount, e.totalCount, e.completedCount / e.totalCount )
	}

	onPixiComplete() {
		config.texShape = PIXI.Texture.fromFrame( "img/poly_mask.png" )
		this.emit( "complete" )
	}

	onLoaderOfLoaderComplete() {
		this.emit( "ready" )
		this._pixiLoader.once( "complete", this.binds.onPixiComplete )
		this._pixiLoader.load()
	}

	load() {
		loaderConfig.loadConfig(()=>{
			this.addImages()
			this._loaderOfLoader.once( "complete", this.binds.onLoaderOfLoaderComplete )
			this._loaderOfLoader.load()
		})
	}

	addImages() {
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

module.exports = new LoaderPixi()
