const config = require( "xmas/core/config" )

class XPView {

  constructor() {
	this.transitioning = false
	this.currentXP = false
	this.html = false

	// HTML Mask
	// this.mask = document.createElement('div')
    // this.mask.className = "mask_xp"
	// this.mask.style.color = "#0000FF"
    // document.body.appendChild(mask)
  }

  // XP MANAGEMENT
  getXP(id){
	 data = config.data
	 for (var day in data.days) {
		 for (var i = 0; i < day.length; i++) {
		 	if(day[i].id==id)
				return day[i]
		 }
	 }
	 return null
	 throw Console.warning('Cant find:'+id)
  }

  open(id) {
	 this.xpIndex = id
	 this.xp = this.getXP(id)
	 if(this.currentXP)
	 	this.xpTransitionOut()
	else
		this.xpTransitionOutComplete()
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
	  this.transitioning = true
	  TweenMax.to(this.mask,.6,{scaleX:1,ease:Expo.easeOut})
	  this.destroyXP()
	  this.createIframe(this.xp.url)
	  TweenMax.to(this.mask,.6,{scaleX:0,ease:Expo.easeOut})
  }

  destroyXP(){
	  if(this.currentXP){
	  	// The iframe
		this.iframe = document.createElement('iframe')
		this.iframe.src = encodeURI(url)
		document.body.removeChild(this.iframe)
		document.body.removeChild(this.xpinfos)
		this.xpinfos = null
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
  createIframe(url){
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
    this.iframe.src = encodeURI(url)
    document.body.appendChild(this.iframe)
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
