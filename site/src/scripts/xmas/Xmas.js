const XPView = require( "xmas/xpview/XPView" )
const scrollEmul = require( "xmas/core/scrollEmul" )
const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const loader = require( "loader" )
let cookie = require( "xmas/utils/cookie" )
let pixi = null
let Home = null
let About = null
let Ui = null
let Storyline = null
let loaderPixi = null

class Xmas {

	constructor() {
		this.current = null
		this.home = null
		this.xp = null
		this.status = "notLoaded"

		this.onChange = this.onChange.bind( this )
		this.onHome = this.onHome.bind( this )
		this.onIntro = this.onIntro.bind( this )
		this.onAbout = this.onAbout.bind( this )
		this.onXP = this.onXP.bind( this )
		this.onStart = this.onStart.bind( this )
		this.goFullScreen = this.goFullScreen.bind( this )

		page( "/home", this.onChange, this.onHome )
		page( "/about", this.onChange, this.onAbout )
		page( "/xps/:day/:name/", this.onXP )
		page( "/", this.onStart )
		page()
		stage.init()
		document.addEventListener('touchstart', this.goFullScreen, true);
	}

	goFullScreen(){
		let doc = window.document;
		let docEl = doc.documentElement;
		let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement){
			requestFullScreen.call(docEl)
		}
	}

	onChange( ctx, next ) {
		if( this.current ) {
		this.current.unbindEvents()
		this.current.hide( next )
		} else {
			next()
		}
	}

	onXP(e) {
		if(!this.xp){
			if(this.status=="notLoaded"){
				loader.loadConfig(()=>{
					this.xp = new XPView()
					this.current = this.xp
					this.current.bindEvents()
					this.current.show(e.params.day,e.params.name)
				})
				return
			} else {
				this.xp = new XPView()
			}
		}
		if(pixi!=null){
			pixi.pause = true
		}
		this.current = this.xp
		this.current.bindEvents()
		this.current.show(e.params.day,e.params.name)
	}

	onStart(){
		if(pixi!=null){
			pixi.pause = false
		}else {
			this.loadPixi(this.onStart)
			return
		}
		if(cookie.getCookie("intro") == ""){
			cookie.createCookie("intro", Date.now(), 1)
			this.onIntro()
		}else{
			this.onHome()
		}
	}

	onIntro(){
		if(pixi!=null){
			pixi.pause = false
		}else {
			this.loadPixi(this.onIntro)
			return
		}
		if(this.status!="loaded"){
			this.init(this.onIntro)
		return
			}
		var storyline = new Storyline()
		storyline.x = window.innerWidth/2-200
		storyline.y = window.innerHeight/2
		storyline.show( .6 )
		storyline.hide( 2.7 )
		pixi.stage.addChild( storyline )
		TweenMax.set( this, { delay: 3.4,onComplete: () => {page("/home")}})
	}

	onHome() {
		if(pixi!=null){
			pixi.pause = false
		}else {
			this.loadPixi(this.onHome)
			return
		}
		if(this.status!="loaded"){
			this.init(this.onHome)
		} else {
			if(!this.home)
				this.home = new Home()
			this.current = this.home
				this.displayCurrent()
		}
	}

	onAbout() {
		if(pixi!=null){
			pixi.pause = false
		}else {
			this.loadPixi(this.onAbout)
			return
		}

		if(this.status!="loaded"){
			this.init(this.onAbout)
		} else {
			if(!this.about)
				this.about = new About()
			this.current = this.about
			this.displayCurrent()
		}
	}

	displayCurrent() {
		this.current.bindEvents()
		this.current.show()
	}

	init(cb){
		if(this.status == "loading") {
			return
		} else if(this.status=="loaded") {
			cb()
			return
		}

		if(pixi!=null){
			pixi.init()
		} else {
			this.loadPixi(this.init)
			return
		}

		this.status = "loading"

		let ui = null
		loaderPixi.on( "ready", () => {
			ui = new Ui()
			ui.bindEvents()
			ui.showLoading()
		})
		loaderPixi.on( "complete", () => {
			this.status = "loaded"
			ui.hideLoading()
			ui.showBts()
		})
		loaderPixi.load()
		loop.start()
		scrollEmul.bindElements()
		scrollEmul.bindEvents()
	}

	loadPixi(cb){
		require.ensure(['fz/core/pixi',"xmas/home/Home","xmas/about/About", "xmas/ui/Ui","xmas/ui/Storyline","loaderPixi"], (require)=>{
			pixi = require('fz/core/pixi')
			Home = require('xmas/home/Home')
			About = require('xmas/about/About')
			Ui = require('xmas/ui/Ui')
			Storyline = require('xmas/ui/Storyline')
			loaderPixi = require('loaderPixi')
			cb()
		})
	}

}

module.exports = Xmas
