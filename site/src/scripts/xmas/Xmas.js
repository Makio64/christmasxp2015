const Home = require( "xmas/home/Home" )
const About = require( "xmas/about/About" )
const XPView = require( "xmas/xpview/XPView" )
const Ui = require( "xmas/ui/Ui" )
const scrollEmul = require( "xmas/core/scrollEmul" )

const loop = require( "fz/core/loop" )
const stage = require( "fz/core/stage" )
const pixi = require( "fz/core/pixi" )
const Storyline = require( "xmas/ui/Storyline" )
const cookie = require( "xmas/utils/cookie" )
const loader = require( "loader" )

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

		page( "/home", this.onChange, this.onHome )
		page( "/about", this.onChange, this.onAbout )
		page( "/xps/:day/:name/", this.onXP )
		page( "/", this.onStart )
		page()
	}

	onStart(){
		pixi.pause = false
		if(cookie.getCookie("intro") == ""){
			cookie.createCookie("intro", Date.now(), 1)
			this.onIntro()
		}else{
			this.onHome()
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

	onIntro(){
		pixi.pause = false
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
		TweenLite.set( this, { delay: 3.4,onComplete: () => {page("/home")}})
	}

	onHome() {
		pixi.pause = false
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
		pixi.pause = false
		if(this.status!="loaded"){
			this.init(this.onAbout)
		} else {
			if(!this.about)
				this.about = new About()
			this.current = this.about
			this.displayCurrent()
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
		pixi.pause = true
		this.current = this.xp
		this.current.bindEvents()
		this.current.show(e.params.day,e.params.name)
	}

	displayCurrent() {
		this.current.bindEvents()
		this.current.show()
	}

	init(cb){
		if(this.status == "loading"){
			return
		}else if(this.status=="loaded"){
			cb()
			return
		}

		this.status = "loading"
		stage.init()
		pixi.init()

		let ui = null
		loader.on( "ready", () => {
			ui = new Ui()
			ui.bindEvents()
			ui.showLoading()
		})
		loader.on( "complete", () => {
			this.status = "loaded"
			ui.hideLoading()
			ui.showBts()
		})
		loader.load()
		loop.start()
			scrollEmul.bindElements()
			scrollEmul.bindEvents()
		document.getElementById( "main" ).appendChild( pixi.dom )
	}

}

module.exports = Xmas
