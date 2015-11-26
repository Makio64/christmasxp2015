const Emitter = require( "fz/events/Emitter" )

class Loader extends Emitter {

  constructor() {
    super()
  }

  load() {
    this.emit( "complete" )
  }

}

module.exports = Loader
