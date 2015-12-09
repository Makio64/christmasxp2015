uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_audio;

uniform vec2  resolution;

uniform float dT;
uniform float time;
uniform vec3 centerPos;

$simplex
$curl



vec2 smoothU( vec2 d1, vec2 d2, float k)
{
    float a = d1.x;
    float b = d2.x;
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return vec2( mix(b, a, h) - k*h*(1.0-h), mix(d2.y, d1.y, pow(h, 2.0)));
}


vec2 map( in vec3 pos ){




  //pos.x = abs( pos.x );
  //pos.y = abs( pos.y );
  vec2 res = vec2( length( pos ) - 2.5 , 1.);
  //res = smoothU( res , vec2( length( pos - vec3( 3. * sin( time ) , 1. , 1. )) - 1.5 , 2. ) , .3 );

  //res = smoothU( res , vec2( length( pos - vec3( sin( time * 3.) , -1. , 1. )) - 1.5 , 2. ) , .3 );
  return res;

}

// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ){
    
  vec3 eps = vec3( 0.01, 0.0, 0.0 );
  vec3 nor = vec3(
      map(pos+eps.xyy).x - map(pos-eps.xyy).x,
      map(pos+eps.yxy).x - map(pos-eps.yxy).x,
      map(pos+eps.yyx).x - map(pos-eps.yyx).x );
  return normalize(nor);

}

void main(){

  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  vec3 vel = pos.xyz - oPos.xyz;

  vec3 force = vec3( 0. );




  if( pos.y > 60. ){
    vel = vec3( 0. );
    pos.y = 60.;
  }
  /*float dist = map( pos.xyz ).x;
  force -= calcNormal( pos.xyz )  * dist;

  vec3 r = vec3( sin( time * 141414. * sin( pos.x * 100000.) ), sin( time * 151114. * sin( pos.x * 570.) ), sin( time * 75314. * sin( pos.x * 451000.) ));

  pos.xyz += normalize( r ) * .003 ;*/


  vec3 curl = curlNoise( pos.xyz * .1 );
  force -= .4 * curl;

  force -= vec3( 0. , .2 , 0. );

  vec4 aVal = texture2D(t_audio, vec2( uv.x , 0.));

  vel *= .8 ;

  vel += ( force ) * length( aVal ) * dT; //+ curl * .001;//force * dT;

  vec3 p = pos.xyz + vel;

  if( pos.y < 0. ){

    p.y = 61.;

  }


  gl_FragColor = vec4( p , p.y );


}
