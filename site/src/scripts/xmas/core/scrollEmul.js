const Emitter = require( "fz/events/Emitter" )

class ScrollEmul extends Emitter {

  constructor() {
    super()

    this._binds = {}
    this._binds.onScroll = this._onScroll.bind( this )
  }

  _onScroll() {
    this._yTo = window.pageYOffset
    this.emit( "change", this._yTo )
  }

  bindElements() {
    this._domEmul = document.getElementById( "scroll-emul" )
  }

  bindEvents() {
    document.addEventListener( "DOMMouseScroll", this._binds.onScroll )
    document.addEventListener( "mousewheel", this._binds.onScroll )
    document.addEventListener( "scroll", this._binds.onScroll )
  }

  setHeight( value ) {
    console.log( value )
    this._domEmul.style.height = value + "px"
  }

  reset() {
    window.scroll( 0, 0 )
    this._domEmul.style.height = "0px"
  }

}

module.exports = new ScrollEmul()
