##
# A Loader using the border of the screen
# By David Ronai / Makio64 / makiopolis.com
##

# TODO make the hide animation.

StageRenderer = require "core/StageRenderer"

class BorderLoader

	constructor:()->
		# Try with css, if too slow try with canvas
		# As its the first loader can't use tweenlite

		# Create Elements
		@top = document.createElement('div')
		@top.className = 'topBorder'
		document.body.appendChild(@top)
		@bottom = document.createElement('div')
		@bottom.className = 'bottomBorder'
		document.body.appendChild(@bottom)
		@right = document.createElement('div')
		@right.className = 'rightBorder'
		document.body.appendChild(@right)
		@left = document.createElement('div')
		@left.className = 'leftBorder'
		document.body.appendChild(@left)
		@percent = 0
		return

	setPercent:(value)->
		@percent = value
		v = Math.min(value*4, 1)
		@top.style.transform = 'scaleX('+v+')';
		v = Math.min(Math.max(0,value - 0.25)*4, 1);
		@right.style.transform = 'scaleY('+v+')';
		v = Math.min(Math.max(0,value - 0.5)*4, 1);
		@bottom.style.transform = 'scaleX('+v+')';
		v = Math.min(Math.max(0,value - 0.75)*4, 1);
		@left.style.transform = 'scaleY('+v+')';
		return

	hide:(autodispose = true)->
		@top.className += ' hide'
		@bottom.className += ' hide'
		@right.className += ' hide'
		@left.className += ' hide'
		@hide = 0
		StageRenderer.onUpdate.add(@hiding)
		return

	hiding:(dt)=>
		@hide += (1-@hide)*(0.08*dt/16)
		v = 1 - @hide
		v2 = @hide + 1
		if(v<0.01)
			v = 0.01
			StageRenderer.onUpdate.remove(@hiding)
			@dispose()

		@top.style.transform = 'scaleY('+v+') scaleX('+v2+')';
		@right.style.transform = 'scaleX('+v+')  scaleY('+v2+')';
		@bottom.style.transform = 'scaleY('+v+')  scaleX('+v2+')';
		@left.style.transform = 'scaleX('+v+') scaleY('+v2+')';

		return

	dispose:()=>
		document.body.removeChild(@top)
		document.body.removeChild(@bottom)
		document.body.removeChild(@left)
		document.body.removeChild(@right)
		return

module.exports = BorderLoader
