const config = require( "xmas/core/config" )
const BaseEntry = require( "xmas/home/entry/BaseEntry" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntryComingSoon extends BaseEntry {

  constructor() {
    super()

    this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this.addChild( this._layer )

    this._cntContent = this._createContent()
    this._cntContent.y = this._h - this._cntContent.height >> 1
    this.addChild( this._cntContent )
  }

  _createContent() {
    const cnt = new PIXI.Container()

    this._cntTfTop = uXmasTexts.create( "more fun", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2 )
    this._cntTfTop.x = this._w - this._cntTfTop.width >> 1
    cnt.addChild( this._cntTfTop )

    this._cntTfBottom = uXmasTexts.create( "coming soon", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2 )
    this._cntTfBottom.x = this._w - this._cntTfBottom.width >> 1
    this._cntTfBottom.y = 32
    cnt.addChild( this._cntTfBottom )

    return cnt
  }

}

module.exports = EntryComingSoon
