const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )
const browsers = require( "fz/utils/browsers" )

const Logo = require( "xmas/ui/Logo" )
const Bts = require( "xmas/ui/Bts" )

class Ui extends PIXI.Container {

	constructor() {
		super()

		pixi.stage.addChild( this )

		this._logo = new Logo()
		this.addChild( this._logo )

		this._binds = {}
		this._binds.onResize = this._onResize.bind( this )

		this._onResize()
		this._logo.y = stage.height >> 1
	}

	_onResize() {
		if( 1320 > stage.width ) {
			this._logo.scale.set( stage.width/1320, stage.width/1320 )
		}
		this._logo.x = stage.width >> 1
		if( this._bts ) {
			this._bts.x = stage.width - 215 * 1.5 * this._bts.scale.x >> 0
			this._bts.y = 20 * 1.5 >> 0
			this._bts.visible = 640 < stage.width?true:false
		}
	}

	showLoading() {
		this._logo.show()
	}

	hideLoading(  ) {
		this._logo.hideLoading(  )
	}

	showBts() {
		this._bts = new Bts()
		this.addChild( this._bts )
		this._onResize()

		this._bts.show( 5 )
	}

	bindEvents() {
		stage.on( "resize", this._binds.onResize )
	}

}

module.exports = Ui
