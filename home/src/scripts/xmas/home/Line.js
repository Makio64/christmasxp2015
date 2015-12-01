const config = require( "xmas/core/config" )
const Entry = require( "xmas/home/entry/Entry" )
const uXmasTexts = require( "xmas/utils/texts" )

class Line extends PIXI.Container {

  constructor( idx, count = 0 ) {
    super()

    this._idx = idx
    this._count = count

    this.isShown = false

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
    cntLeft.y = 31
    this._cntTitle.addChild( cntLeft )

    if( this._idx == 1 ) {
      this._cntTfDay = uXmasTexts.create( "DAY", { font: "20px " + config.fonts.bold, fill: config.colors.red }, 1 )
      this._cntTfDay.alpha = 0
      cntLeft.addChild( this._cntTfDay )
    }

    this._line = new PIXI.Graphics()
    this._line.x = 20
    this._line.y = 26
    this._line.lineStyle( 1, config.colors.blue )
    this._line.moveTo( -20, 0 )
    this._line.lineTo( 0, 0 )
    this._line.scale.x = 0
    cntLeft.addChild( this._line )

    this._cntTfNumber = uXmasTexts.create( this._idx + "", { font: "120px " + config.fonts.bold, fill: config.colors.red } )
    this._cntTfNumber.x = 36
    this._cntTfNumber.alpha = 0
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

  bindEvents() {
    const n = this._cntEntries.children.length
    for( let i = 0; i < n; i++ ) {
      this._cntEntries.children[ i ].bindEvents() 
    }
  }

  unbindEvents() {
    const n = this._cntEntries.children.length
    for( let i = 0; i < n; i++ ) {
      this._cntEntries.children[ i ].unbindEvents() 
    }
  }

  show( delay = 0 ) {
    if( this.isShown ) {
      return
    }
    this.isShown = true

    if( this._idx == 1 ) {
      let letter = null
      const  n = this._cntTfDay.children.length
      for( let i = 0; i < n; i++ ) {
        letter = this._cntTfDay.children[ i ]
        letter.alpha = 0
        TweenLite.to( letter, .8, {
          delay: delay + .1 + ( n - i ) * .1,
          alpha: 1,
          ease: Cubic.easeInOut
        } )
      }
      TweenLite.set( this._cntTfDay, {
        delay: delay + .04,
        alpha: 1,
      })
    }
    TweenLite.to( this._line.scale, .8, {
      delay: delay + .04,
      x: 1,
      ease: Cubic.easeInOut
    })

    TweenLite.to( this._cntTfNumber, .8, {
      delay: delay,
      alpha: 1,
      ease: Cubic.easeInOut
    })

    this._showEntries( delay + .3 )
  }

  _showEntries( delay ) {
    let d = 0
    let dAdd = .06
    let dMin = .01
    let dFriction = .85

    let entry = null
    const n = this._cntEntries.children.length
    for( let i = 0; i < n; i++ ) {
      entry = this._cntEntries.children[ i ]
      entry.show( delay + d )

      d += dAdd
      dAdd *= dFriction
      if( dAdd < dMin ) {
        dAdd = dMin
      }
    }
  }

  hide( delay = 0 ) {
    let d = 0
    let dAdd = .06
    let dMin = .01
    let dFriction = .85

    let entry = null
    const n = this._cntEntries.children.length
    for( let i = 0; i < n; i++ ) {
      entry = this._cntEntries.children[ i ]
      entry.hide( delay + d )

      d += dAdd
      dAdd *= dFriction
      if( dAdd < dMin ) {
        dAdd = dMin
      }
    } 
  }

}

module.exports = Line
