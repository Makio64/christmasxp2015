const config = require( "xmas/core/config" )
const scrollEmul = require( "xmas/core/scrollEmul" )

class XPView {

  constructor() {
	this.transitioning = false
	this.currentXP = false
	this.html = false
  }

  show(day,title){
	  this.open(this.getID(day,title))
  }

  hide(cb){
	  this.transitioning = true
	  TweenMax.killTweensOf(this.mask)
	  if(!this.mask)
		this.createMask()
	  TweenMax.to(this.mask,.6,{scaleX:1,transformOrigin:"left top",ease:Expo.easeOut,onComplete:()=>{
		  this.destroyXP()
		  cb()
		  TweenMax.to(this.mask,.6,{delay:.2,scaleX:0,transformOrigin:"right top",ease:Expo.easeOut,onComplete:()=>{
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

  open(id) {
	 this.xpIndex = id
	 this.xp = this.getXP(id)
	 this.xpTransitionIn()
  }

  prev(){
    this.xpIndex--
	if(this.xpIndex < 0){
	  this.xpIndex = config.data.totalXP-1
	}
	this.open(this.xpIndex)
  }

  next(){
	this.xpIndex++
	if(this.xpIndex >= config.data.totalXP)
		this.xpIndex = 0
    this.open(this.xpIndex)
  }

  xpTransitionIn(){
	  //TODO MASKOUT
	  if(this.transitioning)return
	  TweenMax.killTweensOf(this.mask)
	  this.transitioning = true
	  if(!this.mask)
	  	this.createMask()
	  TweenMax.to(this.mask,.6,{scaleX:1,transformOrigin:"left top",ease:Expo.easeOut,onComplete:()=>{
		  this.destroyXP()
		  scrollEmul.reset()
		  this.createIframe(this.xp)
		  TweenMax.to(this.mask,.6,{delay:.7,scaleX:0,transformOrigin:"right top",ease:Expo.easeOut,onComplete:()=>{
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
		document.body.removeChild(this.xpinfos)
		this.xpinfos = null
		this.currentXP = false
	}
	if(cb){
		cb()
	}
  }

  destroyHTML(){
	  this.html = false

	  this.logo.removeEventListener('click',this.onLogoClick)
	  this.logo.removeEventListener('touchStart',this.onLogoClick)
	  document.body.removeChild(this.logo)
	  this.logo = null

	  this.next.removeEventListener('click',this.onNextClick)
	  this.next.removeEventListener('touchStart',this.onNextClick)
	  document.body.removeChild(this.next)
	  this.next = null

	  this.prev.removeEventListener('click',this.onPrevClick)
	  this.prev.removeEventListener('touchStart',this.onPrevClick)
	  document.body.removeChild(this.prev)
	  this.prev = null

	  this.share.removeEventListener('click',this.onShareClick)
	  this.share.removeEventListener('touchStart',this.onShareClick)
	  document.body.removeChild(this.share)
	  this.share = null
	  document.body.removeChild(this.xpinfos)
	  this.xpinfos = null
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

    this.next = document.createElement('div')
    this.next.id = 'next'
	this.next.addEventListener('click',this.onNextClick)
	this.next.addEventListener('touchStart',this.onNextClick)
    document.body.appendChild(this.next)

    this.prev = document.createElement('div')
    this.prev.id = 'prev'
	this.prev.addEventListener('click',this.onPrevClick)
	this.prev.addEventListener('touchStart',this.onPrevClick)
    document.body.appendChild(this.prev)

    this.share = document.createElement('div')
    this.share.id = 'share'
	this.share.addEventListener('click',this.onShareClick)
	this.share.addEventListener('touchStart',this.onShareClick)
    document.body.appendChild(this.share)

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
  }

  onPrevClick(){
  	this.next()
  }

  onLogoClick(){
	this.disposeXP()
	// TODO RESTART ALL! Yukataaaaa
	this.close()
  }

  onShareClick(){
    //TODO Twitter
	//TODO Facebook
  }

  onAuthorOver(){
	//TODO CoolAnim to show his website / twitter / autre
  }

  close(){

  }
}

module.exports = XPView
module.exports.idXP = null
