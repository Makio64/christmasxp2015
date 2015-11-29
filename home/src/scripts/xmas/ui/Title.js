const config = require( "xmas/core/config" )
const uTexts = require( "xmas/utils/texts" )

class Title extends PIXI.Container {

  constructor() {
    super()

    this._cntTop = uTexts.create( "CHRIST", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 60 )
    this.addChild( this._cntTop )

    this._cntBotLeft = uTexts.create( "MAS", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 50 )
    this._cntBotLeft.y = 100
    this._cntBotLeft.children[ 1 ].x += 4
    this._cntBotLeft.children[ 2 ].x += 7
    this.addChild( this._cntBotLeft )

    this._cntBotRight = uTexts.create( "XP", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 50 )
    this._cntBotRight.x = 277
    this._cntBotRight.y = 100
    this._cntBotRight.children[ 0 ].x += 50
    this._cntBotRight.children[ 1 ].x += 52
    this.addChild( this._cntBotRight )

    this._hideLetters( this._cntTop ) 
    this._hideLetters( this._cntBotLeft ) 
    this._hideLetters( this._cntBotRight ) 
  }

  _hideLetters( cnt ) {
    const n = cnt.children.length
    for( let i = 0; i < n; i++ ) {
      cnt.children[ i ].alpha = 0
    }
  }

  show() {
    this._delay = 0
    this._showLetter( this._cntTop.children[ 1 ] )
    this._showLetter( this._cntBotRight.children[ 0 ] )
    this._showLetter( this._cntTop.children[ 4 ], false )
    this._showLetter( this._cntBotLeft.children[ 2 ] )
    this._showLetter( this._cntTop.children[ 2 ], false )
    this._showLetter( this._cntTop.children[ 5 ], false )
    this._showLetter( this._cntBotLeft.children[ 0 ], false )
    this._showLetter( this._cntBotRight.children[ 1 ] )
    this._showLetter( this._cntBotRight.children[ 1 ], false )
    this._showLetter( this._cntTop.children[ 0 ] )
    this._showLetter( this._cntBotLeft.children[ 1 ], false )
    this._showLetter( this._cntTop.children[ 3 ] )
  }

  _showLetter( letter, andIncrement = true ) {
    TweenLite.to( letter, .8, {
      delay: this._delay,
      alpha: 1,
      ease: Quart.easeInOut
    })
    if( andIncrement ) {
      this._delay += .1
    }
  }

  hide() {
    TweenLite.to( this, .8, {
      alpha: 0,
      ease: Cubic.easeInOut
    } )
  }

}

module.exports = Title
