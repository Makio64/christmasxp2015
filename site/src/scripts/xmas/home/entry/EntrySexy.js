const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )
const config = require( "xmas/core/config" )
const PolyShape = require( "xmas/home/entry/PolyShape" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntrySexy extends PIXI.Container {

	constructor() {
		super()

		this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
		this._layer.tint=0x999999+Math.floor(Math.random()*64)
		this.addChild( this._layer )
		this.alpha = .6
		this._polyShape = new PolyShape(0xFF0000)
		this._polyShape.x = config.sizes.entry.w >> 1
		this._polyShape.y = config.sizes.entry.h >> 1
		this._polyShape.scale.x = this._polyShape.scale.y = 0
		this.addChild( this._polyShape )

		this.mask = this._polyShape
	}

	show( delay = 0, fast = false ) {
		const timing = fast ? .4 : .8

		TweenMax.to( this._polyShape.scale, timing, {
			delay: delay,
			x: 1,
			y: 1,
			ease: fast ? Quart.easeOut : Quart.easeInOut,
		} )
	}

	hide( delay = 0 ) {
		TweenMax.killTweensOf( this._polyShape.scale )

		TweenMax.to( this._polyShape.scale, .6, {
			delay: delay + .15,
			x: 0,
			y: 0,
			ease: Quart.easeInOut,
		} )
	}

	bindEvents() {}
	unbindEvents() {}

}

module.exports = EntrySexy
