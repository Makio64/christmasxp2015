#
# Stage2d for pixi.js with every basics you need
# @author David Ronai / Makiopolis.com / @Makio64
#

StageRenderer = require('core/StageRenderer')

class Stage2d

	@stage 			= null
	@renderer		= null
	@isInit 		= false
	@isActivated	= false

	@init:(@options = {})->

		if(@isInit)
			@activate(@options)
			return

		@isInit = true
		PIXI.utils._saidHello = true;
		console.log('PIXI',PIXI.VERSION)

		@renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, @options)
		@stage = new PIXI.Container()
		@renderer.view.className = 'pixi'
		@activate()

		return

	@activate:()=>
		if(@isActivated)
			@redrawBackground()
			return
		@isActivated = true
		@background = new PIXI.Graphics()
		@redrawBackground()
		document.body.appendChild( @renderer.view )
		StageRenderer.onUpdate.add(@render)
		StageRenderer.onResize.add(@resize)
		@stage.addChild(@background)
		@render()
		return

	@desactivate:()=>
		if(!@isActivated)
			return
		@isActivated = false
		@renderer.view.parentNode.removeChild(@renderer.view)
		@stage.removeChild(@background)
		@background = null
		StageRenderer.onUpdate.remove(@render)
		StageRenderer.onResize.remove(@resize)
		return

	@redrawBackground:()=>
		if @background
			@background.clear()
			if(@options.transparent)
				return
			@background.beginFill(@options.background,1)
			@background.drawRect(0,0,window.innerWidth,window.innerHeight)
			@background.endFill()
		return

	@addChild:(o)=>
		@stage.addChild(o)
		return

	@removeChild:(o)=>
		@stage.removeChild(o)
		return

	@render:()=>
		@renderer.render( @stage )
		return

	@resize:()=>
		if @renderer
			@renderer.resize( window.innerWidth, window.innerHeight )
			@redrawBackground()
			@render()

		return

module.exports = Stage2d
