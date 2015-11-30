#
# Usefull Constants
# @author : David Ronai / @Makio64 / makiopolis.com
#

class Constants

	@PI2 = Math.PI*2

	@M2PI = 2/Math.PI
	@M4PI = 4/Math.PI
	@M8PI = 8/Math.PI

	@RAD2DEGREE = 180 / Math.PI
	@DEGREE2RAD = Math.PI / 180
	@SQRT2 = Math.sqrt(2)

	@DEBUG = true

	@ZERO = new THREE.Vector3(0)

	constructor:()->
		console.warning('Dude... there is no interest to instanciate Constants, use static variable only')
		return

module.exports = Constants
