const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )

const Xmas = require( "xmas/Xmas" )
const Ui = require( "xmas/ui/Ui" )

stage.init()
pixi.init()

let ui = null

const loader = require( "loader" )
loader.on( "ready", () => {
  ui = new Ui()
  ui.showLoading()
})
loader.on( "complete", () => {
  const xmas = new Xmas()
  ui.hideLoading( xmas )

  // xmas.show( 1 )
})
loader.load()

loop.start()

document.getElementById( "main" ).appendChild( pixi.dom )

