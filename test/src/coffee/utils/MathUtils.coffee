class MathUtils

	constructor:()->
		return

	@nextPowerTwo:(value)->
		power = 0
		while(value > Math.pow(2,power))
			power++
		return Math.pow(2,power)

	@smoothstep:(min, max, value)->
		x = Math.max(0, Math.min(1, (value-min)/(max-min)))
		return x*x*(3 - 2*x)

	@distance:(p,p2)->
		dx = p.x-p2.x
		dy = p.y-p2.y
		return dx*dx+dy*dy

	@distanceSqrt:(p,p2)->
		dx = p.x-p2.x
		dy = p.y-p2.y
		return Math.sqrt(dx*dx+dy*dy)


module.exports = MathUtils
