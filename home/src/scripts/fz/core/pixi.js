const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )

class Pixi {

  constructor() {
    const opts = {
      antialias: true,
      resolution: stage.resolution,
      // resolution: 1,
      transparent: true,
      backgroundColor: 0xe9e9e9
    }
    this.renderer = new PIXI.autoDetectRenderer( 0, 0, opts )

    this.width = 0
    this.height = 0

    this.stage = new PIXI.Container()

    this.dom = this.renderer.view

    this._binds = {}
    this._binds.onUpdate = this._onUpdate.bind( this )
    this._binds.onResize = this._onResize.bind( this )
  }

  _onUpdate() {
    this.renderer.render( this.stage )
    // console.log( this.renderer.drawCount )
  }

  _onResize() {
    this.width = stage.width
    this.height = stage.height

    this.renderer.resize( this.width, this.height )
    this.renderer.view.style.width = this.width + "px"
    this.renderer.view.style.height = this.height + "px"
  }

  init() {
    loop.add( this._binds.onUpdate )
    stage.on( "resize", this._binds.onResize )
    this._onResize()
  }
}

module.exports = new Pixi()
