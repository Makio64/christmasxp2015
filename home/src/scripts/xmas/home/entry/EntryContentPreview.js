const uImg = require( "fz/utils/images" )
const pixi = require( "fz/core/pixi" )
const config = require( "xmas/core/config" )
const PolyShape = require( "xmas/home/entry/PolyShape" )

class DefaultShape extends PIXI.Container {

  constructor() {
    super()

    this._cntPreview = this._createPreview()
    this.addChild( this._cntPreview )

    this.pivot.x = config.sizes.entry.w >> 1
    this.pivot.y = config.sizes.entry.h >> 1

    this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this._layer.tint = config.colors.blue
    this._layer.alpha = .95
    this._layer.x = -20
    this._layer.y = -20
    this.addChild( this._layer )

    this._polyShape = new PolyShape()
    this._polyShape.x = config.sizes.entry.w >> 1
    this._polyShape.y = config.sizes.entry.h >> 1
    this.addChild( this._polyShape )

    this.mask = this._polyShape

    // this._shapeOver = new PolyShape( 0xe5f2ff )
    this._shapeOver = new PIXI.Graphics()
    this._shapeOver.beginFill( 0xe5f2ff )
    // this._shapeOver.x = this._msk.x
    // this._shapeOver.y = this._msk.y
    this._shapeOver.drawCircle( 0, 0, ( config.sizes.entry.h >> 1 ) )
    this._shapeOver.x = this._polyShape.x
    this._shapeOver.y = this._polyShape.y
    this._shapeOver.scale.x = this._shapeOver.scale.y = 0
    // this.addChild( this._shapeOver )
  }

  _createPreview() {
    const cnt = new PIXI.Container()

    this._img = new PIXI.Sprite( PIXI.Texture.fromFrame( "img/default.jpg" ) )
    const fit = uImg.fit( this._img.width, this._img.height, config.sizes.entry.w, ( config.sizes.entry.h ) )
    this._img.width = fit.width >> 0
    this._img.height = fit.height >> 0
    this._img.x = config.sizes.entry.w - fit.width >> 1
    this._img.y = config.sizes.entry.h - fit.height >> 1
    this.addChild( this._img )

    return cnt
  }

  over() {
    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._shapeOver.scale )
    TweenLite.killTweensOf( this._polyShape.scale )

    this._polyShape.scale.x =
    this._polyShape.scale.y = 1
    this._shapeOver.scale.x = 0
    this._shapeOver.scale.y = 0
    this.scale.x =
    this.scale.y = 1

    this.addChild( this._shapeOver )
    TweenLite.set( this._shapeOver.scale, {
      delay: .175,
      x: .675,
      y: .675
    })
    TweenLite.to( this._shapeOver.scale, .4, {
      delay: .175,
      x: 1.1,
      y: 1.1,
      ease: Quart.easeOut
    })

    TweenLite.to( this._polyShape.scale, .4, {
      delay: .1,
      x: 1.1,
      y: 1.1,
      ease: Quart.easeOut
    } )
  }

  out() {
    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._shapeOver.scale )
    TweenLite.killTweensOf( this._polyShape.scale )
    this.rotation = 0

    this.removeChild( this._shapeOver )

    this.scale.x =
    this.scale.y = 1
    this._shapeOver.scale.x = 
    this._shapeOver.scale.y = 0
    this._polyShape.scale.x = 
    this._polyShape.scale.y = 1.05

    TweenLite.to( this._polyShape.scale, .6, {
      x: 1,
      y: 1,
      ease: Quad.easeOut
    } )
  }

}

class HoverShape extends PIXI.Container {

  constructor() {
    super()

    this._size = config.sizes.entry.w

    this._percent = 0.0001

    this.pivot.x = config.sizes.entry.w >> 1
    this.pivot.y = config.sizes.entry.h >> 1

    this._cntPreview = this._createPreview()
    this.addChild( this._cntPreview )

    this._layer = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this._layer.tint = config.colors.blue
    this._layer.x = -20
    this._layer.y = -20
    this._layer.alpha = .3

    this.addChild( this._layer )
    this._msk = new PIXI.Graphics()
    this._msk.x = config.sizes.entry.w >> 1
    this._msk.y = config.sizes.entry.h >> 1
    this.addChild( this._msk )

    this._updateMsk()

    this.mask = this._msk

    this._shapeOver = new PIXI.Graphics()
    this._shapeOver.beginFill( 0xe5f2ff )
    this._shapeOver.x = this._msk.x
    this._shapeOver.y = this._msk.y
    this._shapeOver.drawCircle( 0, 0, ( config.sizes.entry.w >> 1 ) )
    this._shapeOver.scale.x = 
    this._shapeOver.scale.y = 0

    this._binds = {}
    this._binds.updateMsk = this._updateMsk.bind( this )
  }

