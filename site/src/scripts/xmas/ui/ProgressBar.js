const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const config = require( "xmas/core/config" )

class ProgressBar extends PIXI.Container {

  constructor() {
    super()

    this._gTop = new PIXI.Graphics()
    this.addChild( this._gTop )

    this._gBot = new PIXI.Graphics()
    this._gBot.y = 290
    this.addChild( this._gBot )

    this._percent = 0
    this._percentTo = 0

    this._xStartTop = -stage.width * .5
    this._xStartBottom = stage.width * .5

    this.alpha = 0

    this._binds = {}
    this._binds.onUpdate = this._onUpdate.bind( this )
    this._binds.draw = this._draw.bind( this )
  }

  _onUpdate() {
    this._percent += ( this._percentTo - this._percent ) * .09
    this._draw()
  }

  _draw() {
    const wh = stage.width >> 1

    this._gTop.clear()
    this._gTop.lineStyle( 2, config.colors.blue )
    this._gTop.moveTo( this._xStartTop, 0 )
    this._gTop.lineTo( -wh + this._percent * ( wh + 28 ), 0 )

    this._gBot.clear()
    this._gBot.lineStyle( 2, config.colors.blue )
    this._gBot.moveTo( this._xStartBottom, 0 )
    this._gBot.lineTo( wh - this._percent * ( wh + 28 ), 0 )
  }

  setPercent( value ) {
    if( value < 1 ) {
      this._percentTo = value
      if( this._percentTo >= .4 ) {
        this.bindEvents()
      }
    } else {
      this.unbindEvents()
      const wh = stage.width >> 1
      TweenMax.to( this, .8, { 
        _percent: 1,
        _xStartTop: -28 >> 0,
        _xStartBottom: 28 >> 0,
        onUpdate: this._binds.draw,
        onComplete: this._binds.draw,
        ease: Cubic.easeInOut
      })
    }
  }

  bindEvents() {
    loop.add( this._binds.onUpdate )
  }

  unbindEvents() {
    loop.remove( this._binds.onUpdate )
  }

  show( delay = 0 ) {
    TweenMax.to( this, .8, {
      delay: delay,
      alpha: 1,
      ease: Quart.easeInOut
    })
  }

  switchMode( delay = 0 ) {
    TweenMax.to( this._gTop, .4, {
      delay: delay,
      y: 140,
      ease: Quad.easeIn
    })
    TweenMax.to( this._gBot, .4, {
      delay: delay,
      y: 280,
      ease: Quad.easeIn
    })
  }

  hideBottomBar( delay ) {
    TweenMax.to( this._gBot, .6, {
      delay: delay,
      alpha: 0,
      ease: Quad.easeOut
    })
  }

}

module.exports = ProgressBar
