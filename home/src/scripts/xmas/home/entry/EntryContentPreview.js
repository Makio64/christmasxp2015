const uImg = require( "fz/utils/images" )
const pixi = require( "fz/core/pixi" )
const config = require( "xmas/core/config" )
const BaseEntry = require( "xmas/home/entry/BaseEntry" )

class EntryContentPreview extends BaseEntry {

  constructor() {
    super()

    this._cntPreview = this._createPreview()
    this.addChild( this._cntPreview )

    this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this._layer.tint = config.colors.blue
    this._layer.alpha = .95
    this.addChild( this._layer )
  }

  _createPreview() {
    const cnt = new PIXI.Container()

    this._img = new PIXI.Sprite( PIXI.Texture.fromFrame( "img/default.jpg" ) )
    const fit = uImg.fit( this._img.width, this._img.height, this._w, this._h )
    this._img.width = fit.width >> 0
    this._img.height = fit.height >> 0
    this._img.x = this._w - fit.width >> 1
    this._img.y = this._h - fit.height >> 1
    this.addChild( this._img )

    return cnt
  }

  _updateMsk() {
    super._updateMsk()

    this._msk.beginFill( 0x00ff00 )
    this._drawCircleMask()
  }

  _drawCircleMask() {
    this._msk.drawCircle( 0, 0, this._w >> 1 )
  }

}

module.exports = EntryContentPreview
