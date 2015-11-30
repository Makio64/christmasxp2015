# Utility class to manage pool of objects

class ObjectPool

	constructor: (@create, @minSize, @maxSize) ->

		@list = []
		for [0...@minSize]
			@add()
		return


	add: () ->
		return @list.push @create()


	checkOut: () ->

		if @list.length == 0
			return @create()
		else
			return @list.pop()


	checkIn: (item) ->

		if @list.length < @maxSize
			@list.push item

		return

module.exports = ObjectPool
