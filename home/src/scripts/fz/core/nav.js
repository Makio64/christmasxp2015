const Emitter = require( "fz/events/Emitter" )

class Nav extends Emitter {

    constructor() {
        this.id = ""
    }

    set( id ) {
        if( id == this.id ) {
            return
        }
        this.id = id
        this.emit( "change" )
    }
}

module.exports = new Nav

