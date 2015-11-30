#
# Abstract Scene
# @author David Ronai / Makiopolis.com / @Makio64
#

SceneTraveler = require('./SceneTraveler')

class Scene

	constructor:(@name)->
		@states = []
		@startTime = 0
		@lastTimeCheck = -1
		return

	initState:()->
		o = {}
		for key, value of @
			if(typeof(value)!=constructor && typeof(value)!='function' && key!='states' && key!='startTime' && key!='name' && key!='lastTimeCheck')
				o[key] = value
		@changeStateAt(0,o)

		return

	# State system
	changeStateAfter:(delay, params)->
		delay *= 1000
		if(@states.length == 0)
			lastTime = 0
		else
			lastTime = @states[@states.length-1].time
		@changeStateAt((lastTime+delay)/1000, params)
		return

	changeStateAt:(time, params)->
		time *= 1000
		@states.push(time:time, params:params)
		@states.sort((a,b)->
			return a.time-b.time
		)
		return

	updateState:(time)->
		limit = time - @startTime

		if(limit < @lastTimeCheck)
			@lastTimeCheck = -1

		k = 0
		for state in @states

			if(state.time>limit)
				@lastTimeCheck = limit
				break

			if(state.time <= limit && state.time > @lastTimeCheck)
				for key, value of state.params
					if(typeof(value)=='function')
						value()
					else
						@[key] = value

			k++
		@lastTimeCheck = limit
		return

	# Scene classic

	update:(dt)->
		return

	transitionIn:()->
		@onTransitionInComplete()
		return

	transitionOut:()->
		@onTransitionOutComplete()
		return

	onTransitionInComplete:()->
		return

	onTransitionOutComplete:()->
		# Dont dispose scene for this XP
		@dispose()
		SceneTraveler.onTransitionOutComplete()
		return

	# Maybe it should not be there
	resize:()->
		return

	dispose:()->
		return

module.exports = Scene
