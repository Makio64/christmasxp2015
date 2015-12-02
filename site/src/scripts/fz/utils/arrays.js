module.exports.shuffle = ( a ) => {
    let t = 0
    let j = 0
    let i = a.length
    while ( --i > 0 ) {
        j = ~~( Math.random() * ( i + 1 ) )
        t = a[ j ]
        a[ j ] = a[ i ]
        a[ i ] = t
    }
    return a
}

module.exports.clone = ( a ) => {
  return a.slice( 0 )
}

module.exports.prefill = ( a, length ) => {
  for( let i = 0; i < length; i++ ) {
    a[ i ] = 0
  }
  return a
}
