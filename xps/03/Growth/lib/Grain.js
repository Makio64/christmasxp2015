// All taken from 
// https://github.com/zya/granular/blob/gh-pages/js/main.js

function Grain( controller , buffer , output ){

  this.ctx = controller.ctx;
  this.buffer = buffer;
  this.output = output;

  this.attack   = .140 * .4;
  this.release  = .140 * 3.5;
  this.density  = .8;
  this.spread   = 1.3;
  this.trans    = 1.;
  this.timeSpread = 3;
  this.timeSpreadSpeed = .1;

  this.amp = 1.;

  this.baseOffset = .4;

}

Grain.prototype.setCycle = function( cycle ){

  this.attack = cycle  * .3 + .4

  this.release = cycle  * .3 + .4;

  this.baseOffset = cycle * .8 + .1;

  this.density = cycle * .2 + .4;

  this.trans = .6 - (1.-cycle) * .4;




}

Grain.prototype.grain = function( params ){

  var now = this.ctx.currentTime;

  var source = this.ctx.createBufferSource();
  source.playbackRate.value = source.playbackRate.value  * params.trans
  source.buffer = this.buffer;



  var gain = this.ctx.createGain();
  gain.connect( this.output );

  source.connect( gain );

  var offset = params.baseOffset * this.buffer.duration
  
  var randomOffset = Math.random() * this.spread - this.spread / 2;

  source.start( now , offset , params.attack + params.release)

  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime( this.amp , now + params.attack);
  gain.gain.linearRampToValueAtTime( 0 , now + (params.attack +  params.release) );

  // Garbage collection
  var that = {
    gain: gain
  };

  source.stop(now + params.attack + params.release + 0.1); 
  var tms = (params.attack + params.release) * 1000; //calculate the time in miliseconds
  setTimeout(function(){
    that.gain.disconnect();
  },tms + 200);

  return that;

}

Grain.prototype.playNote = function( params ){

  this.grains = [];
  this.graincount = 0;

  var that = this; //for scope issues 
  this.play = function(){
    //create new grain
    var g = that.grain( params );
    //push to the array
    that.grains[that.graincount] = g;
    that.graincount+=1;
        
    if(that.graincount > 20){
      that.graincount = 0;
    }
    //next interval

    this.dens = 1. - that.density; 
   // this.dens = p.map(density,1,0,0,1);
    this.interval = (this.dens * 500) + 70;
    //that.timeout = setTimeout( that.play , this.interval );
    
  }

  this.play();

}

Grain.prototype.hold = function(){



  this.grains = [];
  this.graincount = 0;

  var that = this; //for scope issues 
  this.play = function(){
    //create new grain
    var g = that.grain();
    //push to the array
    that.grains[that.graincount] = g;
    that.graincount+=1;
        
    if(that.graincount > 20){
      that.graincount = 0;
    }
    //next interval

    this.dens = 1. - that.density; 
   // this.dens = p.map(density,1,0,0,1);
    this.interval = (this.dens * 500) + 70;
    that.timeout = setTimeout( that.play , this.interval );
    
  }

  this.play();
  
}