const loop = require( "fz/core/loop" )
const timeout = require( "fz/utils/timeout" )

const config = require( "xmas/core/config" )
const uTexts = require( "xmas/utils/texts" )

class Storyline extends PIXI.Container {

  constructor() {
    super()

    this._tf = uTexts.createWithWords( "A daily dose of interactive experiments till Christmas", { font: "20px " + config.fonts.regular, fill: config.colors.blue }, 3, 10 )
    this.addChild( this._tf )

    this._poly = new PIXI.Sprite( PIXI.Texture.fromFrame( "poly_2x.png" ) )
    this._poly.tint = config.colors.blue
    this._poly.x = -100
    this._poly.y = -75
    this._poly.anchor.set( .5, .5 )
    this._poly.scale.set( 0, 0 )
    this.addChild( this._poly )

    this._circle = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_2x.png" ) )
    this._circle.tint = config.colors.red
    this._circle.x = 550
    this._circle.y = 125
    this._circle.anchor.set( .5, .5 )
    this._circle.scale.set( 0, 0 )
    this.addChild( this._circle )

    this._initWords()

    this._binds = {}
    this._binds.onUpdate = this._onUpdate.bind( this )
  }

  _initWords() {
    const n = this._tf.children.length
    for( let i = 0; i < n; i++ ) {
      this._tf.children[ i ].alpha = 0
    }
  }

  show( delay = 0 ) {
    this._showWords( delay )

    timeout( () => {
      loop.add( this._binds.onUpdate )
    }, delay * 1000 )

    TweenMax.to( this._poly.scale, .8, {
      delay: delay,
      x: .5,
      y: .5,
      ease: Quart.easeInOut
    })

    TweenMax.to( this._circle.scale, .8, {
      delay: delay,
      x: .5,
      y: .5,
      ease: Quart.easeInOut
    })
  }

  _showWords( delay ) {
    const n = this._tf.children.length
    for( let i = 0; i < n; i++ ) {
      TweenMax.to( this._tf.children[ i ], .8, {
        delay: delay,
        alpha: 1,
        ease: Quart.easeInOut,
      })

      delay += .075
    }
  }

  _onUpdate() {
    this._poly.x += 1.1
    this._poly.rotation += .01

    this._circle.x -= 1.15
  }

  hide( delay = 0 ) {
    this._hideWords( delay )
    TweenMax.to( this._poly.scale, .8, {
      delay: delay + .2,
      x: 0,
      y: 0,
      ease: Quart.easeInOut
    })

    TweenMax.to( this._circle.scale, .8, {
      delay: delay,
      x: 0,
      y: 0,
      ease: Quart.easeInOut
    })
  }

  _hideWords( delay ) {
    const n = this._tf.children.length
    for( let i = 0; i < n; i++ ) {
      TweenMax.to( this._tf.children[ i ], .8, {
        delay: delay,
        alpha: 0,
        ease: Cubic.easeInOut,
      })

      delay += .05
    }

  }



}

module.exports = Storyline
