const config = require( "xmas/core/config" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntryNumber extends PIXI.Container {

  constructor( idx ) {
    super()

    this._bg = new PIXI.Sprite( PIXI.Texture.fromFrame( "bg-entry-number_2x.png" ) )
    this._bg.scale.set( .5, .5 )
    this.addChild( this._bg )

    this._cntText = uXmasTexts.create( "0" + idx,  { font: "10px " + config.fonts.bold, fill: 0xffffff } )
    this._cntText.x = this._bg.width - this._cntText.width >> 1
    this._cntText.y = this._bg.height - this._cntText.height >> 1
    this._cntText.x -= 1
    this._cntText.y -= 1
    this.addChild( this._cntText )

    // this._createArrow()
  }

  _createArrow() {
    this._cntArrow = new PIXI.Container()
    this._cntArrow.y = this._bg.height >> 1
    this.addChild( this._cntArrow )

    this._wArrowLine = 22
    this._sizeArrowEnd = 5

    this._arrowLine = new PIXI.Graphics()
    this._arrowLine.lineStyle( 2, 0xffffff )
    this._arrowLine.moveTo( 0, 0 )
    this._arrowLine.lineTo( this._wArrowLine, 0 )
    this._cntArrow.addChild( this._arrowLine )

    this._arrowEnd = new PIXI.Graphics()
    this._arrowEnd.lineStyle( 2, 0xffffff )
    this._arrowEnd.moveTo( -this._sizeArrowEnd, -this._sizeArrowEnd )
    this._arrowEnd.lineTo( 0, 0 )
    this._arrowEnd.lineTo( -this._sizeArrowEnd, this._sizeArrowEnd )
    this._arrowEnd.x = this._wArrowLine
    this._cntArrow.addChild( this._arrowEnd )
  }

}

module.exports = EntryNumber
