const pixi = require( "fz/core/pixi" )
const stage = require( "fz/core/stage" )

const config = require( "xmas/core/config" )
const uTexts = require( "xmas/utils/texts" )

const Title = require( "xmas/ui/Title" )
const ProgressBar = require( "xmas/ui/ProgressBar" )
const Storyline = require( "xmas/ui/Storyline" )

class Logo extends PIXI.Container {

  constructor() {
    super()

    this._title = new Title()
    this._title.x = -270
    this._title.y = -140
    this.addChild( this._title )

    this._progressBar = new ProgressBar()
    this._progressBar.y = -200
    this.addChild( this._progressBar )

    this._a = 2 * Math.PI / 6
    this._rad = 32

    // const cntTmp = new PIXI.Container()
    // this._cntLogo = new PIXI.Sprite( PIXI.Texture.fromFrame( "logo.png" ) )
    // this.addChild( this._cntLogo )

    // this._treeGray = this._createTree( 0xbcc5dd, 0xffffff )
    // this._treeGray.rotation = Math.PI / 6 * 4
    // cntTmp.addChild( this._treeGray ) 

    // this._treeWhite = this._createTree( 0xffffff, config.colors.red )
    // this._treeWhite.rotation = -Math.PI / 6 * 4
    // cntTmp.addChild( this._treeWhite ) 

    // this._treeMain = new PIXI.Graphics()
    // cntTmp.addChild( this._treeMain )

    // const tex = cntTmp.generateTexture( pixi.renderer, stage.resolution )

    // this._updateTreeMain()

    this._cntLogo = new PIXI.Container()
    this.addChild( this._cntLogo )

    this._logo = new PIXI.Sprite( PIXI.Texture.fromFrame( "img/logo.png" ) )
    this._logo.anchor.set( .5, .5 )
    this._cntLogo.addChild( this._logo )
    this._cntLogo.alpha = 0

    this._initDate()

    this._canHideLoading = false
    this._wantsToHideLoading = false
  }

  // _createTree( cBg, cDot ) {
  //   let aCurr = -Math.PI / 4 * 2
  //   let aCircle = 0

  //   const g = new PIXI.Graphics()
  //   g.beginFill( cBg )
  //   g.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a * 2
  //   aCircle = aCurr
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )

  //   g.beginFill( cDot )
  //   g.drawCircle( 3, Math.sin( aCircle ) * this._rad, 3 )

  //   return g
  // }

  // _updateTreeMain() {
  //   let aCurr = -Math.PI / 4 * 2
  //   let aCircle = 0

  //   this._treeMain.clear()

  //   this._treeMain.beginFill( config.colors.blue )
  //   this._treeMain.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a * 2
  //   aCircle = aCurr
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )


  //   aCurr = -Math.PI / 4 * 2
  //   this._treeMain.beginFill( 0x305ad1 )
  //   this._treeMain.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   this._treeMain.lineTo( 0, 0 )
  //   aCurr += this._a * 4
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )

  //   this._treeMain.beginFill( 0xffffff )
  //   this._treeMain.drawCircle( 3, Math.sin( aCircle ) * this._rad, 3 )
  // }

  _initDate() {
    const cntTmp = uTexts.create( "2015", { font: "20px " + config.fonts.bold, fill: config.colors.blue }, 10 )

    const tex = cntTmp.generateTexture( pixi.renderer, stage.resolution )

    this._cntDate = new PIXI.Sprite( tex )
    this._cntDate.x = - this._cntDate.width >> 1
    this._cntDate.y = 40
    this._cntLogo.addChild( this._cntDate )

    this._cntDate.alpha = 0
  }

  show( delay = 0 ) { 
    this._title.show()
    this._progressBar.show( .5 )

    TweenLite.to( this._cntLogo, .8, {
      delay: delay + .3,
      alpha: 1,
      ease: Quart.easeInOut
    })
    TweenLite.to( this._logo.scale, 1.2, {
      delay: delay + .3,
      x: .6,
      y: .6,
      ease: Cubic.easeOut
    })

    TweenLite.to( this._cntDate, .8, {
      delay: delay + .9,
      alpha: 1,
      ease: Quart.easeInOut
    })


    //
    this._progressBar.setPercent( .2 )
    TweenLite.set( this, {
      delay: .8, 
      onComplete: () => {
        this._progressBar.setPercent( .8 )
      }
    })

    TweenLite.set( this, {
      delay: 1.4,
      onComplete: () => {
        this._canHideLoading = true
        if( this._wantsToHideLoading ) {
          this.hideLoading()
        }
      }
    })
  }

  hideLoading( xmas ) {
    if( xmas ) {
      this._xmas = xmas 
    }

    this._wantsToHideLoading = true
    if( !this._canHideLoading ) {
      return
    }
    // tmp
    TweenLite.set( this, {
      onComplete: () => {
        this._progressBar.setPercent( 1 )
      }
    })
    //

    TweenLite.set( this, {
      delay: .6,
      onComplete: () => {
        this._title.hide()
        TweenLite.to( this, .8, {
          delay: .4,
          y: 90,
          ease: Quart.easeInOut,
        })
        this._progressBar.switchMode( .4 )
        TweenLite.to( this._cntDate, .6, {
          delay: 3,
          alpha: 0,
          ease: Quad.easeOut,
          onComplete: () => {
            this._cntLogo.removeChild( this._cntDate )
          }
        })
        this._progressBar.hideBottomBar( 3 )

        this._storyline = new Storyline()
        this._storyline.x = -200
        this._storyline.y = 220
        this.addChild( this._storyline )

        this._storyline.show( .6 )
        this._storyline.hide( 2.7 )

        TweenLite.set( this, {
          delay: 3.4,
          onComplete: () => {
            // TweenLite.to( this._progressBar.scale, .6, {
            //   x: .8,
            //   y: .8,
            //   ease: Cubic.easeInOut
            // })
            // TweenLite.to( this._cntLogo.scale, .6, {
            //   x: .8,
            //   y: .8,
            //   ease: Cubic.easeInOut
            // })
            this._xmas.show()
          }
        })
      }
    })
  }

}

module.exports = Logo