  _createPreview() {
    const cnt = new PIXI.Container()

    this._img = new PIXI.Sprite( PIXI.Texture.fromFrame( "img/default.jpg" ) )
    const fit = uImg.fit( this._img.width, this._img.height, config.sizes.entry.w, config.sizes.entry.h )
    this._img.width = fit.width >> 0
    this._img.height = fit.height >> 0
    this._img.x = config.sizes.entry.w - fit.width >> 1
    this._img.y = config.sizes.entry.h - fit.height >> 1
    this.addChild( this._img )

    return cnt
  }

  _updateMsk() {
    this._msk.clear()
    this._msk.beginFill( 0x00ff00 )
    this._drawCircleMask()
  }

  _drawCircleMask() {
    this._msk.drawCircle( 0, 0, ( config.sizes.entry.w >> 1 ) * this._percent )
  }

  over() {
    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._shapeOver.scale )

    this.scale.x =
    this.scale.y = 1
    this._shapeOver.scale.x = 
    this._shapeOver.scale.y = 0
    this._percent = 0.0001
    this._updateMsk()

    this.removeChild( this._shapeOver )

    TweenLite.to( this, .155, {
      _percent: 0.2,
      ease: Quad.easeIn,
      onUpdate: this._binds.updateMsk
    } )
    TweenLite.set( this, {
      delay: .155,
      _percent: .75
    } )
    TweenLite.to( this, .5, {
      delay: .155,
      _percent: 1,
      ease: Quart.easeOut,
      onUpdate: this._binds.updateMsk
    } )
  }

  out( cb ) {
    TweenLite.killTweensOf( this )
    TweenLite.killTweensOf( this._shapeOver.scale )

    this.addChild( this._shapeOver )
    TweenLite.set( this._shapeOver.scale, {
      x: .4,
      y: .4
    } )
    TweenLite.to( this._shapeOver.scale, .4, {
      x: 1,
      y: 1,
      ease: Quart.easeOut
    } )

    TweenLite.to( this.scale, .5, {
      x: 1.1,
      y: 1.1,
      ease: Quart.easeOut
    } )

  }

}

class EntryContentPreview extends PIXI.Container {

  constructor() {
    super()

    this._default = new DefaultShape()
    this._default.x = config.sizes.entry.w >> 1
    this._default.y = config.sizes.entry.h >> 1
    this.addChild( this._default )

    this._hover = new HoverShape()
    this._hover.x = config.sizes.entry.w >> 1
    this._hover.y = config.sizes.entry.h >> 1
    // this.addChild( this._hover )

    this._hoverZone = new PIXI.Sprite( PIXI.Texture.fromFrame( "layer-blue.png" ) )
    this._hoverZone.scale.set( .5, .5 )
    this._hoverZone.tint = Math.random() * 0xffffff
    this._hoverZone.alpha = 0
    this.addChild( this._hoverZone )

    this._binds = {}
    this._binds.onMouseOver = this._onMouseOver.bind( this )
    this._binds.onMouseOut = this._onMouseOut.bind( this )
  }

  _onMouseOver() {
    this._default.over()

    this.addChild( this._hover )
    this._hover.over()
  }

  _onMouseOut() {
    this._default.out()
    this.addChild( this._default )

    // this._hover.out( () => {
    //   this.removeChild( this._hover )
    // })
    this.removeChild( this._hover )
  }

  bindEvents() {
    this._hoverZone.interactive = true

    this._hoverZone.on( "mouseover", this._binds.onMouseOver )
    this._hoverZone.on( "mouseout", this._binds.onMouseOut )
  }

  unbindEvents() {
    this._hoverZone.off( "mouseover", this._binds.onMouseOver )
    this._hoverZone.off( "mouseout", this._binds.onMouseOut )
  }

}

module.exports = EntryContentPreview
