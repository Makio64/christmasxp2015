function Grain(t,a,i){this.ctx=t.ctx,this.buffer=a,this.output=i,this.attack=.14*.4,this.release=.14*3.5,this.density=.8,this.spread=1.3,this.trans=1,this.timeSpread=3,this.timeSpreadSpeed=.1,this.amp=1,this.baseOffset=.4}Grain.prototype.setCycle=function(t){this.attack=.3*t+.4,this.release=.3*t+.4,this.baseOffset=.8*t+.1,this.density=.2*t+.4,this.trans=.6-.4*(1-t)},Grain.prototype.grain=function(t){var a=this.ctx.currentTime,i=this.ctx.createBufferSource();i.playbackRate.value=i.playbackRate.value*t.trans,i.buffer=this.buffer;var e=this.ctx.createGain();e.connect(this.output),i.connect(e);var n=t.baseOffset*this.buffer.duration;Math.random()*this.spread-this.spread/2;i.start(a,n,t.attack+t.release),e.gain.setValueAtTime(0,a),e.gain.linearRampToValueAtTime(this.amp,a+t.attack),e.gain.linearRampToValueAtTime(0,a+(t.attack+t.release));var s={gain:e};i.stop(a+t.attack+t.release+.1);var r=1e3*(t.attack+t.release);return setTimeout(function(){s.gain.disconnect()},r+200),s},Grain.prototype.playNote=function(t){this.grains=[],this.graincount=0;var a=this;this.play=function(){var i=a.grain(t);a.grains[a.graincount]=i,a.graincount+=1,a.graincount>20&&(a.graincount=0),this.dens=1-a.density,this.interval=500*this.dens+70},this.play()},Grain.prototype.hold=function(){this.grains=[],this.graincount=0;var t=this;this.play=function(){var a=t.grain();t.grains[t.graincount]=a,t.graincount+=1,t.graincount>20&&(t.graincount=0),this.dens=1-t.density,this.interval=500*this.dens+70,t.timeout=setTimeout(t.play,this.interval)},this.play()};