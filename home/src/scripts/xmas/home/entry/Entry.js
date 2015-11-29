const EntryContentPreview = require( "xmas/home/entry/EntryContentPreview" )
const EntryNumber = require( "xmas/home/entry/EntryNumber" )
const EntryComingSoon = require( "xmas/home/entry/EntryComingSoon" )
const EntrySmiley = require( "xmas/home/entry/EntrySmiley" )

class Entry extends PIXI.Container {

  constructor( idx = -1 ) {
    super()

    this._isShown = false

    if( idx >= 0 ) {
      this._content = new EntryContentPreview()
      this.addChild( this._content )

      this._circle = new EntryNumber( idx )
      this._circle.x = 133
      this._circle.y = 124
      this.addChild( this._circle )
    } else {
      this._content = new EntryComingSoon()
      this.addChild( this._content )

      this._circle = new EntrySmiley()
      this._circle.x = 133
      this._circle.y = 124
      this.addChild( this._circle )
    }

    this._binds = {}
    this._binds.onMouseOver = this._onMouseOver.bind( this )
    this._binds.onMouseOut = this._onMouseOut.bind( this )
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

  show( delay = 0 ) {
    this._content.show( delay )
    this._circle.show( delay + .3 )
    this._circle.x = 113
    TweenLite.to( this._circle, .6, {
      delay: delay + .3,
      x: 133,
      ease: Quart.easeOut,
      onComplete: () => {
        this._isShown = true
      }
    })
  }

  bindEvents() {
    if( this._content.hoverZone ) {
      this._content.hoverZone.interactive = true

      this._content.hoverZone.on( "mouseover", this._binds.onMouseOver )
      this._content.hoverZone.on( "mouseout", this._binds.onMouseOut )
    }
  }

  unbindEvents() {
    if( this._content.hoverZone ) {
      this._content.hoverZone.interactive = false

      this._content.hoverZone.off( "mouseover", this._binds.onMouseOver )
      this._content.hoverZone.off( "mouseout", this._binds.onMouseOut )
    }
  }

}

module.exports = Entry
