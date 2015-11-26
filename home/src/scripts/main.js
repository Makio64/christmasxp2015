const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const engine = require( "core/engine" )
const Scene = require( "iao/Scene" )

stage.init()
engine.init()

const loader = new ( require( "xmas/Loader" ) )()
loader.on( "complete", () => {
  const xmas = new Xmas()
  xmas.bindEvents()
  engine.stage.addChild( xmas )
})
loader.load()
loop.start()

document.getElementById( "main" ).appendChild( engine.dom )

