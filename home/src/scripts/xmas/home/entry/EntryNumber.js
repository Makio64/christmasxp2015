const config = require( "xmas/core/config" )
const uXmasTexts = require( "xmas/utils/texts" )

class EntryNumber extends PIXI.Container {

  constructor( idx ) {
    super()

    this._percentArrowLine = 0
    this._percentArrowEnd = 0

    this._bg = new PIXI.Sprite( PIXI.Texture.fromFrame( "bg-entry-number_2x.png" ) )
    this._bg.scale.set( .5, .5 )
    this.addChild( this._bg )

    this._cntText = uXmasTexts.create( "0" + idx,  { font: "20px " + config.fonts.bold, fill: 0xffffff } )
    this._cntText.x = this._bg.width - this._cntText.width >> 1
    this._cntText.y = this._bg.height - this._cntText.height >> 1
    this._cntText.x -= 1
    this._cntText.y -= 1
    this._initLetters()
    this.addChild( this._cntText )

    this._createArrow()

    this.scale.x =
    this.scale.y = 0
    this.alpha = 0
    this.pivot.set( this._bg.width >> 1, this._bg.height >> 1 )

    this._binds = {}
    this._binds.drawArrowLine = this._drawArrowLine.bind( this )
    this._binds.drawArrowEnd = this._drawArrowEnd.bind( this )
  }

  _initLetters() {
    let letter = null
    const n = this._cntText.children.length
    for( let i = 0; i < n; i++ ) {
      letter = this._cntText.children[ i ]
      letter.alpha = 0
      letter.y = 10
    }
  }

  _createArrow() {
    this._cntArrow = new PIXI.Container()
    this._cntArrow.x = -4
    this._cntArrow.y = this._bg.height >> 1
    // this.addChild( this._cntArrow )

    this._wArrowLine = 22
    this._sizeArrowEnd = 5

    this._arrowLine = new PIXI.Graphics()
    this._cntArrow.addChild( this._arrowLine )

    this._arrowEnd = new PIXI.Graphics()
    // this._arrowEnd.x = this._wArrowLine
    this._cntArrow.addChild( this._arrowEnd )
  }

  _drawArrowLine() {
    this._arrowLine.clear()
    this._arrowLine.lineStyle( 2, 0xffffff )
    this._arrowLine.moveTo( 0, 0 )
    this._arrowLine.lineTo( - this._wArrowLine * this._percentArrowLine, 0 )
  }

  _drawArrowEnd() {
    this._arrowEnd.clear()
    this._arrowEnd.lineStyle( 2, 0xffffff )
    this._arrowEnd.moveTo( -this._sizeArrowEnd * this._percentArrowEnd, -this._sizeArrowEnd * this._percentArrowEnd )
    this._arrowEnd.lineTo( 0, 0 )
    this._arrowEnd.lineTo( -this._sizeArrowEnd * this._percentArrowEnd, this._sizeArrowEnd * this._percentArrowEnd )
  }

  over() {
    let letter = null
    const n = this._cntText.children.length
    for( let i = 0; i < n; i++ ) {
      letter = this._cntText.children[ i ]
      TweenLite.killTweensOf( letter )
      TweenLite.to( letter, .4, {
        delay: ( n - i ) * .04,
        x: letter.xBase + 25 >> 0,
        alpha: 0,
        ease: Cubic.easeInOut
      })  
    }

    this.addChild( this._cntArrow )

    this._cntArrow.x = -4
    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._cntArrow )
    TweenLite.to( this, .4, {
      delay: .2,
      _percentArrowLine: 1,
      ease: Cubic.easeInOut,
      onUpdate: this._binds.drawArrowLine
    })
    TweenLite.to( this, .4, {
      delay: .2,
      _percentArrowEnd: 1,
      ease: Cubic.easeInOut,
      onUpdate: this._binds.drawArrowEnd
    })
    TweenLite.to( this._cntArrow, .4, {
      delay: .2,
      x: 16,
      ease: Cubic.easeInOut
    })
  }

  out() {
    let letter = null
    const n = this._cntText.children.length
    for( let i = 0; i < n; i++ ) {
      letter = this._cntText.children[ i ]
      letter.x = letter.xBase - 25
      TweenLite.killTweensOf( letter )
      TweenLite.to( letter, .4, {
        delay: ( n - i ) * .04,
        x: letter.xBase >> 0,
        alpha: 1,
        ease: Cubic.easeInOut
      })  
    }

    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._cntArrow )
    TweenLite.to( this, .4, {
      _percentArrowLine: 0,
      ease: Cubic.easeInOut,
      onUpdate: this._binds.drawArrowLine
    })
    TweenLite.to( this, .4, {
      _percentArrowEnd: 0,
      ease: Cubic.easeInOut,
      onUpdate: this._binds.drawArrowEnd
    })
    TweenLite.to( this._cntArrow, .4, {
      x: 46,
      ease: Cubic.easeInOut,
      onComplete: () => {
        this.removeChild( this._cntArrow )
      }
    })
  }

  show( delay = 0 ) {
    // TweenLite.set( this, {
    //   delay: delay,
    //   alpha: .6
    // })
    TweenLite.to( this, .6, {
      delay: delay,
      alpha: 1,
      ease: Cubic.easeInOut
    })
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
    TweenLite.to( this.scale, .8, {
      delay: delay + .2,
      x: 1,
      y: 1,
      ease: Cubic.easeOut,
    } )

    let letter = null
    const n = this._cntText.children.length
    for( let i = 0; i < n; i++ ) {
      letter = this._cntText.children[ i ]
      TweenLite.to( letter, .6, {
        delay: delay + .2 + i * .04,
        y: 0,
        alpha: 1,
        ease: Cubic.easeInOut
      })  
    }
  }

  hide( delay = 0 ) {
    TweenLite.to( this, .6, {
      delay: delay,
      alpha: 0,
      ease: Cubic.easeInOut
    })
    TweenLite.to( this.scale, .6, {
      delay: delay,
      x: 0,
      y: 0,
      ease: Cubic.easeInOut,
    } )
  }

}

module.exports = EntryNumber
