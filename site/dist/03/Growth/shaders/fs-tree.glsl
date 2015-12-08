uniform float time;
uniform sampler2D t_audio;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec3 vLight;

varying vec2 vUv;



const float MAX_TRACE_DISTANCE = 10.;           // max trace distance
const float INTERSECTION_PRECISION = 0.001;        // precision of the intersection
const int NUM_OF_TRACE_STEPS = 20;



// Taken from https://www.shadertoy.com/view/4ts3z2
float tri(in float x){return abs(fract(x)-.5);}
vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}
                                 

// Taken from https://www.shadertoy.com/view/4ts3z2
float triNoise3D(in vec3 p, in float spd)
{
    float z=1.4;
  float rz = 0.;
    vec3 bp = p;
  for (float i=0.; i<=3.; i++ )
  {
        vec3 dg = tri3(bp*2.);
        p += (dg+time*.1*spd);

        bp *= 1.8;
    z *= 1.5;
    p *= 1.2;
        //p.xz*= m2;
        
        rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
        bp += 0.14;
  }
  return rz;
}


vec3 depthCol( vec3 ro , vec3 rd ){

  vec3 p = ro;
  float v;
  vec3 col = vec3( 0. );
  for( int i = 0; i< 10; i++ ){

    p += rd * 2.;

    v = triNoise3D( p * .4 , 0.1 );

    if( v > .3){
      //col = vec3( float( i) / 10. );
      col =1. * vec3(float( i) / 10.);// + texture2D( t_audio , vec2( (float( i) / 10.) + (v -.4 ), 0. )).xyz;
      break;
    }

  }

  return col;

}

void main(){

  vec3 ro = vPos;
  vec3 rd = normalize( vPos - vCam );

  vec3 lightDir = normalize( vLight - ro);



  vec3 reflDir = reflect( lightDir , vNorm );

  float lamb = max( dot( vNorm , lightDir), 0.);
  float spec = max( dot( reflDir , rd ), 0.);

  vec3 col = vec3( 1. );

  vec3 aCol = texture2D( t_audio , vec2(vUv.y, 0. )).xyz;
  col = depthCol( ro , rd );//aCol;

  col = mix( vec3( lamb  )  , col , lamb );
  //col = vec3( vUv.x , 0. , vUv.y );

  gl_FragColor = vec4( col , 1. );


}