function BufferedAudio( buffer , ctx , output , looping){

  this.buffer = buffer;
  this.ctx = ctx;
  this.output = output;
  this.looping  = looping;

  this.playing = false;

  this.createSource();


}

BufferedAudio.prototype.createSource = function() {

  this.source = this.ctx.createBufferSource();
  this.source.buffer = this.buffer;
  this.source.loop = this.looping || false;

  this.source.connect( this.output )


};


BufferedAudio.prototype.play = function(){
  
    this.playing = true;

    this.source.start(0);

    // Recreates source for next time we play;
    this.createSource();

}

BufferedAudio.prototype.stop = function(){
  
  this.playing = false;

  this.source.stop();

}






