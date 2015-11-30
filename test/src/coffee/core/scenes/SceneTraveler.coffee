#
# Manage transition betweenScene
#
# @usage SceneTraveler.to( new Scene() )
# @author David Ronai / Makiopolis.com / @Makio64
#

class SceneTraveler

	@currentScene 	= null
	@nextScene		= null
	@isInit 		= false
	@isModule		= true

	@init = ()=>
		@isInit = true
		return

	@to = (scene)=>
		@nextScene = scene
		if @currentScene
			@currentScene.transitionOut()
		else
			@onTransitionOutComplete()
		return

	@update = (dt)=>
		if @currentScene
			@currentScene.update(dt)
		return

	@onTransitionOutComplete = ()=>
		@currentScene = @nextScene
		console.log('travel to :',@currentScene.name)
		@currentScene.transitionIn()
		return


	@resize = ()=>
		if @currentScene
			@currentScene.resize()
		if @nextScene
			@nextScene.resize()
		return

module.exports = SceneTraveler
