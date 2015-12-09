uniform float time;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec2 vUv;


const float STEP_SIZE = .05;

#define STEPS 3

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


vec3 hsv(float h, float s, float v){
        return mix( vec3( 1.0 ), clamp(( abs( fract(h + vec3( 3.0, 2.0, 1.0 ) / 3.0 )
                   * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
      }






void main(){

  vec3 ro = vPos;
  vec3 rd = normalize( vPos - vCam );

  float hit = 0.;

  vec3 p = vec3( 0. );

  vec3 col = vec3( 0. );

  float luneVal = 0.;

  for( int i  = 0; i < STEPS; i++ ){

    p = ro + rd * float( i ) * STEP_SIZE;

    float val = triNoise3D( 2. *p  + vec3( float(i) * 200. , 1.3 , 1.3  )  , .3 ); //length( vec3( sin( p.x * 100. ) , sin( p.y * 100. ) , sin( p.z  * 100. )) );


    if( val > .3 ){
      hit +=  clamp( ( val - .3) * 50. , 0. ,1. ); //float( STEPS ) / float( i * 10 + 1 );
      //if( hit > 1.){ break; }
      col += (1.-hit);//   hsv( val * 7.+ float( i ) * .4 , 1. , 1.);
      break;

    }


  }

  //vec3 col = vec3( 2. - length( texture2D( t_iri , vUv * 4. - vec2( 1.5 ) ) ));

  //vec3 col = vec3( hit );

  //col = vCam * .5 + .5;


  gl_FragColor = vec4( col , 1. );

}