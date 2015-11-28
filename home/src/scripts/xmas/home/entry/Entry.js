const EntryContentPreview = require( "xmas/home/entry/EntryContentPreview" )
const EntryNumber = require( "xmas/home/entry/EntryNumber" )
const EntryComingSoon = require( "xmas/home/entry/EntryComingSoon" )
const EntrySmiley = require( "xmas/home/entry/EntrySmiley" )

class Entry extends PIXI.Container {

  constructor( idx = -1 ) {
    super()

    if( idx >= 0 ) {
      this._content = new EntryContentPreview()
      this.addChild( this._content )

      this._circle = new EntryNumber( idx )
      this._circle.x = 119
      this._circle.y = 106
      this.addChild( this._circle )
    } else {
      this._content = new EntryComingSoon()
      this.addChild( this._content )

      this._circle = new EntrySmiley()
      this._circle.x = 119
      this._circle.y = 106
      this.addChild( this._circle )
    }
  }

  show( delay = 0 ) {

  }

  bindEvents() {
    if( this._content.bindEvents ) {
      this._content.bindEvents()
    }
    if( this._circle.bindEvents ) {
      this._circle.bindEvents()
    }
  }

  unbindEvents() {
    if( this._content.unbindEvents ) {
      this._content.unbindEvents()
    }
    if( this._circle.unbindEvents ) {
      this._circle.unbindEvents()
    }
  }

}

module.exports = Entry
