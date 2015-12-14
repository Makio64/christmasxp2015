function Stream( file , ctx , output ){


  this.audio = new Audio();

  this.file = file;
  this.ctx = ctx;
  this.output = output;

  this.audio.src = this.file;
 
  this.source = this.ctx.createMediaElementSource( this.audio );
  this.source.connect( this.output );

}

Stream.prototype.play = function(){

  this.audio.play();

}

