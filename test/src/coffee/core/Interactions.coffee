#
# Manage common interactions
# @author : David Ronai / @Makio64 / makiopolis.com
#

signals = require('signals')

class Interactions

	# TODO Enable multitouch
	@metaKey = false #apple/command
	@shiftKey = false
	@altKey = false
	@ctrlKey = false
	@mouseIsDown = false
	@onKeyDown = new signals()
	@onKeyUp = new signals()

	@onDown = new signals()
	@onUp = new signals()
	@onMove = new signals()
	@onClick = new signals()
	@onLeave = new signals()
	@onWheel = new signals()
	@onClose = new signals()

	@mouse = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		normalizedX: 0.5,
		normalizedY: 0.5,
		unitX: 0.0,
		unitY: 0.0,
		moveX: 0,
		moveY: 0
	}
	@prevMouse = {x: window.innerWidth / 2, y: window.innerHeight / 2}
	@move = {x: 0, y: 0}

	@isTouchDevice = "ontouchstart" of window || "onmsgesturechange" of window
	@getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia or navigator.oGetUserMedia

	@init: ()=>
		document.body.className='grabbable'

		# listen all
		window.addEventListener('mousedown', (e)=>
			document.body.className='grabbing'
			@mouseIsDown = true
			@onDown.dispatch(@getMouseValue(e))
		)
		window.addEventListener('mouseup', (e)=>
			document.body.className='grabbable'
			@mouseIsDown = false
			@onUp.dispatch(@getMouseValue(e))
		)
		window.addEventListener('mousemove', (e)=>
			@updatePrevMouse()
			@onMove.dispatch(@getMouseValue(e))
		)
		window.addEventListener('click', (e)=>
			@onClick.dispatch(@getMouseValue(e))
		)
		window.addEventListener('blur', (e)=>
			document.body.className='grabbable'
			@onLeave.dispatch()
			@mouseIsDown = false
		)
		window.addEventListener('mouseleave', (e)=>
			document.body.className='grabbable'
			@onLeave.dispatch()
			@mouseIsDown = false
		)
		window.addEventListener('mousewheel', (e)=>
			@onWheel.dispatch(@getDelta(e))
			e.stopPropagation()
			e.stopImmediatePropagation()
			e.preventDefault()
		)
		window.addEventListener('DOMMouseScroll', (e)=>
			@onWheel.dispatch(@getDelta(e))
			e.stopPropagation()
			e.stopImmediatePropagation()
			e.preventDefault()
		)
		window.addEventListener('keydown', (e)=>
			@metaKey = e.metaKey
			@shiftKey = e.shiftKey
			@altKey = e.altKey
			@ctrlKey = e.ctrlKey
			@onKeyDown.dispatch(e.which)
		)
		window.addEventListener('keyup', (e)=>
			@metaKey = e.metaKey
			@shiftKey = e.shiftKey
			@altKey = e.altKey
			@ctrlKey = e.ctrlKey
			@onKeyUp.dispatch(e.which)
		)
		window.addEventListener("beforeunload", (e)=>
			@onClose.dispatch(e)
		);
		if(@isTouchDevice)
			window.addEventListener('touchstart', (e)=>
				@mouseIsDown = true
				@onDown.dispatch(@getTouchValue(e))
			)
			window.addEventListener('touchend', (e)=>
				@mouseIsDown = false
				@onUp.dispatch(@getTouchValue(e))
			)
			window.addEventListener('touchmove', (e)=>
				@updatePrevMouse()
				@onMove.dispatch(@getTouchValue(e))
			)
			window.addEventListener('touchstart', (e)=>
				@mouseIsDown = true
				@onClick.dispatch(@getTouchValue(e))
			)

		return

	@getMouseValue: (e)=>
		tmpX = @mouse.x
		tmpY = @mouse.y
		@mouse.x = e.clientX || e.pageX
		@mouse.y = e.clientY || e.pageY
		@move.x = @mouse.x - tmpX
		@move.y = @mouse.y - tmpY
		@mouse.moveX = @move.x
		@mouse.moveY = @move.y
		@mouse.normalizedX = @mouse.x / window.innerWidth
		@mouse.normalizedY = @mouse.y / window.innerHeight
		@mouse.unitX = (@mouse.normalizedX - 0.5) * 2
		@mouse.unitY = (@mouse.normalizedY - 0.5) * 2
		return @mouse

	@getTouchValue: (e)=>
		touch = e.touches[0]
		if touch
			tmpX = @mouse.x
			tmpY = @mouse.y
			@mouse.x = touch.clientX
			@mouse.y = touch.clientY
			@move.x = @mouse.x - tmpX
			@move.y = @mouse.y - tmpY
			@mouse.moveX = @move.x
			@mouse.moveY = @move.y
			@mouse.normalizedX = @mouse.x / window.innerWidth
			@mouse.normalizedY = @mouse.y / window.innerHeight
			@mouse.unitX = (@mouse.normalizedX - 0.5) * 2
			@mouse.unitY = (@mouse.normalizedY - 0.5) * 2
		return @mouse

	@updatePrevMouse: ()=>
		@prevMouse.x = @mouse.x
		@prevMouse.y = @mouse.y
		return

	# http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
	@getDelta: (e)=>
		return if(e.detail < 0 || e.wheelDelta > 0) then 1 else -1

	@init()

module.exports = Interactions
