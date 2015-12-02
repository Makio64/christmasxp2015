const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )

const Logo = require( "xmas/ui/Logo" )
const Bts = require( "xmas/ui/Bts" )

class Ui extends PIXI.Container {

  constructor() {
    super()

    pixi.stage.addChild( this )

    this._logo = new Logo()
    this.addChild( this._logo )

    this._binds = {}
    this._binds.onResize = this._onResize.bind( this )

    this._onResize()
    this._logo.y = stage.height >> 1
  }

  _onResize() {
    // this._title.x = stage.width - this._title.width >> 1
    // this._title.y = stage.height - this._title.height >> 1
    // this._title.y += -100

    // this._progressBar.y = this._title.y - 50

    // this._logo.x = this._title.x + 270
    // this._logo.y = this._title.y + 142

    this._logo.x = stage.width >> 1

    if( this._bts ) {
      this._bts.x = stage.width - 215
      this._bts.y = 20
    }
  }

  showLoading() {
    this._logo.show()
  }

  hideLoading(  ) {
    this._logo.hideLoading(  )
  }

  showBts() {
    this._bts = new Bts()
    this.addChild( this._bts )
    this._onResize()

    this._bts.show( 5 )
  }

  bindEvents() {
    stage.on( "resize", this._binds.onResize )
  }

}

module.exports = Ui
