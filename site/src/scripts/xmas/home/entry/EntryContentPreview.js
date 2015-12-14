const uImg = require( "fz/utils/images" )
const pixi = require( "fz/core/pixi" )
const config = require( "xmas/core/config" )
const PolyShape = require( "xmas/home/entry/PolyShape" )
const uTexts = require( "xmas/utils/texts" )

class DefaultShape extends PIXI.Container {

	constructor( data ) {
		super()

		this._data = data

		this._cntGlobal = new PIXI.Container()
		this.addChild( this._cntGlobal )

		this._cntPreview = this._createPreview()
		this._cntGlobal.addChild( this._cntPreview )

		this.pivot.x = config.sizes.entry.w >> 1
		this.pivot.y = config.sizes.entry.h >> 1

		this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
		this._layer.tint = config.colors.blue
		this._layer.alpha = .8
		this._layer.x = -20
		this._layer.y = -20
		this._cntGlobal.addChild( this._layer )

		this._polyShape = new PolyShape()
		this._polyShape.x = config.sizes.entry.w >> 1
		this._polyShape.y = config.sizes.entry.h >> 1
		this._cntGlobal.addChild( this._polyShape )

		this._cntGlobal.mask = this._polyShape

		this._shapeOver = new PIXI.Graphics()
		this._shapeOver.beginFill( 0xe5f2ff )
		this._shapeOver.drawCircle( 0, 0, ( config.sizes.entry.h >> 1 ) )
		// this._shapeOver = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_preview.png" ) )
		// this._shapeOver.anchor.set( .5, .5 )
		this._shapeOver.x = this._polyShape.x
		this._shapeOver.y = this._polyShape.y
		this._shapeOver.scale.x = this._shapeOver.scale.y = 0

		this._mskCircle = new PIXI.Graphics()
		this._mskCircle.beginFill( 0xff00ff )
		this._mskCircle.drawCircle( 0, 0, ( config.sizes.entry.h >> 1 ) )
		// this._shapeOver = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_preview.png" ) )
		// this._shapeOver.anchor.set( .5, .5 )
		this._mskCircle.x = this._polyShape.x
		this._mskCircle.y = this._polyShape.y
		this._mskCircle.scale.x =
		this._mskCircle.scale.y = 0
		this.addChild( this._mskCircle )
	}

	_createPreview() {
		const cnt = new PIXI.Container()

		this._img = new PIXI.Sprite( PIXI.Texture.fromFrame( this._data.pathPreview ) )
		const fit = uImg.fit( this._img.width, this._img.height, config.sizes.entry.w, ( config.sizes.entry.h ) )
		this._img.width = fit.width >> 0
		this._img.height = fit.height >> 0
		this._img.x = config.sizes.entry.w - fit.width >> 1
		this._img.y = config.sizes.entry.h - fit.height >> 1
		cnt.addChild( this._img )

		return cnt
	}

	over() {
		TweenLite.killTweensOf( this )
		TweenLite.killTweensOf( this._shapeOver.scale )
		TweenLite.killTweensOf( this._polyShape.scale )
		TweenLite.killTweensOf( this._mskCircle.scale )

		this._polyShape.scale.x =
		this._polyShape.scale.y = 1
		this._shapeOver.scale.x = 0
		this._shapeOver.scale.y = 0
		this.scale.x =
		this.scale.y = 1

		this.mask = null
		this._mskCircle.scale.x =
		this._mskCircle.scale.y = 0

		this._cntGlobal.addChild( this._shapeOver )
		TweenLite.set( this._shapeOver.scale, {
			delay: .175,
			x: .675,
			y: .675
		})
		TweenLite.to( this._shapeOver.scale, .4, {
			delay: .175,
			x: 1.12,
			y: 1.12,
			ease: Quart.easeOut
		})

		TweenLite.to( this._polyShape.scale, .4, {
			delay: .1,
			x: 1.12,
			y: 1.12,
			ease: Quart.easeOut
		} )
	}

