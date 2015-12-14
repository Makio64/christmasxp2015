const timeout = require( "fz/utils/timeout" )

const config = require( "xmas/core/config" )

const EntryContentPreview = require( "xmas/home/entry/EntryContentPreview" )
const EntryNumber = require( "xmas/home/entry/EntryNumber" )
const EntryComingSoon = require( "xmas/home/entry/EntryComingSoon" )
const EntrySmiley = require( "xmas/home/entry/EntrySmiley" )

class Entry extends PIXI.Container {

	constructor( idx = -1, data = null ) {
		super()

		this._data = data
		this._isShown = false

		if( idx >= 0 ) {
			this._content = new EntryContentPreview( data )
			this.addChild( this._content )

			this._circle = new EntryNumber( idx )
			this._circle.x = config.sizes.entry.w
			this._circle.y = config.sizes.entry.h - 55
			this.addChild( this._circle )
		} else {
			this._content = new EntryComingSoon()
			this.addChild( this._content )

			this._circle = new EntrySmiley()
			this._circle.x = config.sizes.entry.w
			this._circle.y = config.sizes.entry.h - 55
			this.addChild( this._circle )
		}

		this._binds = {}
		this._binds.onMouseOver = this._onMouseOver.bind( this )
		this._binds.onMouseOut = this._onMouseOut.bind( this )
		this._binds.onClick = this._onClick.bind( this )
	}

	_onMouseOver() {
		if( !this._isShown ) {
			return
		}
		if( this._content.over ) {
			this._content.over()
		}
		if( this._circle.over ) {
			this._circle.over()
		}
	}

	_onMouseOut() {
		if( !this._isShown ) {
			return
		}
		if( this._content.out ) {
			this._content.out()
		}
		if( this._circle.out ) {
			this._circle.out()
		}
	}

	_onClick() {
		page( "/xps" + this._data.path.replace( "./", "/" ) )
	}

	show( delay = 0, fast = false ) {
		this._content.show( delay, fast )
		this._circle.show( delay + ( .5 + Math.random() * .45 ) * ( fast ? .5 : 1 ), fast )

		timeout( () => {
			this._isShown = true
		}, delay * 1000 + 1200 )
	}

	hide( delay = 0 ) {
		this._content.hide( delay + .1 )
		this._circle.hide( delay )
		this._isShown = false
	}

	bindEvents() {
		if( this._content.hoverZone ) {
			this._content.hoverZone.interactive = true
			this._content.hoverZone.buttonMode = true

			this._content.hoverZone.on( "mouseover", this._binds.onMouseOver )
			this._content.hoverZone.on( "mouseout", this._binds.onMouseOut )
			this._content.hoverZone.on( "click", this._binds.onClick )
			this._content.hoverZone.on( "touchstart", this._binds.onClick )
		}
	}

	unbindEvents() {
		if( this._content.hoverZone ) {
			this._content.hoverZone.interactive = false
			this._content.hoverZone.buttonMode = false

			this._content.hoverZone.off( "mouseover", this._binds.onMouseOver )
			this._content.hoverZone.off( "mouseout", this._binds.onMouseOut )
			this._content.hoverZone.off( "click", this._binds.onClick )
			this._content.hoverZone.off( "touchstart", this._binds.onClick )
		}
	}

}

module.exports = Entry
