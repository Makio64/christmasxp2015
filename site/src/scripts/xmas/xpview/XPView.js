const config = require( "xmas/core/config" )
const scrollEmul = require( "xmas/core/scrollEmul" )

class XPView {

  constructor() {
	this.transitioning = false
	this.currentXP = false
	this.html = false
	this.onNextClick = this.onNextClick.bind(this)
	this.onPrevClick = this.onPrevClick.bind(this)
	this.onLogoClick = this.onLogoClick.bind(this)
	this.direction = 'next'
  }

  show(day,title){
	  if(this.isActive)return
	  this.isActive = true
	  this.open(this.getID(day,title))
  }

  hide(cb){
	  this.isActive = false
	  this.transitioning = true
	  TweenMax.killTweensOf(this.mask)
	  if(!this.mask)
		this.createMask()
		var origin = "left top"
		if(this.direction == 'prev'){origin = "right top"}
	  	TweenMax.to(this.mask,.6,{scaleX:1,transformOrigin:origin,ease:Expo.easeOut,onComplete:()=>{
		  this.destroyXP()
		  cb()
		  origin = "right top"
		  if(this.direction == 'prev'){origin = "left top"}
		  TweenMax.to(this.mask,.6,{delay:.2,scaleX:0,transformOrigin:origin,ease:Expo.easeOut,onComplete:()=>{
			  this.transitioning = false
		  }})
	  }})
  }

