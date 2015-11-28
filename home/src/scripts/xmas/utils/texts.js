const stage = require( "fz/core/stage" )

module.exports.create = ( text, style, letterSpacing = 2 ) => {
  const cnt = new PIXI.Container()

  let px = 0

  let tf = null
  const n = text.length
  for( let i = 0; i < n; i++ ) {
    // tf = new PIXI.Text( text[ i ], style )
    tf = new PIXI.extras.BitmapText( text[ i ], style )
    tf.tint = style.fill
    // tf.resolution = stage.resolution
    tf.x = px
    tf.xBase = px
    cnt.addChild( tf )

    px += tf.width + letterSpacing //>> 0
  }

  return cnt
}
