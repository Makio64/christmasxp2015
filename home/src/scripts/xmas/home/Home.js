const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )
const loop = require( "fz/core/loop" )
const uMaths = require( "fz/utils/maths" )
const Line = require( "xmas/home/Line" )

class Home extends PIXI.Container {

  constructor() {
    super()

    this._idx = 0
    this._idxToHide = 0

    this._isShown = false

    this._hLine = 220

    this._yMin = 0
    this._yMax = 205
    this._yTo = this._yMax

    this._cntLines = new PIXI.Container()
    this._cntLines.y = this._yTo
    this.addChild( this._cntLines )

    this._createLines()

    this._binds = {}
    this._binds.onResize = this._onResize.bind( this )
    this._binds.onMouseScroll = this._onMouseScroll.bind( this )
    this._binds.onUpdate = this._onUpdate.bind( this )
  }

  _onResize() {
    // let w = 980
    // if( stage.width < 1000 ) {
      // w = 880
    // }
    let w = 880
    this._cntLines.x = stage.width - w >> 1

    this._yMin = -26 * this._hLine + stage.height

    this._countLinesVisible = Math.ceil( ( stage.height - this._yMax ) / this._hLine )
    this._countLinesVisible += 1

    this._updateVisibles()
  }

  _onMouseScroll( e ) {
    e.preventDefault()

    this._isDragDrop = false
    this._yTo += -e.deltaY * .4
    this._yTo = uMaths.clamp( this._yTo, this._yMin, this._yMax )
  }

  _onUpdate() {
    const dy = this._yTo - this._cntLines.y
    this._cntLines.y += dy * .25

    const idxToHide = -( ( this._cntLines.y - this._hLine * .5 - 25 - this._yMax ) / ( this._hLine ) >> 0 )
    if( idxToHide != this._idxToHide ) {
      if( this._idxToHide < idxToHide ) {
        this._hideLine( idxToHide )
      } else {
        this._showLine( idxToHide, true )
      }
      this._idxToHide = idxToHide
    }    

    const idx = - ( this._cntLines.y - this._yMax ) / this._hLine >> 0
    if( idx != this._idx ) {
      this._idx = idx
      this._updateVisibles()
    }
  }

  _hideLine( idx ) {
    this._lines[ idx - 1 ].hide()
    // TweenLite.to( this._lines[ idx - 1 ], .6, {
    //   alpha: 0,
    //   ease: Quart.easeInOut
    // })
  }

  _showLine( idx, fast ) {
    this._lines[ idx ].show( 0, fast )
    // TweenLite.to( this._lines[ idx ], .6, {
    //   alpha: 1,
    //   ease: Quart.easeInOut
    // })
  }

  _updateVisibles() {
    let line = null
    const start = this._idx - 1
    const end = this._idx + this._countLinesVisible
    for( let i = 0; i < 25; i++ ) {
      line = this._lines[ i ]
      if( i >= start && i < end ) {
        if( !line.parent ) {
          line.bindEvents()
          this._cntLines.addChild( line )
          if( this._isShown && !line.isShown && ( i == start || i == end - 1 ) ) {
            line.show( .2 )
          }
        }
      } else {
        if( line.parent ) {
          line.unbindEvents()
          this._cntLines.removeChild( line )
        }
      }
    }
  }

  _createLines() {
    const tmpData = [ 4, 3 ]

    const yAdd = this._hLine

    this._lines = []
    let line = null

    let py = 0
    let i = 0
    const n = tmpData.length
    for( ; i < n; i++ ) {
      line = new Line( i + 1, tmpData[ i ] )
      line.y = py
      this._lines.push( line )
      // this._cntLines.addChild( line )

      py += yAdd
    }

    for( i = n; i < 25; i++ ) {
      line = new Line( i + 1 )
      line.y = py
      this._lines.push( line )
      // this._cntLines.addChild( line )

      py += yAdd
    }
  }

  bindEvents() {
    stage.on( "resize", this._binds.onResize )
    this._onResize()

    window.addEventListener( "mousewheel", this._binds.onMouseScroll, false )

    loop.add( this._binds.onUpdate )
  }

  unbindEvents() {
    stage.off( "resize", this._binds.onResize )

    window.removeEventListener( "mousewheel", this._binds.onMouseScroll, false )

    loop.remove( this._binds.onUpdate )
  }

  show() {
    this._isShown = true

    pixi.stage.addChildAt( this, 0 )

    const n = this._lines.length
    for( let i = 0; i < this._countLinesVisible; i++ ) {
      this._lines[ i ].show( i * .08 )
    }

    TweenLite.set( this, {
      delay: 2,
      onComplete: this.bindEvents.bind( this )
    })
  }

  hide( cb ) {
    pixi.stage.removeChild( this )
    cb()
  }

}

module.exports = Home
