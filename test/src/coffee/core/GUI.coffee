#
# Instance of Dat.GUI
# @author : David Ronai / @Makio64 / makiopolis.com
#

gui = require('dat')

DEBUG = require('core/Constants').DEBUG

class GUI

	constructor:()->
		return

	@gui = new gui.GUI()
	@gui.domElement.parentNode.style.zIndex = 100
	if(!DEBUG)
		@gui.domElement.parentNode.style.visibility = 'hidden'

module.exports = GUI
