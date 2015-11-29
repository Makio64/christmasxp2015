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
    this._pixiLoader.add( "img/sprites/sprites.json" )

    this._fontsLoader = new PIXI.loaders.Loader()
    this._fontsLoader.add( "img/sprites/advent_bold.fnt" )

    this._binds = {}
    this._binds.onProgress = this._onProgress.bind( this )
    this._binds.onComplete = this._onComplete.bind( this )
    this._binds.onPixiComplete = this._onPixiComplete.bind( this )
    this._binds.onFontsComplete = this._onFontsComplete.bind( this )
  }

  _onProgress( e ) {
    console.log( e.completedCount, e.totalCount, e.completedCount / e.totalCount )
    // this.emit( "progress", e.completedCount / e.totalCount )
  }

  _onComplete() {
    this._countComplete++
    this._checkComplete()
  }

  _onPixiComplete() {
    this._countComplete++
    this._checkComplete()
  }

  _onFontsComplete() {
    this.emit( "ready" )

    this._pixiLoader.once( "complete", this._binds.onPixiComplete )
    this._pixiLoader.load()
  }

  _checkComplete() {
    console.log( this._countComplete )
    // if( this._countComplete == 2 ) {
      this.emit( "complete" )
    // }
  }

  load() {
    // this._pxLoader.addProgressListener( this._binds.onProgress )
    // this._pxLoader.addCompletionListener( this._binds.onComplete )
    // this._pxLoader.start()

    this._fontsLoader.once( "complete", this._binds.onFontsComplete )
    this._fontsLoader.load()
  }

}

module.exports = new Loader()
