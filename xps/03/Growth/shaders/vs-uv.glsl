
uniform float time;
uniform vec3 lightPosition;
uniform mat4 iModelMat;
uniform sampler2D t_audio;

varying vec3 vPos;
varying vec3 vNorm;
varying vec2 vUv;
varying vec3 vLight;
varying vec3 vMPos;
varying vec3 vCam;
varying float vLookup;

$simplex



float getV( vec2 uv ){
  return max( 0. ,  abs(uv.x * uv.x * uv.x) * .00013 + ((uv.x + uv.y)/100.+.5) * .4 + abs( uv.y * uv.y * uv.y) * .0001 );
}

float getS( vec2 uv ){

  float nuv = length(((uv.x + uv.y)/100.));
 return snoise( (uv  / 10.) * (2.-2.*nuv) + vec2(  time  * .1  , 0.));

}
float getHeight( vec2 uv ){

  float v = getV( uv );
  float lu = length( uv );
  vec4 a = texture2D( t_audio , vec2( lu / 100. , 0. ) );
  float s = getS( uv );

  return v + v *  length( a ) * (1. +  s) * .1;

}


float getHeight( vec2 uv  , out float lookup ){

  float v = getV( uv );
  float lu = length( uv );
  vec4 a = texture2D( t_audio , vec2( lu / 100. , 0. ) );
  float s =  getS( uv );

  lookup = (1. +  s) * .5;

  return v + v *  length( a ) * (1. +  s) * .1;

}

vec3 getPos( vec3 vPos , vec3 vNorm ){

  return vPos + vNorm * getHeight( vPos.xy );

}

vec3 getNorm(  vec3 vPos , vec3 vNorm ){

  vec3 eps = vec3( 0.1 , 0. , 0. );
  vec3 d = getPos( vPos - eps.xyy , vNorm );
  vec3 u = getPos( vPos + eps.xyy , vNorm );
  vec3 l = getPos( vPos - eps.yxy , vNorm );
  vec3 r = getPos( vPos + eps.yxy , vNorm );

  return normalize(cross( normalize( d - u ) , normalize( l  - r ) ));


}

void main(){

  vUv = uv;

  vPos = position;
  vLight = ( iModelMat * vec4( lightPosition , 1. ) ).xyz;

  //vNorm= normal;
  vNorm =  getNorm( position , normal );

  vLookup = 0.;//   .6 * snoise(  vPos * .05 + vec3( 0., 0. time * .01 ) ;

  float aVal = length( texture2D( t_audio , vec2( vLookup , 0. )));
 
  vCam   = ( iModelMat * vec4( cameraPosition , 1. ) ).xyz;


  vPos = vPos + normal * getHeight( position.xy , vLookup );

  //vPos += //vNorm * max( 0. , vPos.x * vPos.x * vPos.x * .001 + vPos.y * vPos.y * .01 );
  //vLight = ( iModelMat * vec4(  vec3( 400. , 1000. , 400. ) , 1. ) ).xyz;


  // Use this position to get the final position 
  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos , 1.);

}