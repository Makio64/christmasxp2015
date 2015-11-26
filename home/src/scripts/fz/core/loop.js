class Loop {

  constructor() {
    this._idRAF = -1
    this._count = 0

    this._listeners = []

    this._binds = {}
    this._binds.update = this._update.bind( this )
  }

  _update() {
    let listener = null
    let i = this._count
    while( --i >= 0 ) {
      listener = this._listeners[ i ]
      if( listener ) {
        listener.apply( this, null )
      }
    }
    this._idRAF = requestAnimationFrame( this._binds.update )
  }

  start() {
    this._update()
  }

  stop() {
    cancelAnimationFrame( this._idRAF )
  }

  add( listener ) {
    const idx = this._listeners.indexOf( listener )
    if( idx >= 0 ) {
      return
    }
    this._listeners.push( listener )
    this._count++
  }

  remove( listener ) {
    const idx = this._listeners.indexOf( listener )
    if( idx < 0 ) {
      return
    }
    this._listeners.splice( idx, 1 )
    this._count--
  }

}

module.exports = new Loop()
