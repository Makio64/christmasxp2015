class BaseEntry extends PIXI.Container {

  constructor() {
    super()

    this._w = 139
    this._h = 160
    this._countMaskPoints = 6

    this._msk = new PIXI.Graphics()
    this._msk.x = this._w >> 1
    this._msk.y = this._h >> 1
    this._msk.rotation = Math.PI / 6
    this.addChild( this._msk )

    this._updateMsk()

    this.mask = this._msk
  }

  _updateMsk() {
    this._msk.clear()

    this._msk.beginFill( 0xff00ff )
    this._drawPolyMask()
  }

  _drawPolyMask() {
    let a = 0
    let xLast = 0
    let yLast = 0
    let x = 0
    let y = 0
    let rad = this._h >> 1

    const aAdd = 2 * Math.PI / this._countMaskPoints
    for( let i = 0; i < this._countMaskPoints; i++ ) {
      x = Math.cos( a ) * rad >> 0
      y = Math.sin( a ) * rad >> 0

      if( i != 0 ) {
        this._msk.lineTo( x, y )
      } else { 
        this._msk.moveTo( x, y )
      }

      xLast = x
      yLast = y

      a += aAdd
    }
  }

}

module.exports = BaseEntry
