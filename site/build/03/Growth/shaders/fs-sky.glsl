uniform float time;
uniform sampler2D t_audio;

uniform samplerCube cubeMap;

varying vec3 vPos;
//varying vec3 vCam;
varying vec3 vNorm;

varying vec3 vLight;

varying vec2 vUv;
varying float vLookup;

const float MAX_TRACE_DISTANCE = 10.;           // max trace distance
const float INTERSECTION_PRECISION = 0.001;        // precision of the intersection
const int NUM_OF_TRACE_STEPS = 200;
const float PI = 3.14159;

void main(){

  vec3 col;// = texture2D( t_audio , vec2(  vLookup  , 0. ) ).xyz;

  //col *= col * .1;

  col = vec3( 0. );
  vec3 lightDir =  vLight - vPos;

  float val;

  val = max( 0. , dot( normalize( lightDir )   , -vNorm ));

  col += vec3(  10. * val  / (length( lightDir ) * length(lightDir))) ;
  gl_FragColor = vec4( col , 1. );


}