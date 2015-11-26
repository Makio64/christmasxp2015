const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )

const Xmas = require( "xmas/Xmas" )

stage.init()
pixi.init()

const loader = require( "loader" )
loader.on( "complete", () => {
  const xmas = new Xmas()
  xmas.bindEvents()
})
loader.load()

loop.start()

document.getElementById( "main" ).appendChild( pixi.dom )

