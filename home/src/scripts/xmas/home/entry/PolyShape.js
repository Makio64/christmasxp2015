const config = require( "xmas/core/config" )

class Point {

  constructor() {
  }

  set( a, radDefault, radOver ) {
    const cos = Math.cos( a )
    const sin = Math.sin( a )

    this._xDefault = cos * radDefault
    this._yDefault = sin * radDefault

    this._xOver = cos * radOver
    this._yOver = sin * radOver

    this.x = this._xDefault
    this.y = this._yDefault
  }

}

class PolyShape extends PIXI.Graphics {

  constructor( color = 0xff00ff ) {
    super()

    this._color = color
    this._countMaskPoints = 6

    this.rotation = Math.PI / 6

    this._init()
    this._update()
  }

  _update() {
    this.clear()

    this.beginFill( this._color )
    this._draw()
  }

  _init() {
    let a = 0
    let radDefault = config.sizes.entry.h >> 1
    let radOver = config.sizes.entry.w >> 1
    let p = null

    this._points = []

    const aAdd = 2 * Math.PI / this._countMaskPoints
    for( let i = 0; i < this._countMaskPoints; i++ ) {
      p = new Point()
      p.set( a, radDefault, radOver)
      this._points.push( p )

      a += aAdd
    }
  }

  _draw() {
    let p = null
    for( let i = 0; i < this._countMaskPoints; i++ ) {
      p = this._points[ i ]
      if( i != 0 ) {
        this.lineTo( p.x, p.y )
      } else {
        this.moveTo( p.x, p.y )
      }
    }
  }

}

module.exports = PolyShape
