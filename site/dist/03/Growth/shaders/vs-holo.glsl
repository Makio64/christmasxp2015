
uniform mat4 iModelMat;
uniform vec3 lightPosition;


varying vec3 vPos;
varying vec3 vLight;
varying vec3 vNorm;
varying vec3 vCam;

varying vec2 vUv;


void main(){

  vUv = uv;

  vPos = position;
  vNorm = normal;

  vCam   = ( iModelMat * vec4( cameraPosition , 1. ) ).xyz;
  vLight = ( iModelMat * vec4( lightPosition , 1. ) ).xyz;

  //vLight = ( iModelMat * vec4(  vec3( 400. , 1000. , 400. ) , 1. ) ).xyz;


  // Use this position to get the final position 
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position , 1.);

}