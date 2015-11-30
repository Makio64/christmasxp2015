StageRenderer = require "core/StageRenderer"
SceneTraveler = require "core/scenes/SceneTraveler"
BorderLoader = require "ui/BorderLoader"

#---------------------------------------------------------- Class Loader

class Preloader

	@fakeLoad = (dt)=>
		@loaderBorder.setPercent(@loaderBorder.percent + 0.001*dt/16)

	@init = ()=>
		document.removeEventListener('DOMContentLoaded', Preloader.init)
		StageRenderer.onUpdate.add(SceneTraveler.update)
		StageRenderer.onResize.add(SceneTraveler.resize)

		l = document.createElement('div')
		l.className = 'loading'
		document.body.appendChild(l)

		@loaderBorder = new BorderLoader()
		@loaderBorder.setPercent(0)
		StageRenderer.onUpdate.add(Preloader.fakeLoad)

		SceneTraveler.isModule = false;

		require.ensure(['Main'], (require)=>
			StageRenderer.onUpdate.remove(@fakeLoad)

			test = (dt)=>
				if(dt>100) then return
				diff = (1.1 - @loaderBorder.percent)*0.06*dt/16
				diff = Math.min(0.03*dt/16,diff)
				@loaderBorder.setPercent(@loaderBorder.percent+diff)

				if(@loaderBorder.percent>=1.02)
					StageRenderer.onUpdate.remove(test)
					@loaderBorder.setPercent(1)
					@main = require('Main')
					@main.init(@onMainCreated)
			StageRenderer.onUpdate.add(test)
		)
		return

	@onMainCreated:()=>
		# console.log('mainCreated')
		loader = document.querySelector(".loading")
		loader.className += ' hideOut'
		@loaderBorder.hide(true)
		@main.start()
		@main = null
		return

	document.addEventListener('DOMContentLoaded', Preloader.init)

module.exports = Preloader
