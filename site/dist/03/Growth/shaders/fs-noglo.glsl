uniform float time;
uniform sampler2D t_audio;

uniform samplerCube cubeMap;

uniform float uHovered;
uniform float uPower;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec3 vLight;

varying vec2 vUv;




const float MAX_TRACE_DISTANCE = 10.;           // max trace distance
const float INTERSECTION_PRECISION = 0.01;        // precision of the intersection
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




vec3 iqSpaceBend( vec3 p , float size , float amount )
{
    vec4 grow = vec4( 1.);
    p.xyz += amount *  .300*sin( size *  7.0*p.yzx )*grow.x;
    p.xyz += amount * 0.150*sin( size * 20.0*p.yzx )*grow.y;
    p.xyz += amount * 0.075*sin( size * 30.5*p.yzx )*grow.z;
    return p;
}


float sdCappedCylinder( vec3 p, vec2 h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}


vec2 smoothU( vec2 d1, vec2 d2, float k)
{
    float a = d1.x;
    float b = d2.x;
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return vec2( mix(b, a, h) - k*h*(1.0-h), mix(d2.y, d1.y, pow(h, 2.0)));
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


float hash( float n ) { return fract(sin(n)*753.5453123); }
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
  
    float n = p.x + p.y*157.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                   mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}





float fNoise( vec3 p ){
   
    float n;
    
    n += noise( p * 20. ) * .5;
    n += noise( p * 200. ) * .1;
    n += noise( p * 60. ) * .3;
    n += noise( p * 5. );

    n /= 2.;
    
    return n;
   
    
}



vec2 opS( vec2 d1, vec2 d2 )
{
    return  -d1.x > d2.x  ? vec2(-d1.x , d1.y) : d2 ;
}
vec2 opU( vec2 d1, vec2 d2 )
{
    return  d1.x < d2.x ? d1 : d2 ;
}



// Modelling 
//--------------------------------
vec2 map( vec3 pos ){  

    vec2 res;


    vec2 outer = vec2( -sdSphere( pos , 4. + INTERSECTION_PRECISION * 4. ) , 0.);

  //  vec3 q1 = iqSpaceBend( pos , .1 + sin( time * .2 ) * .1, .4+  sin( time * .1 ) * .1  );
  //  vec3 q2 = iqSpaceBend( pos , .2 + sin( time * .5 ) * .3, .2 + sin( time * .3 ) * .1  );
  //  vec3 q = (q1 + q2) / 2.;
  //  vec2 center=  vec2( sdSphere( q , .4 ) , 2.);


   float n = abs( noise( pos * (1. + uPower) + vec3( time , time , time ) * .1 ));

  vec2 center = vec2(  sdSphere( pos , .5 ) - n * 2. , 1.);

   //vec2 center = vec2( opRepSphere( pos , vec3( 1.5 ) , .3) , 2.);


    res = smoothU( outer , center , .5);

/*    vec2 lEye = vec2( sdSphere( pos - vec3( 0.8 , 0., 1.) , .7 ) , 1. );
    vec2 rEye = vec2( sdSphere( pos - vec3( -0.8 , 0., 1.) , .7 ) , 1. );

    vec2 eye = opU( lEye , rEye );

    res = opS( lEye , res );*/

    return res;
    
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


void main(){

  vec3 ro = vPos;
  vec3 rd = normalize( vPos - vCam );

  vec3 lightDir = normalize( vLight - ro);

  float ior = .9;


  vec3 rayR = refract( rd , vNorm , ior - .002 );
  vec3 rayG = refract( rd , vNorm , ior        );
  vec3 rayB = refract( rd , vNorm , ior + .002 );


  vec2 resR = calcIntersection( ro , rayR );
  vec2 resG = calcIntersection( ro , rayG );
  vec2 resB = calcIntersection( ro , rayB );






  vec3 reflDir = reflect( rd , vNorm );
  reflDir = normalize( reflDir );



  float lamb = max( dot( vNorm , lightDir), 0.);
  float spec = max( dot( reflDir , rd ), 0.);

  vec3 col = vec3( 0. );

  vec4 t =  textureCube( cubeMap , normalize(reflDir) ) ;
  col = t.xyz * t.w * .2;

  vec2 res = calcIntersection( ro , rd );


  float r = 0. , g= 0. , b = 0.;
   vec3 ray;
  if( resR.y > -.5 ){


    vec3 pos = ro + rayR * resR.x;
    vec3 nor = calcNormal( pos );

    r = max( 0. , dot( -rayR , nor ));
    r = texture2D( t_audio , vec2( r , 0.) ).x;

    if( resR.y == 0. ){
      ray = refract( rayR , nor , ior );
    }else{
      ray = reflect( rayR , nor );
    }

    r += textureCube( cubeMap , normalize(ray) ).x;

    //}

  }

  vec3 fNorm, fPos;
  float fFr;

  if( resG.y > -.5 ){


    vec3 pos = ro + rayG * resG.x;
    vec3 nor = calcNormal( pos );
    fNorm = nor;
    fPos = pos;

    g = max( 0. , dot( -rayG , nor ));
    fFr = g;
    g = texture2D( t_audio , vec2( g , 0.) ).y;

    
    if( resG.y == 0. ){
      ray = refract( rayG , nor , ior );
    }else{
      ray = reflect( rayG , nor );
    }

    g += textureCube( cubeMap , normalize(ray) ).y;

  }



  if( resB.y > -.5 ){


    vec3 pos = ro + rayB * resB.x;
    vec3 nor = calcNormal( pos );

    b = max( 0. , dot( -rayB , nor ));

    b = texture2D( t_audio , vec2( b , 0.) ).z;

    if( resB.y == 0. ){
      ray = refract( rayB , nor , ior );
    }else{
      ray = reflect( rayB , nor );
    }

    b += textureCube( cubeMap , normalize(ray) ).z;


  }


  col += vec3( r , g , b );

  if( uHovered == 1. ){
    //float fr = max( 0. , dot( -rd , fNorm));
    col += (fNorm * .5 +.5 ) * (1.-fFr);

  }

 // col = vec3( 1. )
  //col = textureCube( cubeMap , reflDir ).xyz;

  gl_FragColor = vec4( col , 1. );


}




