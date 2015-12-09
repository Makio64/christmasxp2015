const stage = require( "fz/core/stage" )

module.exports.create = ( text, style, letterSpacing = 3 ) => {
  const cnt = new PIXI.Container()

  let px = 0

  let tf = null
  const n = text.length
  for( let i = 0; i < n; i++ ) {
    // tf = new PIXI.Text( text[ i ], style )
    tf = new PIXI.extras.BitmapText( text[ i ], style )
    tf.tint = style.fill
    tf.scale.set( .5, .5 )
    // tf.resolution = stage.resolution
    tf.x = px
    tf.xBase = px
    cnt.addChild( tf )

    px += tf.width + letterSpacing //>> 0
  }

  return cnt
}

module.exports.createWithWords = ( text, style, letterSpacing = 3, wordSpacing = 2 ) => {
  const cntGlobal = new PIXI.Container()

  let px = 0 
  let pxWords = 0

  let cnt = new PIXI.Container()
  cntGlobal.addChild( cnt )
  let tf = null

  const n = text.length
  for( let i = 0; i < n; i++ ) {
    if( text[ i ] != " " ) {
      tf = new PIXI.extras.BitmapText( text[ i ], style )
      tf.tint = style.fill
      tf.scale.set( .5, .5 )
      tf.x = px
      tf.xBase = px
      cnt.addChild( tf )

      px += tf.width + letterSpacing
    } else {
      pxWords += cnt.width + wordSpacing

      cnt = new PIXI.Container()
      cnt.x = pxWords
      cnt.xBase = pxWords
      cntGlobal.addChild( cnt )

      px = 0
    }
  }

  return cntGlobal
}
