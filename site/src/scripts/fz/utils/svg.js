const sW3SVG = "http://www.w3.org/2000/svg"

module.exports.create = () => {

  const svg = document.createElementNS( sW3SVG, "svg" )
  svg.setAttribute( "version", "1.1" )
  svg.setAttribute( "xmlns", sW3SVG )
  svg.setAttribute( "xmlns:xlink", "http://www.w3.org/1999/xlink" )

  const path = document.createElementNS( sW3SVG, "path" )
  svg.appendChild( path )

  return { svg: svg, path: path }
}

module.exports.createElement = ( id ) => {
  return document.createElementNS( sW3SVG, id )
}