  // XP MANAGEMENT
  getID(day,title){
	var data = config.data
	var days = data.days[parseInt(day)]
	for (var i = 0; i < days.length; i++) {
		var d = days[i]
		if(d.folder.replace( /\//gi, "" ) == title){
			this.xpDay = day
			return d.uid
		}
	}
  }

  getXP(id){
	 var days = config.data.days
	 for(var i = 1; i <= 24; i++) {
		 var day = days[i]
		 for (var j = 0; j < day.length; j++) {
	 		var d = day[j]
			if(d.uid == id){
			 	return d
			}
	 	}
	}
 }

 // XP MANAGEMENT
 getDay(id){
   var days = config.data.days
   for(var j = 1; j <= 24; j++) {
	   var day = days[j]
	   for (var i = 0; i < day.length; i++) {
		   var d = day[i]
		   if(d.uid == id){
			   return j
		   }
	   }
   }
 }
  open(id) {
	 this.xpIndex = id
	 var day = this.getDay(this.xpIndex)
	 if(day<10)day='0'+day
	 this.xpDay = day
	 this.xp = this.getXP(id)
	 this.xpTransitionIn()
  }

  prev(){
	this.direction = 'next'
  	this.xpIndex++
  	if(this.xpIndex >= config.data.totalXP)
  		this.xpIndex = 0
    this.open(this.xpIndex)
  }

  next(){
	this.direction = 'prev'
	this.xpIndex--
	if(this.xpIndex < 0){
	  this.xpIndex = config.data.totalXP-1
	}
	this.open(this.xpIndex)
  }

  xpTransitionIn(){
	  //TODO MASKOUT
	  if(this.transitioning)return
	  TweenMax.killTweensOf(this.mask)
	  this.transitioning = true
	  if(!this.mask)
	  	this.createMask()
		var origin = "left top"
		if(this.direction == 'prev'){origin = "right top"}
	  TweenMax.to(this.mask,.6,{scaleX:1,transformOrigin:origin,ease:Expo.easeOut,onComplete:()=>{
		  this.destroyXP()
		  scrollEmul.reset()
		  this.createIframe(this.xp)
		  origin = "right top"
		  if(this.direction == 'prev'){origin = "left top"}
		  TweenMax.to(this.mask,.6,{delay:.7,scaleX:0,transformOrigin:origin,ease:Expo.easeOut,onComplete:()=>{
			  this.transitioning = false
		  }})
	  }})
  }

  createMask(){
	  this.mask = document.createElement('div')
	  this.mask.className = 'mask'
	  document.body.appendChild(this.mask)
  }

  destroyXP(cb){
	  if(this.currentXP){
	  	// The iframe
		this.iframe.innerHTML = ""
		document.body.removeChild(this.iframe)
		this.iframe = null
		console.clear()
		this.logo.removeEventListener('click',this.onLogoClick)
		  this.logo.removeEventListener('touchStart',this.onLogoClick)
		  document.body.removeChild(this.logo)
		  this.logo = null

		  this.nextBtn.removeEventListener('click',this.onNextClick)
		  this.nextBtn.removeEventListener('touchStart',this.onNextClick)
		  document.body.removeChild(this.nextBtn)
		  this.nextBtn = null

		  this.prevBtn.removeEventListener('click',this.onPrevClick)
		  this.prevBtn.removeEventListener('touchStart',this.onPrevClick)
		  document.body.removeChild(this.prevBtn)
		  this.prevBtn = null

		  this.shareBtn.removeEventListener('click',this.onShareClick)
		  this.shareBtn.removeEventListener('touchStart',this.onShareClick)
		  document.body.removeChild(this.shareBtn)
		  this.shareBtn = null

		  document.body.removeChild(this.xpinfos)
		  this.xpinfos = null
		  this.currentXP = false
	}
	if(cb){
		cb()
	}
  }

  // CREATE IFRAME
  createIframe(xp){
  	this.currentXP = true

	// UI Elements
    this.logo = document.createElement('div')
    this.logo.id = 'logo'
	this.logo.addEventListener('click',this.onLogoClick)
	this.logo.addEventListener('touchStart',this.onLogoClick)
    document.body.appendChild(this.logo)

    this.nextBtn = document.createElement('div')
    this.nextBtn.id = 'next'
	this.nextBtn.addEventListener('click',this.onNextClick)
	this.nextBtn.addEventListener('touchStart',this.onNextClick)
    document.body.appendChild(this.nextBtn)

    this.prevBtn = document.createElement('div')
    this.prevBtn.id = 'prev'
	this.prevBtn.addEventListener('click',this.onPrevClick)
	this.prevBtn.addEventListener('touchStart',this.onPrevClick)
    document.body.appendChild(this.prevBtn)

    this.shareBtn = document.createElement('div')
    this.shareBtn.id = 'share'
	this.shareBtn.addEventListener('click',this.onShareClick)
	this.shareBtn.addEventListener('touchStart',this.onShareClick)
    document.body.appendChild(this.shareBtn)

    this.xpinfos = document.createElement('div')
    this.xpinfos.id = 'xpinfos'
	// this.author = document.createElement('div')
	// this.author.innerHTML = getXP().author
	// this.xpinfos.appendChild(author)
    document.body.appendChild(this.xpinfos)

	// The iframe
    this.iframe = document.createElement('iframe')
    this.iframe.src = xp.path.replace('./','/')
	this.iframe.className = 'xp'
    document.body.appendChild(this.iframe)
  }

  bindEvents() {
    // stage.on( "resize", this._binds.onResize )
    // this._onResize()
    // window.addEventListener( "mousewheel", this._binds.onMouseScroll, false )
    // loop.add( this._binds.onUpdate )
  }

  unbindEvents() {
    // stage.off( "resize", this._binds.onResize )
    // window.removeEventListener( "mousewheel", this._binds.onMouseScroll, false )
    // loop.remove( this._binds.onUpdate )
  }

  //FEEBACK USER
  onNextClick(){
	this.prev()
	var folder = this.xp.folder
	page('/xps/'+this.xpDay+folder)
  }

  onPrevClick(){
  	this.next()
	var folder = this.xp.folder
	page('/xps/'+this.xpDay+folder)
  }

  onLogoClick(){
	this.direction = 'next'
	page('/')
  }

  onShareClick(){
    //TODO Twitter

	//TODO Facebook

  }

  onAuthorOver(){
	//TODO CoolAnim to show his website / twitter / autre

  }

}

module.exports = XPView
module.exports.idXP = null
