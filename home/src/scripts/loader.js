const config = require( "xmas/core/config" )
const Emitter = require( "fz/events/Emitter" )

class Loader extends Emitter {

  constructor() {
    super()

    this._pxLoader = new PxLoader()
    this._pxLoader.addFont( config.fonts.medium )
    this._pxLoader.addFont( config.fonts.bold )

    this._binds = {}
    this._binds.onProgress = this._onProgress.bind( this )
    this._binds.onComplete = this._onComplete.bind( this )
  }

  _onProgress( e ) {
    console.log( e.completedCount, e.totalCount, e.completedCount / e.totalCount )
    this.emit( "progress", e.completedCount / e.totalCount )
  }

  _onComplete() {
    this.emit( "complete" )
  }

  load() {
    this._pxLoader.addProgressListener( this._binds.onProgress )
    this._pxLoader.addCompletionListener( this._binds.onComplete )
    this._pxLoader.start()
  }

}

module.exports = new Loader()
