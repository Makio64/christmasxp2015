function AudioBuffer( ctx , file ){

  this.loadingEvents  = [];
  this.loadEvents     = [];
  this.percentLoaded  = 0;

  var request = new XMLHttpRequest();
  request.open( "GET" , file , true );
  request.responseType = "arraybuffer" ;
 
  var self = this;
  request.onerror = function(){
    alert( 'ERROR LOADING SONG' );
  }

  request.onprogress = this.loadProgress.bind( this );
  
  var self = this;

  this.ctx = ctx;
  this.file = file;

  
  request.onload = function(){


    self.ctx.decodeAudioData( request.response , function( buffer ){

      if(!buffer){
        alert('error decoding file data: '+ url );
        return;
      }
      self.buffer = buffer;
      self.load();

    })
  },

  request.send();
  
}

AudioBuffer.prototype.loadProgress = function( e ){

  this.percentLoaded = e.loaded / e.total;

  for( var i = 0; i < this.loadingEvents.length; i++ ){
    this.loadingEvents[i]( this.percentLoaded );
  }

}

AudioBuffer.prototype.load = function(){

  for( var i = 0; i < this.loadEvents.length; i++ ){
    this.loadEvents[i]();
  }

}

AudioBuffer.prototype.addLoadingEvent = function( e ){
  this.loadingEvents.push( e );
}

AudioBuffer.prototype.addLoadEvent = function( e ){
  this.loadEvents.push( e );
}