	out() {
		TweenLite.killTweensOf( this )
		TweenLite.killTweensOf( this._shapeOver.scale )
		TweenLite.killTweensOf( this._polyShape.scale )
		TweenLite.killTweensOf( this._mskCircle.scale )
		this.rotation = 0

		this._cntGlobal.removeChild( this._shapeOver )

		this.scale.x =
		this.scale.y = 1
		this._shapeOver.scale.x =
		this._shapeOver.scale.y = 0
		this._polyShape.scale.x =
		this._polyShape.scale.y = .93

		TweenLite.to( this._polyShape.scale, .6, {
			delay: .2,
			x: 1,
			y: 1,
			ease: Quad.easeOut
		} )

		this.mask = this._mskCircle
		this._mskCircle.scale.x =
		this._mskCircle.scale.y = 0
		TweenLite.to( this._mskCircle.scale, .155, {
			x: 0.2,
			y: 0.2,
			ease: Quad.easeIn
		} )
		TweenLite.set( this._mskCircle.scale, {
			delay: .155,
			x: .75,
			y: .75
		} )
		TweenLite.to( this._mskCircle.scale, .5, {
			delay: .155,
			x: 1,
			y: 1,
			ease: Quart.easeOut,
			onComplete: () => {
				this._mskCircle.scale.x =
				this._mskCircle.scale.y = 0
				this.mask = null
			}
		} )
	}

}

class HoverShape extends PIXI.Container {

	constructor( data ) {
		super()

		this._data = data

		this._size = config.sizes.entry.w

		this._percent = 0.0001

		this.pivot.x = config.sizes.entry.w >> 1
		this.pivot.y = config.sizes.entry.h >> 1

		this._cntPreview = this._createPreview()
		this.addChild( this._cntPreview )

		this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
		this._layer.tint = config.colors.blue
		this._layer.x = -20
		this._layer.y = -20
		this._layer.alpha = .3

		this.addChild( this._layer )
		this._msk = new PIXI.Graphics()
		this._msk.x = config.sizes.entry.w >> 1
		this._msk.y = config.sizes.entry.h >> 1
		this.addChild( this._msk )

		this._updateMsk()

		this.mask = this._msk

		this._shapeOver = new PolyShape( 0xe5f2ff )
		this._shapeOver.x = this._msk.x
		this._shapeOver.y = this._msk.y
		this._shapeOver.scale.x =
		this._shapeOver.scale.y = 0

		// this._isOver = false

		this._binds = {}
		this._binds.updateMsk = this._updateMsk.bind( this )
	}

	_createPreview() {
		const cnt = new PIXI.Container()

		this._img = new PIXI.Sprite( PIXI.Texture.fromFrame( this._data.pathPreview ) )
		const fit = uImg.fit( this._img.width, this._img.height, config.sizes.entry.w, config.sizes.entry.h )
		this._img.width = fit.width >> 0
		this._img.height = fit.height >> 0
		this._img.x = config.sizes.entry.w - fit.width >> 1
		this._img.y = config.sizes.entry.h - fit.height >> 1
		cnt.addChild( this._img )

		return cnt
	}

	_updateMsk() {
		this._msk.clear()
		this._msk.beginFill( 0x00ff00 )
		this._drawCircleMask()
	}

	_drawCircleMask() {
		this._msk.drawCircle( 0, 0, ( config.sizes.entry.w >> 1 ) * this._percent )
	}

	over() {
		TweenLite.killTweensOf( this )
		TweenLite.killTweensOf( this._shapeOver.scale )

		// this._isOver = true

		this.scale.x =
		this.scale.y = 1
		this._shapeOver.scale.x =
		this._shapeOver.scale.y = 0
		this._percent = 0.0001
		this._updateMsk()

		this.removeChild( this._shapeOver )

		TweenLite.to( this, .155, {
			_percent: 0.2,
			ease: Quad.easeIn,
			onUpdate: this._binds.updateMsk
		} )
		TweenLite.set( this, {
			delay: .155,
			_percent: .75
		} )
		TweenLite.to( this, .5, {
			delay: .155,
			_percent: 1,
			ease: Quart.easeOut,
			onUpdate: this._binds.updateMsk
		} )
	}

	out( cb ) {
		// if( !this._isOver ) {
		//   return
		// }
		// this._isOver = false
		TweenLite.killTweensOf( this )
		TweenLite.killTweensOf( this._shapeOver.scale )

		this.addChild( this._shapeOver )
		TweenLite.set( this._shapeOver.scale, {
			delay: .175,
			x: .6,
			y: .6,
		} )
		TweenLite.to( this._shapeOver.scale, .4, {
			delay: .175,
			x: 1.3,
			y: 1.3,
			ease: Quart.easeOut,
			onComplete: () => {
				this.removeChild( this._shapeOver )
				this._percent = 0.0001
				this._updateMsk()
			}
		} )

		TweenLite.to( this, .4, {
			delay: .125,
			// x: 1.2,
			// y: 1.2,
			_percent: 1.2,
			ease: Quart.easeOut,
			onUpdate: this._binds.updateMsk
		} )
	}

}

