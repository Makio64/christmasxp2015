function AudioController(){this.ctx=new AudioContext,this.mute=this.ctx.createGain(),this.analyser=this.ctx.createAnalyser(),this.gain=this.ctx.createGain(),this.gain.connect(this.analyser),this.analyser.connect(this.mute),this.mute.connect(this.ctx.destination),this.analyser.frequencyBinCount=1024,this.analyser.array=new Uint8Array(this.analyser.frequencyBinCount);var t=this.processAudioController();this.texture=new THREE.DataTexture(t,t.length/16,1,THREE.RGBAFormat,THREE.FloatType),this.texture.needsUpdate=!0}AudioController.prototype.update=function(){this.analyser.getByteFrequencyData(this.analyser.array),this.audioData=this.processAudioController(),this.texture.image.data=this.processAudioController(),this.texture.needsUpdate=!0},AudioController.prototype.processAudioController=function(){for(var t=this.analyser.frequencyBinCount,e=new Float32Array(t),r=0;t>r;r+=4)e[r+0]=this.analyser.array[r/4+0]/256,e[r+1]=this.analyser.array[r/4+1]/256,e[r+2]=this.analyser.array[r/4+2]/256,e[r+3]=this.analyser.array[r/4+3]/256;return e};