module.exports.extractRGB = function( color ) {
  const r = ( color >> 16 ) & 0xff
  const g = ( color >> 8 ) & 0xff
  const b = ( color ) & 0xff

  return { r: r, g: g, b: b }
}

module.exports.toStringRGB = function( rgb ) {
  return "rgb( " + rgb.r + ", " + rgb.g + ", " + rgb.b + ")"
}

module.exports.toStringRGBA = function( rgb, a ) {
  return "rgba( " + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + a + ")"
}