class EntryContentPreview extends PIXI.Container {

	constructor( data ) {
		super()

		this._default = new DefaultShape( data )
		this._default.x = config.sizes.entry.w >> 1
		this._default.y = config.sizes.entry.h >> 1
		this._default.scale.x = this._default.scale.y = 0
		this.addChild( this._default )

		this._hover = new HoverShape( data )
		this._hover.x = config.sizes.entry.w >> 1
		this._hover.y = config.sizes.entry.h >> 1
		// this.addChild( this._hover )

		this.hoverZone = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
		// this.hoverZone.scale.set( .5, .5 )
		this.hoverZone.width = config.sizes.entry.w
		this.hoverZone.height = config.sizes.entry.h
		this.hoverZone.tint = Math.random() * 0xffffff
		this.hoverZone.alpha = 0
		this.addChild( this.hoverZone )

		this._cntTf = new PIXI.Container()
		this._cntTf.x = 100
		this._cntTf.y = 255
		this.addChild( this._cntTf )

		this._tfTitle = uTexts.create( data.title, { font: "22px " + config.fonts.medium, fill: config.colors.blue } )
		this._cntTf.addChild( this._tfTitle )
		this._initLetters( this._tfTitle )

		this._tfAuthor = uTexts.create( data.author, { font: "27px " + config.fonts.medium, fill: config.colors.blue } )
		this._tfAuthor.x = 15
		this._tfAuthor.y = 20
		this._cntTf.addChild( this._tfAuthor )
		this._initLetters( this._tfAuthor )

		this._isShown = false

		this._isOver = false
	}

	_initLetters( cnt ) {
		const n = cnt.children.length
		for( let i = 0; i < n; i++ ) {
			cnt.children[ i ].alpha = 0
		}
	}

	over() {
		this._isOver = true

		this._default.over()

		this.addChild( this._hover )
		this._hover.over()
	}

	out( force = false ) {
		if( !this._isOver ) {
			return
		}
		this._isOver = false
		this._default.out()
		this.addChild( this._default )

		this._hover.out()
	}

	show( delay = 0, fast = false ) {
		this._isShown = true

		const timing = fast ? .4 : .8
		const ratio = fast ? .5 : 1

		TweenLite.killTweensOf( this._default.scale )
		TweenLite.to( this._default.scale, timing, {
			delay: delay,// + .25,
			x: 1,
			y: 1,
			ease: fast ? Quart.easeOut : Quart.easeInOut,
		} )

		this._showLetters( this._tfTitle, delay + .8 * ratio, ratio)
		this._showLetters( this._tfAuthor, delay + 1 * ratio, ratio)
	}

	_showLetters( cnt, delay, ratio ) {
		const n = cnt.children.length
		for( let i = 0; i < n; i++ ) {
			TweenLite.killTweensOf( cnt.children[ i ] )
			TweenLite.to( cnt.children[ i ], .8 * ratio, {
				delay: delay + Math.random() * .4 * ratio,
				alpha: 1,
				ease: Quart.easeInOut
			} )
		}
	}

	hide( delay = 0 ) {
		this.out()

		TweenLite.killTweensOf( this._default.scale )
		TweenLite.to( this._default.scale, .6, {
			delay: delay,// + .25,
			x: 0,
			y: 0,
			ease: Quart.easeInOut,
		} )

		this._hideLetters( this._tfTitle, delay )
		this._hideLetters( this._tfAuthor, delay + .1 )
	}

	_hideLetters( cnt, delay ) {
		const n = cnt.children.length
		for( let i = 0; i < n; i++ ) {
			TweenLite.killTweensOf( cnt.children[ i ] )
			TweenLite.to( cnt.children[ i ], .4, {
				delay: delay + Math.random() * .2,
				alpha: 0,
				ease: Quart.easeInOut
			} )
		}
	}

}

module.exports = EntryContentPreview
