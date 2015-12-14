const stage = require( "fz/core/stage" )

const config = require( "xmas/core/config" )
const Entry = require( "xmas/home/entry/Entry" )
const uXmasTexts = require( "xmas/utils/texts" )

class Line extends PIXI.Container {

	constructor( idx, count = 0 ) {
		super()

		this._idx = idx
		this._dataEntries = config.data.days[ this._idx ]
		this._count = this._dataEntries ? this._dataEntries.length : 0

		this.isShown = false

		this._createBgLine()
		this._createTitle()

		this._cntEntries = new PIXI.Container()
		this._cntEntries.x = 218
		this.addChild( this._cntEntries )
		if( this._count > 0 ) {
			this._createEntries()
		} else {
			this._createDummy()
		}
	}

	_createBgLine() {
		this._bgLine = new PIXI.Graphics()
		this._bgLine.y = 25
		this._bgLine.alpha = 0
		this.addChild( this._bgLine )

		this._isBgLineSet = false
	}

	updateBgLine( x ) {
		const w = stage.width
		this._bgLine.clear()
		this._bgLine.lineStyle( 1, 0xffffff )
		if( this._idx % 2 ) {
			if( !this._isBgLineSet ) {
				this._y0 = -25 + Math.random() * 50 >> 0
				this._y1 = 175 + Math.random() * 50 >> 0
				this._y2 = 50 + Math.random() * 50 >> 0
			}
			this._bgLine.moveTo( -x, this._y0 )
			this._bgLine.quadraticCurveTo( w * .25, this._y1, w, this._y2 )
		} else {
			if( !this._isBgLineSet ) {
				this._y0 = 100 + Math.random() * 40 >> 0
				this._y1 = -50 - Math.random() * 40 >> 0
				this._y2 = 175 + Math.random() * 75 >> 0
			}
			this._bgLine.moveTo( -x, this._y0 )
			this._bgLine.quadraticCurveTo( w * .75, this._y1, w, this._y2 )
		}
		this._isBgLineSet = true
	}

	_createTitle() {
		this._cntTitle = new PIXI.Container()
		this._cntTitle.x = 35
		this._cntTitle.y = 60

		const cntLeft = new PIXI.Container()
		cntLeft.y = 31
		this._cntTitle.addChild( cntLeft )

		if( this._idx == 1 ) {
			this._cntTfDay = uXmasTexts.create( "DAY", { font: "30px " + config.fonts.bold, fill: config.colors.red }, 1 )
			this._cntTfDay.alpha = 0
			cntLeft.addChild( this._cntTfDay )
		}

		this._line = new PIXI.Graphics()
		this._line.x = 30
		this._line.y = 39
		this._line.lineStyle( 1, config.colors.blue )
		this._line.moveTo( -30, 0 )
		this._line.lineTo( 0, 0 )
		this._line.scale.x = 0
		cntLeft.addChild( this._line )

		this._cntTfNumber = uXmasTexts.create( this._idx + "", { font: "180px " + config.fonts.bold, fill: config.colors.red } )
		this._cntTfNumber.x = 54
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
			entry = new Entry( i + 1, this._dataEntries[ i ] )
			entry.x += px
			entry.y = Math.sin( as[ i ] ) * 38 >> 0
			this._cntEntries.addChild( entry )

			px += config.sizes.entry.w + 60

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

	show( delay = 0, fast = false ) {
		if( this.isShown ) {
			return
		}
		this.bindEvents()
		this.isShown = true

		const timing = fast ? .6 : .8

		if( this._idx == 1 ) {
			let letter = null
			const  n = this._cntTfDay.children.length
			for( let i = 0; i < n; i++ ) {
				letter = this._cntTfDay.children[ i ]
				letter.alpha = 0
				TweenLite.to( letter, timing, {
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
		TweenLite.to( this._line.scale, timing, {
			delay: delay + .04,
			x: 1,
			ease: Cubic.easeInOut
		})

		TweenLite.to( this._bgLine, 2 * timing, {
			delay: delay,
			alpha: 1,
			ease: Cubic.easeInOut
		} )

		TweenLite.to( this._cntTfNumber, timing, {
			delay: delay,
			alpha: 1,
			ease: Cubic.easeInOut
		})

		this._showEntries( delay + .3 * ( fast ? .5 : 1 ), fast )
	}

	_showEntries( delay, fast ) {
		let d = 0
		let dAdd = .06
		let dMin = .01
		let dFriction = .85

		let entry = null
		const n = this._cntEntries.children.length
		for( let i = 0; i < n; i++ ) {
			entry = this._cntEntries.children[ i ]
			entry.show( delay + d, fast )

			d += dAdd
			dAdd *= dFriction
			if( dAdd < dMin ) {
				dAdd = dMin
			}
		}
	}

	hide( delay = 0 ) {
		if( !this.isShown ) {
			return
		}
		this.unbindEvents()
		this.isShown = false


		if( this._idx == 1 ) {
			let letter = null
			const  n = this._cntTfDay.children.length
			for( let i = 0; i < n; i++ ) {
				letter = this._cntTfDay.children[ i ]
				// letter.alpha = 0
				TweenLite.to( letter, .4, {
					delay: delay + .1 + ( n - i ) * .1,
					alpha: 0,
					ease: Cubic.easeInOut
				} )
			}
			// TweenLite.set( this._cntTfDay, {
			//   delay: delay + 1,
			//   alpha: 0,
			// })
		}
		TweenLite.to( this._line.scale, .6, {
			delay: delay + .04,
			x: 0,
			ease: Cubic.easeInOut
		})

		TweenLite.to( this._bgLine, 1, {
			alpha: 0,
			ease: Cubic.easeInOut
		} )

		TweenLite.to( this._cntTfNumber, .6, {
			delay: delay,
			alpha: 0,
			ease: Cubic.easeInOut,
			onComplete:(e)=>{this.parent.removeChild( this )}
		})

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
