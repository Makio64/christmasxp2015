#
# Wrapper for requestAnimationFrame, Resize, etc..
# @author : David Ronai / @Makio64 / makiopolis.com
#

Signal 	= require("signals")

#---------------------------------------------------------- Class StageRenderer

class StageRenderer

	@dt 			= 0
	@lastTime 		= 0
	@pause 			= false

	@onResize 	= new Signal()
	@onUpdate 	= new Signal()
	@onBlur 	= new Signal()
	@onFocus 	= new Signal()

	@init:()->
		@pause = false

		window.onresize = ()=>
			width 	= window.innerWidth
			height 	= window.innerHeight
			@onResize.dispatch()
			return

		@lastTime = Date.now()

		requestAnimationFrame( @update )

		return

	@update:()=>
		t = Date.now()
		dt = t - @lastTime
		@lastTime = t

		if @pause then return

		# update logic here
		@onUpdate.dispatch(dt)

		# render frame
		requestAnimationFrame( @update )
		return

	@init()

module.exports = StageRenderer
