const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )
const config = require( "xmas/core/config" )
const PolyShape = require( "xmas/home/entry/PolyShape" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntryComingSoon extends PIXI.Container {

	constructor() {
		super()

		this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
		this.addChild( this._layer )

		this._cntContent = this._createContent()
		this._cntContent.y = config.sizes.entry.h - this._cntContent.height >> 1
		this._cntContent.alpha = 0
		this.addChild( this._cntContent )

		this._polyShape = new PolyShape()
		this._polyShape.x = config.sizes.entry.w >> 1
		this._polyShape.y = config.sizes.entry.h >> 1
		this._polyShape.scale.x = this._polyShape.scale.y = 0
		this.addChild( this._polyShape )

		this.mask = this._polyShape
	}

	_createContent() {
		const cnt = new PIXI.Container()

		let tfTmp = uXmasTexts.create( "more fun", { font: "45px " + config.fonts.bold, fill: config.colors.red } )
		let tex = tfTmp.generateTexture( pixi.renderer, stage.resolution )
		this._cntTfTop = new PIXI.Sprite( tex )
		this._cntTfTop.x = config.sizes.entry.w - this._cntTfTop.width >> 1
		cnt.addChild( this._cntTfTop )

		tfTmp = uXmasTexts.create( "coming soon", { font: "45px " + config.fonts.bold, fill: config.colors.red } )
		tex = tfTmp.generateTexture( pixi.renderer, stage.resolution )
		this._cntTfBottom = new PIXI.Sprite( tex )
		this._cntTfBottom.x = config.sizes.entry.w - this._cntTfBottom.width >> 1
		this._cntTfBottom.y = 32
		cnt.addChild( this._cntTfBottom )

		return cnt
	}

	show( delay = 0, fast = false ) {

		const timing = fast ? .4 : .8

		TweenLite.to( this._polyShape.scale, timing, {
			delay: delay,// + .25,
			x: 1,
			y: 1,
			ease: fast ? Quart.easeOut : Quart.easeInOut,
		} )

		let px = config.sizes.entry.w - this._cntTfTop.width >> 1
		px -= 20
		this._cntTfTop.x = px
		this._cntTfTop.alpha = 0
		TweenLite.set( this._cntTfTop, {
			delay: delay + .3,
			alpha: .7
		})
		TweenLite.to( this._cntTfTop, timing, {
			delay: delay + .3,
			x: px + 20,
			alpha: 1,
			ease: Cubic.easeOut
		})

		px = config.sizes.entry.w - this._cntTfBottom.width >> 1
		px -= 25
		this._cntTfBottom.x = px
		this._cntTfBottom.alpha = 0
		TweenLite.set( this._cntTfBottom, {
			delay: delay + .375,
			alpha: .7
		})
		TweenLite.to( this._cntTfBottom, timing, {
			delay: delay + .375,
			x: px + 25,
			alpha: 1,
			ease: Cubic.easeOut
		})

		this._cntContent.alpha = 1

	}

	hide( delay = 0 ) {
		TweenLite.killTweensOf( this._polyShape.scale )
		TweenLite.killTweensOf( this._cntTfTop )
		TweenLite.killTweensOf( this._cntTfBottom )

		TweenLite.to( this._polyShape.scale, .6, {
			delay: delay + .15,
			x: 0,
			y: 0,
			ease: Quart.easeInOut,
		} )

		TweenLite.to( this._cntTfTop, .4, {
			delay: delay,
			x: this._cntTfTop.x + 25,
			alpha: 0,
			ease: Quart.easeInOut
		})

		TweenLite.to( this._cntTfBottom, .4, {
			delay: delay + .075,
			x: this._cntTfBottom.x + 20,
			alpha: 0,
			ease: Quart.easeInOut
		})
	}

}

module.exports = EntryComingSoon
