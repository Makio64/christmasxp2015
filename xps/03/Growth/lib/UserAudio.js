function UserAudio( ctx , output ){

  this.ctx = ctx;
  this.output = output;

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var constraints = {
    audio: true,
  };

  navigator.getUserMedia( constraints , this._successCallback.bind( this ) , this._errorCallback.bind( this ) );

}

UserAudio.prototype._successCallback = function( stream ){

  this.source = this.ctx.createMediaStreamSource( stream );

  this.source.connect( this.output );

  this.successCallback();
}

UserAudio.prototype._errorCallback = function(){

  console.log( 'User Media Failed. BOOOOOO!' );

  this.errorCallback();

}

UserAudio.prototype.successCallback = function(){}
UserAudio.prototype.errorCallback = function(){}
