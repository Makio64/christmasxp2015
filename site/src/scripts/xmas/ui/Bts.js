class Bts extends PIXI.Container {

  constructor() {
    super()

    this._binds = {}
    this._binds.onMouseOver = this._onMouseOver.bind( this )
    this._binds.onMouseOut = this._onMouseOut.bind( this )
    this._binds.onClick = this._onClick.bind( this )

    this._initTop()
    this._initShare()
  }

  _onMouseOver( e ) {
    const target = e.target
    TweenLite.to( target.children[ 1 ], .25, {
      alpha: 1,
      ease: Quart.easeOut
    })
  }

  _onMouseOut( e ) {
    const target = e.target
    TweenLite.to( target.children[ 1 ], .25, {
      alpha: 0,
      ease: Quart.easeOut
    })
  }

  _onClick( e ) {
    const target = e.target
    if( target == this._btSubmit ) {
      window.open( "https://github.com/Makio64/christmasxp2015/blob/master/README.md", "_blank" )
    } else if ( target == this._btAbout ) {
      window.open( "https://github.com/makio64/christmasxp2015", "_blank" )
    } else if( target == this._btFB ) {
      FB.ui ( {
        method: 'feed',
        name: "Christmas Experiments - 2015",
        caption: "Christmas Experiments 2015, discover the best experiments of the winter!",
        link: "http://christmasexperiments.com/",
        picture: "http://christmasexperiments.com/share.jpg"
      } , ( response ) => {
        console.log( "response" )
      } )
    } else if( target == this._btTwitter ) {
      let url = "https://twitter.com/share?"
      url += "text="  + encodeURIComponent( "Christmas Experiments 2015, discover the best experiments of the winter!" )
      url += "&url=" + encodeURIComponent( "http://christmasexperiments.com/" )
      window.open( url, "", "top=100, left=200, width=600, height = 500" );
    }
  }

  _initTop() {
    this._cntTop = new PIXI.Container()
    this.addChild( this._cntTop )

    this._btSubmit = this._createBt( "bt_submitxp" )
    this._btSubmit.x = -2
    this._cntTop.addChild( this._btSubmit )

    this._btAbout = this._createBt( "bt_about" )
    this._btAbout.x = 125
    this._btAbout.y = 17
    this._cntTop.addChild( this._btAbout )
  }

  _initShare() {
    this._cntShare = new PIXI.Container()
    this._cntShare.x = 134
    this._cntShare.y = 180
    this.addChild( this._cntShare )

    this._btFB = this._createBt( "bt_fb" )
    this._cntShare.addChild( this._btFB )

    this._btTwitter = this._createBt( "bt_twitter" )
    this._btTwitter.x = 27
    this._btTwitter.y = 17
    this._cntShare.addChild( this._btTwitter )
  }

  _createBt( name ) {
    const cnt = new PIXI.Container()
    cnt.alpha = 0
    cnt.interactive = true
    cnt.buttonMode = true
    cnt.on( "mouseover", this._binds.onMouseOver )
    cnt.on( "mouseout", this._binds.onMouseOut )
    cnt.on( "click", this._binds.onClick )
	cnt.on("touchend", this._binds.onClick )

    const normal = new PIXI.Sprite( PIXI.Texture.fromFrame( name + ".png" ) )
    normal.scale.set( .5, .5 )
    cnt.addChild( normal )

    const hover = new PIXI.Sprite( PIXI.Texture.fromFrame( name + "_hover.png" ) )
    hover.scale.set( .5, .5 )
    hover.alpha = 0
    cnt.addChild( hover )

    return cnt
  }

  show( delay = 0 ) {
    TweenLite.to( this._btSubmit, .8, {
      delay: delay,
      alpha: 1,
      ease: Quart.easeInOut
    })

    TweenLite.to( this._btAbout, .8, {
      delay: delay + .2,
      alpha: 1,
      ease: Quart.easeInOut
    })

    TweenLite.to( this._btFB, .8, {
      delay: delay + .1,
      alpha: 1,
      ease: Quart.easeInOut
    })

    TweenLite.to( this._btTwitter, .8, {
      delay: delay + .3,
      alpha: 1,
      ease: Quart.easeInOut
    })
  }

}

module.exports = Bts
