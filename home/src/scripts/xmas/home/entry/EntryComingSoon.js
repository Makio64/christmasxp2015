const config = require( "xmas/core/config" )
const PolyShape = require( "xmas/home/entry/PolyShape" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntryComingSoon extends PIXI.Container {

  constructor() {
    super()

    this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this.addChild( this._layer )

    this._cntContent = this._createContent()
    this._cntContent.y = config.sizes.entry.h - this._cntContent.height >> 1
    this._cntContent.alpha = 0
    this.addChild( this._cntContent )

    this._polyShape = new PolyShape()
    this._polyShape.x = config.sizes.entry.w >> 1
    this._polyShape.y = config.sizes.entry.h >> 1
    this._polyShape.scale.x = this._polyShape.scale.y = 0
    this.addChild( this._polyShape )

    this.mask = this._polyShape
  }

  _createContent() {
    const cnt = new PIXI.Container()

    this._cntTfTop = uXmasTexts.create( "more fun", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2 )
    this._cntTfTop.x = config.sizes.entry.w - this._cntTfTop.width >> 1
    cnt.addChild( this._cntTfTop )

    this._cntTfBottom = uXmasTexts.create( "coming soon", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2 )
    this._cntTfBottom.x = config.sizes.entry.w - this._cntTfBottom.width >> 1
    this._cntTfBottom.y = 32
    cnt.addChild( this._cntTfBottom )

    return cnt
  }

  show( delay = 0 ) {
    console.log( "yo" )
    this.x = -60
    // this.y = 40
    TweenLite.to( this, .7, {
      delay: delay,
      x: 0,
      y: 0,
      ease: Cubic.easeOut
    })
    TweenLite.to( this._polyShape.scale, .2, {
      delay: delay,
      x: 0.3,
      y: 0.3,
      ease: Sine.easeIn,
    } )
    TweenLite.set( this._polyShape.scale, {
      delay: delay + .2,
      x: .6,
      y: .6
    } )
    TweenLite.to( this._polyShape.scale, .6, {
      delay: delay + .2,
      x: 1,
      y: 1,
      ease: Cubic.easeOut,
    } )

    let px = config.sizes.entry.w - this._cntTfTop.width >> 1
    px -= 20
    this._cntTfTop.x = px
    this._cntTfTop.alpha = 0
    TweenLite.set( this._cntTfTop, {
      delay: delay + .3,
      alpha: .7
    })
    TweenLite.to( this._cntTfTop, .5, {
      delay: delay + .3,
      x: px + 20,
      alpha: 1,
      ease: Cubic.easeOut
    })

    px = config.sizes.entry.w - this._cntTfBottom.width >> 1
    px -= 25
    this._cntTfBottom.x = px
    this._cntTfBottom.alpha = 0
    TweenLite.set( this._cntTfBottom, {
      delay: delay + .375,
      alpha: .7
    })
    TweenLite.to( this._cntTfBottom, .5, {
      delay: delay + .375,
      x: px + 25,
      alpha: 1,
      ease: Cubic.easeOut
    })

    // let letter = null

    // let d = .4
    // let dAdd = .02
    // let dMin = .01
    // let dFriction = .89

    // let i = this._cntTfTop.children.length
    // while( --i > -1 ) {
    //   letter = this._cntTfTop.children[ i ]
    //   letter.x = letter.xBase - 25 >> 0
    //   letter.alpha = 0
    //   TweenLite.set( letter, {
    //     delay: delay + d,
    //     alpha: .8
    //   })
    //   TweenLite.to( letter, .4, {
    //     delay: delay + d,
    //     x: letter.xBase >> 0,
    //     alpha: 1,
    //     ease: Cubic.easeInOut
    //   })

    //   d += dAdd
    //   dAdd *= dFriction
    //   if( dAdd < dMin ) {
    //     dAdd = dMin
    //   }
    // }

    // d = .6
    // dAdd = .04

    // i = this._cntTfBottom.children.length
    // while( --i > -1 ) {
    //   letter = this._cntTfBottom.children[ i ]
    //   letter.x = letter.xBase - 25 >> 0
    //   letter.alpha = 0
    //   TweenLite.set( letter, {
    //     delay: delay + d,
    //     alpha: .8
    //   })
    //   TweenLite.to( letter, .4, {
    //     delay: delay + d,
    //     x: letter.xBase >> 0,
    //     alpha: 1,
    //     ease: Cubic.easeInOut
    //   })

    //   d += dAdd
    //   dAdd *= dFriction
    //   if( dAdd < dMin ) {
    //     dAdd = dMin
    //   }
    // }

    this._cntContent.alpha = 1

    // TweenLite.to( this._cntContent, .6, {
    //   delay: .4,
    //   alpha: 1,
    //   ease: Quart.easeOut
    // })
  }

}

module.exports = EntryComingSoon
