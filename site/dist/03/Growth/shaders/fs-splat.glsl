uniform sampler2D t_audio;

varying vec3 vPos;
varying float vDist;
varying float lookup;


vec4 vAudio;

void main(){


  float rad = length( gl_PointCoord - .5 );
  if( rad > .5 ){ discard; }
  vec4 col = texture2D( t_audio , vec2( rad * .3 + lookup * .7 , 0. ) );
 
  gl_FragColor = vec4( vec3( 1. ) - col.xyz  , clamp( abs( rad - .5) * 1. , 0. , 1. ));

}