const config = require( "xmas/core/config" )
const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )
const loop = require( "fz/core/loop" )
const interactions = require( "fz/events/interactions" )
const browsers = require( "fz/utils/browsers" )
const uMaths = require( "fz/utils/maths" )
const Line = require( "xmas/home/Line" )
const scrollEmul = require( "xmas/core/scrollEmul" )

class Home extends PIXI.Container {

	constructor() {
		super()

		this._idx = 0
		this._idxToHide = 0
		this.accelerationY = 0

		this._isShown = false

		this._yLast = 0

		this._hLine = config.sizes.entry.h + 75

		if( browsers.mobile ) {
			this.scale.set( .5, .5 )
		}

		this._yMin = 0
		this._yMax = 205
		this._yTo = this._yMax
		scrollEmul.setHeight( this._yMin )

		this._cntLines = new PIXI.Container()
		this._cntLines.y = this._yTo
		this.addChild( this._cntLines )

		this._createLines()

		this._binds = {}
		this._binds.onResize = this._onResize.bind( this )
		this._binds.onTouchDown = this._onTouchDown.bind( this )
		this._binds.onTouchMove = this._onTouchMove.bind( this )
		this._binds.onTouchUp = this._onTouchUp.bind( this )
		this._binds.onScroll = this._onScroll.bind( this )
		this._binds.onUpdate = this._onUpdate.bind( this )
	}

	_onTouchDown( e ) {
		this._yLast = e.y
	}

	_onTouchMove( e ) {
		const dy = e.y - this._yLast
		this.accelerationY += Math.max(-15,Math.min(15,dy))
		this._yLast = e.y
	}

	_onTouchUp( e ) {}

	_onResize() {
		let w = 1320
		this._cntLines.x = stage.width - w >> 1
		if( w > window.innerWidth || browsers.tablet || browsers.mobile ) {
			this._cntLines.x = 10
			this._yMin = -26 * this._hLine + stage.height
		}

		if(!browsers.tablet && !browsers.mobile){
			scrollEmul.setHeight( -this._yMin )
		}

		this._updateLines()


		this._countLinesVisible = Math.ceil( ( stage.height ) / this._hLine )
		this._countLinesVisible += 1

		this._updateVisibles()
	}

	_updateLines() {
		const n = this._lines.length
		for( let i = 0; i < n; i++ ) {
			this._lines[ i ].updateBgLine( this._cntLines.x )
		}
	}

	// _onMouseScroll( e ) {
	//   e.preventDefault()

	//   this._isDragDrop = false
	//   this._yTo += -e.deltaY * .4
	//   this._yTo = uMaths.clamp( this._yTo, this._yMin, this._yMax )
	// }

	_onScroll( yTo ) {
		this._isDragDrop = false
		this._yTo = -yTo + this._yMax
		// this._yTo = uMaths.clamp( this._yTo, this._yMin, this._yMax )
	}

	_onUpdate() {
		const dy = this._yTo - this._cntLines.y
		this._cntLines.y += dy * .25

		this._yTo += this.accelerationY
		this._yTo = uMaths.clamp( this._yTo, this._yMin + this._hLine + 50, this._yMax )
		this.accelerationY *=.9

		this._idx = Math.floor(( this._yMax - this._cntLines.y ) / this._hLine)
		this._updateVisibles()
	}

	_hideLine( idx ) {
		this._lines[ idx - 1 ].hide()
	}

	_showLine( idx, fast ) {
		this._lines[ idx ].show( 0, fast )
	}

	_updateVisibles() {
		let line = null
		const start = this._idx
		const end = this._idx + this._countLinesVisible
		for( let i = 0; i < 25; i++ ) {
			line = this._lines[ i ]
			if( i >= start && i < end ) {
				if( !line.parent ) {
					this._cntLines.addChild( line )
				}
				if( this._isShown && !line.isShown && ( i == start || i == end - 1 ) ) {
					line.show( .2, true )
				}
			} else {
				if( line.parent ) {
					// TODO should be call only when needed
					line.hide()
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

		if( browsers.mobile || browsers.tablet ) {
			interactions.on( document.body, "down", this._binds.onTouchDown )
			interactions.on( document.body, "move", this._binds.onTouchMove )
			interactions.on( document.body, "up", this._binds.onTouchUp )
		} else {
			scrollEmul.on( "change", this._binds.onScroll )
		}

		// window.addEventListener( "mousewheel", this._binds.onMouseScroll, false )

		loop.add( this._binds.onUpdate )
	}

	unbindEvents() {
		stage.off( "resize", this._binds.onResize )

		if( browsers.mobile || browsers.tablet ) {
			interactions.off( document.body, "down", this._binds.onTouchDown )
			interactions.off( document.body, "move", this._binds.onTouchMove )
			interactions.off( document.body, "up", this._binds.onTouchUp )
		} else {
			scrollEmul.off( "change", this._binds.onScroll )
		}



		// window.removeEventListener( "mousewheel", this._binds.onMouseScroll, false )

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

	this._onResize()
	}

	hide( cb ) {
		pixi.stage.removeChild( this )
		cb()
	}

}

module.exports = Home
