class EntrySmiley extends PIXI.Container {

  constructor() {
    super()

    this._bg = new PIXI.Sprite( PIXI.Texture.fromFrame( "bg-entry-number_2x.png" ) )
    this._bg.scale.set( .5, .5 )
    this.addChild( this._bg )

    this._cntSmiley = this._createSmiley()
    this._cntSmiley.x = this._bg.width >> 1
    this._cntSmiley.y = this._bg.height * .5 + 7
    this.addChild( this._cntSmiley )

    this.scale.x =
    this.scale.y = 0
    this.pivot.set( this._bg.width >> 1, this._bg.height >> 1 )
  }

  _createSmiley() {
    const cnt = new PIXI.Container()

    this._wSmiley = 5
    this._hSmileyMouth = 6

    this._eyeLeft = new PIXI.Graphics()
    this._eyeLeft.x = -this._wSmiley
    this._eyeLeft.y = -this._hSmileyMouth - 4
    this._drawEye( this._eyeLeft )
    cnt.addChild( this._eyeLeft )

    this._eyeRight = new PIXI.Graphics()
    this._eyeRight.x = this._wSmiley
    this._eyeRight.y = -this._hSmileyMouth - 4
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
    g.drawCircle( 0, 0, 1 )
  }

  _drawMouth() {
    this._mouth.clear()
    this._mouth.lineStyle( 1 , 0xffffff )
    this._mouth.moveTo( 0, 0 )
    this._mouth.quadraticCurveTo( -this._wSmiley, 0, -this._wSmiley, -this._hSmileyMouth )
    this._mouth.moveTo( 0, 0 )
    this._mouth.quadraticCurveTo( this._wSmiley, 0, this._wSmiley, -this._hSmileyMouth )
  }

  show( delay = 0 ) {
    TweenLite.to( this.scale, .2, {
      delay: delay,
      x: 0.4,
      y: 0.4,
      ease: Sine.easeIn,
    } )
    TweenLite.set( this.scale, {
      delay: delay + .2,
      x: .6,
      y: .6
    } )
    TweenLite.to( this.scale, .4, {
      delay: delay + .2,
      x: 1,
      y: 1,
      ease: Quart.easeOut,
    } )
  }

}

module.exports = EntrySmiley
