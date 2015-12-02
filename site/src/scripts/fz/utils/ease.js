const _HALF_PI = Math.PI * .5

module.exports.sine = {
    out: ( p ) => {
      return Math.sin( p * _HALF_PI )
    },
    in: ( p ) => {
      return -Math.cos( p * _HALF_PI ) + 1
    }
}

module.exports.expo = {
    out: ( p ) => {
      return 1 - Math.pow( 2, -10 * p )
    },
    in: ( p ) => {
      return Math.pow( 2, 10 * (p - 1) ) - 0.001
    }
}
