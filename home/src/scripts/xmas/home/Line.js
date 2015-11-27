const config = require( "xmas/core/config" )
const Entry = require( "xmas/home/entry/Entry" )
const uXmasTexts = require( "xmas/utils/texts" )

class Line extends PIXI.Container {

  constructor( idx, count = 0 ) {
    super()

    this._idx = idx
    this._count = count

    this._createTitle()

    this._cntEntries = new PIXI.Container()
    this._cntEntries.x = 145
    this.addChild( this._cntEntries )
    if( count > 0 ) {
      this._createEntries()
    } else {
      this._createDummy()
    }
  }

  _createTitle() {
    this._cntTitle = new PIXI.Container()
    this._cntTitle.x = 35 
    this._cntTitle.y = 60

    const cntLeft = new PIXI.Container()
    cntLeft.y = 26
    this._cntTitle.addChild( cntLeft )

    this._cntTfDay = uXmasTexts.create( "DAY", { font: "10px " + config.fonts.bold, fill: config.colors.red }, 1 )
    cntLeft.addChild( this._cntTfDay )

    this._line = new PIXI.Graphics()
    this._line.y = 26
    this._line.lineStyle( 1, config.colors.blue )
    this._line.moveTo( 0, 0 )
    this._line.lineTo( 20, 0 )
    cntLeft.addChild( this._line )

    this._cntTfNumber = uXmasTexts.create( this._idx + "", { font: "60px " + config.fonts.bold, fill: config.colors.red } )
    this._cntTfNumber.x = 36
    this._cntTitle.addChild( this._cntTfNumber )


    this.addChild( this._cntTitle )
  }

  _createEntries() {
    const as = [ 0, Math.PI * .5, 0, Math.PI * .5 ]

    let px = 0
    let yTime = 0
    let entry = null
    for( let i = 0; i < this._count; i++ ) {
      entry = new Entry( i + 1 )
      entry.x += px
      entry.y = Math.sin( as[ i ] ) * 25 >> 0
      this._cntEntries.addChild( entry )

      px += 180

      yTime += Math.PI * .75
    }
  }

  _createDummy() {
    const entry = new Entry()
    this._cntEntries.addChild( entry )
  }

}

module.exports = Line
