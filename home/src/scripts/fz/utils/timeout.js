const now = require( "fz/utils/now" )

module.exports = function( fn, delay ) {
  const start = now()

  function lp() {
    if( now() - start >= delay ) {
      fn.call()
    } else {
      data.id = requestAnimationFrame( lp )
    }
  }

  const data = {}
  data.id = requestAnimationFrame( lp )

  return data
}

module.exports.clear = function( data ) {
  if( data ) {
    cancelAnimationFrame( data.id )
  }
}
