const config = require( "xmas/core/config" )

class EntrySmiley extends PIXI.Container {

  constructor() {
    super()

    this._bg = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_2x.png" ) )
    this._bg.tint = config.colors.red
    this._bg.scale.set( .33, .33 )
    this.addChild( this._bg )

    this._cntSmiley = this._createSmiley()
    this._cntSmiley.x = this._bg.width * .5 + 1 >> 0
    this._cntSmiley.y = this._bg.height * .5 + 9
    this.addChild( this._cntSmiley )

    this.scale.x =
    this.scale.y = 0
    this.alpha = 0
    this.pivot.set( this._bg.width >> 1, this._bg.height >> 1 )
  }

  _createSmiley() {
    const cnt = new PIXI.Container()

    this._wSmiley = 7
    this._hSmileyMouth = 9

    this._eyeLeft = new PIXI.Graphics()
    this._eyeLeft.x = -this._wSmiley
    this._eyeLeft.y = -this._hSmileyMouth - 6
    this._drawEye( this._eyeLeft )
    cnt.addChild( this._eyeLeft )

    this._eyeRight = new PIXI.Graphics()
    this._eyeRight.x = this._wSmiley
    this._eyeRight.y = -this._hSmileyMouth - 6
    this._drawEye( this._eyeRight )
    cnt.addChild( this._eyeRight )

    this._mouth = new PIXI.Graphics()
    this._drawMouth()
    cnt.addChild( this._mouth )

    return cnt
  }

  _drawEye( g ) {
    g.clear()
    g.beginFill( 0xffffff )
    g.drawCircle( 0, 0, 1.5 )
  }

  _drawMouth() {
    this._mouth.clear()
    this._mouth.lineStyle( 2 , 0xffffff )
    this._mouth.moveTo( 0, 0 )
    this._mouth.quadraticCurveTo( -this._wSmiley, 0, -this._wSmiley, -this._hSmileyMouth )
    this._mouth.moveTo( 0, 0 )
    this._mouth.quadraticCurveTo( this._wSmiley, 0, this._wSmiley, -this._hSmileyMouth )
  }

  show( delay = 0, fast = false ) {
    const ratio = fast ? .5 : 1

    TweenMax.to( this, .4 * ratio, {
      delay: delay,
      alpha: 1,
      ease: Cubic.easeInOut
    })
    TweenMax.to( this.scale, .2 * ratio, {
      delay: delay,
      x: 0.4,
      y: 0.4,
      ease: Sine.easeIn,
    } )
    TweenMax.set( this.scale, {
      delay: delay + .2 * ratio,
      x: .6,
      y: .6
    } )
    TweenMax.to( this.scale, .8 * ratio, {
      delay: delay + .2 * ratio,
      x: 1,
      y: 1,
      ease: Cubic.easeOut,
    } )
  }

  hide( delay = 0 ) {
    TweenMax.killTweensOf( this )
    TweenMax.killTweensOf( this.scale )

    TweenMax.to( this, .6, {
      delay: delay,
      alpha: 0,
      ease: Cubic.easeInOut
    })
    TweenMax.to( this.scale, .6, {
      delay: delay,
      x: 0,
      y: 0,
      ease: Cubic.easeInOut,
    } )
  }

}

module.exports = EntrySmiley
