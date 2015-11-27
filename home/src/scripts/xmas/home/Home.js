const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )
const loop = require( "fz/core/loop" )
const uMaths = require( "fz/utils/maths" )
const Line = require( "xmas/home/Line" )

class Home extends PIXI.Container {

  constructor() {
    super()

    this._idx = 0

    this._hLine = 220

    this._yMin = 0
    this._yMax = 195
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
    this._cntLines.x = stage.width - 880 >> 1

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
    this._cntLines.y += ( this._yTo - this._cntLines.y ) * .25

    const idx = - ( this._cntLines.y - this._yMax ) / this._hLine >> 0
    if( idx != this._idx ) {
      this._idx = idx
      this._updateVisibles()
    }
  }

  _updateVisibles() {
    let line = null
    const start = this._idx - 1
    const end = this._idx + this._countLinesVisible
    for( let i = 0; i < 25; i++ ) {
      line = this._lines[ i ]
      if( i >= start && i < end ) {
        this._cntLines.addChild( line )
      } else {
        if( line.parent ) {
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
    pixi.stage.addChild( this )
  }

  hide( cb ) {
    pixi.stage.removeChild( this )
    cb()
  }

}

module.exports = Home
