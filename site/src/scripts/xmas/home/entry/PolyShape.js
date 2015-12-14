const config = require( "xmas/core/config" )
const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )

class Point {

	constructor() {}

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


class PolyShapeGraphicsSprite extends PIXI.Sprite {

  constructor( color = 0xff00ff ) {
    super( config.texShape )

    this._color = color
    this.tint = this._color
    this.anchor.set( .5, .5 )
  }

}

class PolyShapeGraphics extends PIXI.Graphics {

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

// let tex = null

// class PolyShape extends PIXI.Sprite {

//   constructor( color ) {
//     super()

//     this._polyShapeGraphics = new PolyShapeGraphics( color )
//     if( !tex ) {
//       console.log( "yo" )
//       tex = this._polyShapeGraphics.generateTexture( pixi.renderer, stage.resolution )
//     }

//     this.rotation = Math.PI / 6

//     this.texture = tex
//     this.tint = color
//     // this.pivot.set( this.width * .5 >> 1, this.height * .5 >> 1 )
//     this.anchor.set( .5, .5 )
//   }
// }

module.exports = PolyShapeGraphics
