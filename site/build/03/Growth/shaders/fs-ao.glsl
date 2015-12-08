uniform float time;

uniform float parameter1;
uniform float parameter2;
uniform float parameter3;
uniform float parameter4;
uniform float parameter5;
uniform float parameter6;

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


vec3 hsv(float h, float s, float v){
        return mix( vec3( 1.0 ), clamp(( abs( fract(h + vec3( 3.0, 2.0, 1.0 ) / 3.0 )
                   * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
      }



vec2 opU( vec2 d1, vec2 d2 )
{
    return  d1.x < d2.x ? d1 : d2 ;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}


float udRoundBox( vec3 p, vec3 b, float r )
{
  return length(max(abs(p)-b,0.0))-r;
}


float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float opRepSphere( vec3 p, vec3 c , float r)
{
    vec3 q = mod(p,c)-0.5*c;
    return sdSphere( q  , r );
}


float opRepBox( vec3 p, vec3 c , float r)
{
    vec3 q = mod(p,c)-0.5*c;
    return udBox( q  ,vec3( r ));
}


// Using SDF from IQ's two tweet shadertoy : 
// https://www.shadertoy.com/view/MsfGzM
float sdBlob( vec3 p ){

  return length(
    .05 * cos( 9. * (sin( parameter1 )+ 1.) * p.y * p.x )
    + cos(p) * (sin( parameter2 ) * .01 + 1.) 
    -.1 * cos( 9. * ( p.z + .3 * (sin(parameter3) + 1.)   * p.x - p.y * (sin( parameter4 )+ 1.)   ) ) )
    -1.; 

}

float cubeField( vec3 p ){

  float fieldSize = 1.  + abs( sin( parameter5) ) * 1.;
  return opRepBox( p , vec3(fieldSize ), .01 + parameter4 * .05  );

}

float sphereField( vec3 p ){

  float fieldSize = 1.  + abs( sin( parameter5) ) * 1.;
  return opRepSphere( p , vec3(fieldSize ), .01 + parameter4 * .05 );

}

float sdBlob2( vec3 p ){
 
  vec3 pos = p;

  return length( p ) - .2 + .3 * .2 * sin( parameter4 )*sin(300.0 * sin(parameter1 ) *pos.x * sin( length(pos) ))*sin(200.0*sin( parameter2 ) *pos.y )*sin(50.0 * sin( parameter3 * 4. )*pos.z);

}

//--------------------------------
// Modelling 
//--------------------------------
vec2 map( vec3 pos ){  
   
    // using super thin cube as plane
    vec3 size = vec3( 1.  , 1. , .01 );
   // vec3 rot = vec3( iGlobalTime * .1 , iGlobalTime * .4 , -iGlobalTime * .3 );
    vec3 rot = vec3( 0.,0.,0. );
   // vec2 res = vec2( rotatedBox( pos , rot , size , .001 ) , 1.0 );
    
    float repSize = ( parameter1 * .4 + .4) * 2.;
    repSize = 2.;

    float radius = .4 * parameter2  + .1;

    radius = .01;

   // vec2 res = vec2( opRepSphere( pos , vec3( repSize ) , radius ) , 1. );
    //vec2 res = vec2( sdSphere( pos ,  radius ) , 1. );
    vec2 res = vec2( sdBlob2( pos ) , 1. );

    //res = opU( res , vec2( sphereField( pos ) , 2. ));
    return res;
    
}


vec2 calcIntersection( in vec3 ro, in vec3 rd ){

    
    float h =  INTERSECTION_PRECISION*2.0;
    float t = 0.0;
    float res = -1.0;
    float id = -1.;
    
    for( int i=0; i< NUM_OF_TRACE_STEPS ; i++ ){
        
        if( h < INTERSECTION_PRECISION || t > MAX_TRACE_DISTANCE ) break;
      vec2 m = map( ro+rd*t );
        h = m.x;
        t += h;
        id = m.y;
        
    }

    if( t < MAX_TRACE_DISTANCE ) res = t;
    if( t > MAX_TRACE_DISTANCE ) id =-1.0;
    
    return vec2( res , id );
    
}


// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNoiseNormal( in vec3 pos ){
    
  vec3 eps = vec3( 0.001, 0.0, 0.0 );
  vec3 nor = vec3(
      map(pos+eps.xyy).x - map(pos-eps.xyy).x,
      map(pos+eps.yxy).x - map(pos-eps.yxy).x,
      map(pos+eps.yyx).x - map(pos-eps.yyx).x );

  float noiseS = sin( parameter3 * 1. ) * 3. + 4.;
  vec3 noiseNorm = vec3(
      triNoise3D(pos*noiseS+eps.xyy, .4 ) - triNoise3D(pos*noiseS-eps.xyy, .4 ),
      triNoise3D(pos*noiseS+eps.yxy, .4 ) - triNoise3D(pos*noiseS-eps.yxy, .4 ),
      triNoise3D(pos*noiseS+eps.yyx, .4 ) - triNoise3D(pos*noiseS-eps.yyx, .4 ) );

  nor = nor + noiseNorm * .2;


  return normalize(nor);
}

// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ){
    
  vec3 eps = vec3( 0.001, 0.0, 0.0 );
  vec3 nor = vec3(
      map(pos+eps.xyy).x - map(pos-eps.xyy).x,
      map(pos+eps.yxy).x - map(pos-eps.yxy).x,
      map(pos+eps.yyx).x - map(pos-eps.yyx).x );

  return normalize(nor);
}



float calcAO( in vec3 pos, in vec3 nor )
{
  float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + 0.612*float(i)/4.0;
        vec3 aopos =  nor * hr + pos;
        float dd = map( aopos ).x;
        occ += -(dd-hr)*sca;
        sca *= 0.5;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );    
}

/*vec3 doCol( float lamb , float spec ){

  float nSpec= pow( spec , abs(sin(parameter1 * 1.1))* 10. + 2. );
  return
      vec3( 1. , .6 , .2 ) * hsv( parameter6 , 1. , 1. ) *  lamb //hsv( lamb , abs( sin( parameter6 )) * .2 + .6 , abs( sin( parameter2 ) * .4 + .6 )) * lamb 
    + vec3( .3 , .6 , 1. ) *  hsv( parameter5 , 1. , 1. ) * nSpec;// hsv( nSpec , abs( sin( parameter5 )) * .4 + .6 , abs( sin( parameter4 ) * .3 + .8 )) * nSpec;
}*/


vec3 doCol( float lamb , float spec ){

  float nSpec= pow( spec , abs(sin(parameter1 * 1.1))* 10. + 2. );
  return
      hsv( lamb * .3 + parameter2 , abs( sin( parameter6 )) * .2 + .6 , abs( sin( parameter2 ) * .4 + .6 )) * lamb 
    + hsv( nSpec * .6 + parameter3 , abs( sin( parameter5 )) * .4 + .6 , abs( sin( parameter4 ) * .3 + .8 )) * nSpec;
}





void main(){

  vec3 ro = vPos;
  vec3 rd = normalize( vPos - vCam );

  vec3 lightDir = normalize( vLight - ro);

  vec2 res = calcIntersection( ro , rd );

  vec3 reflDir = reflect( lightDir , vNorm );

  float lamb = max( dot( vNorm , lightDir), 0.);
  float spec = max( dot( reflDir , rd ), 0.);


  float iLamb = max( dot( -vNorm , lightDir), 0.);
  vec3  iReflDir = reflect( lightDir , -vNorm );
  float iSpec = max( dot( iReflDir , rd ), 0.);


  vec3 col = doCol( iLamb , iSpec );//-vNorm * .5 + .5;
  
  if( res.y > .5 ){

    vec3 pos = ro + rd * res.x;

    vec3 lightDir = normalize( vLight - pos);
    vec3 norm;

    if( res.y == 3.){
      norm = calcNoiseNormal( pos );
    }else{
      norm = calcNormal( pos );
    }
    vec3 reflDir = reflect( lightDir , norm );

    float lamb = max( dot( norm , lightDir), 0.);
    float spec = max( dot( reflDir , rd ), 0.);

    spec = pow( spec , 10. );

    float AO = calcAO( pos , norm );


    col = vec3( AO );



    /*col = vec3( spec, 0. , lamb);


    float val = smoothstep( .5 , .55 , lamb ) - .5;
    val *= 2.;
    col = vec3( val );*/
    //col = hsv( spec , .65 , 1. );

    //col = hsv( sin( lamb * 100. ) , .65 , 1. );
    //col = lamb * vec3( 1. , 0. , 0. ) + pow( spec , 10.) * vec3( 0. , 0. , 1. );// norm * .5 +.5;
    //col = doCol( lamb , spec );
  }else{

    discard;
  }

  /*if( vUv.x < .05 || vUv.x > .95 || vUv.y < .05 || vUv.y > .95 ){


    col += doCol( lamb , spec );
    col += vec3( .3 , .3 , .3 );
  }*/

  //vec3 col = vec3( 2. - length( texture2D( t_iri , vUv * 4. - vec2( 1.5 ) ) ));

  //vec3 col = vec3( hit );

  //col = vCam * .5 + .5;


  //gl_FragColor = vec4(vec3(length( col)) , 1. );
  gl_FragColor = vec4( col , 1. );


}