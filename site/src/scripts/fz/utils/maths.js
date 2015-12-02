module.exports.clamp = ( value, min, max ) => {
  return Math.max( min, Math.min( value, max ) )
}
