uniform float time;
uniform sampler2D t_audio;

uniform samplerCube cubeMap;
uniform float uHovered;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec3 vLight;

varying vec2 vUv;




const float MAX_TRACE_DISTANCE = 10.;           // max trace distance
const float INTERSECTION_PRECISION = 0.001;        // precision of the intersection
const int NUM_OF_TRACE_STEPS = 30;
const float PI = 3.14159;




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


// ROTATION FUNCTIONS TAKEN FROM
//https://www.shadertoy.com/view/XsSSzG
vec3 xrotate(vec3 pos , float t) {
  return mat3(1.0, 0.0, 0.0,
                0.0, cos(t), -sin(t),
                0.0, sin(t), cos(t)) * pos;
}


float opS( float d1, float d2 )
{
    return max(-d1,d2);
}

vec2 opS( vec2 d1, vec2 d2 )
{
    return  -d1.x > d2.x  ? vec2(-d1.x , d1.y) : d2 ;
}

vec2 opU( vec2 d1, vec2 d2 )
{
    return  d1.x < d2.x ? d1 : d2 ;
}

float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float sdCone( vec3 p, vec2 c )
{
    // c must be normalized
    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}

float sdCappedCone( in vec3 p, in vec3 c )
{
    vec2 q = vec2( length(p.xz), p.y );
    vec2 v = vec2( c.z*c.y/c.x, -c.z );
    vec2 w = v - q;
    vec2 vv = vec2( dot(v,v), v.x*v.x );
    vec2 qv = vec2( dot(v,w), v.x*w.x );
    vec2 d = max(qv,0.0)*qv/vv;
    return sqrt( dot(w,w) - max(d.x,d.y) )* sign(max(q.y*v.x-q.x*v.y,w.y));
}



float cBase( vec3 pos ){

  float c = sdCone( pos , normalize(vec2( 1. , 1. )));
  float s = sdPlane( pos , vec4( 0 , 0. , 1. , 1.4 ) );

  return opS( s , c );

}


// give a base ID to pass out of
// first build the fields
// than connnect to ID numbers, using  by passing through baseID
// write out baseID for later use.
vec2 body( vec3 pos , out float baseID ){

  float c = sdSphere( pos* vec3( 1. , .5 , 1. )  , 1. );
  float p = sdPlane( pos * vec3( 1. , .5 , 1. ), vec4( -1. , 0. , 0. , 0. ) );




  
  //baseID += 1.;
  vec2 torso = opS( vec2( p , baseID + 1. ) , vec2( c , baseID + 1. )  );


  //float cb = sdCappedCone( pos - vec3( 1. ) , normalize(vec3( 1. , 1. , 1. )));

  vec3 q = xrotate( pos - vec3( -.2 , -.8 , 0. ) , -PI / 2. );

  float cb = cBase( q );
  vec2 cloakBase = vec2( cb , baseID + 0. );


  float n = abs( noise( pos * 4.1 + time * .5 ));
  vec2 h = vec2( sdSphere( pos - vec3( 0.2 , 1.4 , 0. ) , .5 - n * .2 )   , baseID + 2. );

  vec2 bod = smoothU( cloakBase, torso ,.9);

  float n2 = abs( noise( pos * 2. + time * .5 ));
  bod.x -= n2 * .1;


  return  smoothU( bod , h , .3 );
  //return vec2( c , 1. );


}



// Modelling 
//--------------------------------
vec2 map( vec3 pos ){  

    vec2 res;


  //  vec2 outer = vec2( -sdSphere( pos , 4. + INTERSECTION_PRECISION * 4. ) , 0.);



  //  vec3 q1 = iqSpaceBend( pos , .1 + sin( time * .2 ) * .1, .4+  sin( time * .1 ) * .1  );
  //  vec3 q2 = iqSpaceBend( pos , .2 + sin( time * .5 ) * .3, .2 + sin( time * .3 ) * .1  );
  //  vec3 q = (q1 + q2) / 2.;
  //  vec2 center=  vec2( sdSphere( q , .4 ) , 2.);


  // float n = abs( noise( pos + vec3( time , time , time ) * .1 ));

   // vec2 center = vec2(  sdSphere( pos , .4 ) , 1.);


    float ID = 0.;

    vec2 b = body( (pos - vec3( 0.2 , .0 , 0. ) ), ID );




   //vec2 center = vec2( opRepSphere( pos , vec3( 1.5 ) , .3) , 2.);


    res = b;//smoothU( outer , center , .5 );

    return res;
    
}




// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ){
    
  vec3 eps = vec3( 0.0001, 0.0, 0.0 );
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

/*
  vec3 rayR = refract( rd , vNorm , ior - .002 );
  vec3 rayG = refract( rd , vNorm , ior        );
  vec3 rayB = refract( rd , vNorm , ior + .002 );


  vec2 resR = calcIntersection( ro , rayR );
  vec2 resG = calcIntersection( ro , rayG );
  vec2 resB = calcIntersection( ro , rayB );*/






  vec3 reflDir = reflect( rd , vNorm );
  reflDir = normalize( reflDir );



  float lamb = max( dot( vNorm , lightDir), 0.);
  float spec = max( dot( reflDir , rd ), 0.);

  vec3 col = vec3( 1. );


  vec2 res = calcIntersection( ro , rd );

  if( res.y > -.5 ){

    vec3 pos = ro + rd  * res.x;
    vec3 norm = calcNormal( pos );
  
    lightDir = normalize( vec3( 1., 2. , 0.) - pos);
    lamb = max( dot( norm , lightDir ), 0.);

    float fr = max( 0. , dot( norm , -rd ) );
    col = norm * .5 + .5;
    col *= 1. - fr;

    if( res.y > .9 - uHovered ){

      //float fr = max( 0. , dot( norm , -rd ) );
      vec3 aCol = texture2D( t_audio , vec2(fr,0. )).xyz;
      col = mix( col , aCol , max( 0. , res.y - 1. + uHovered) );

    }

   // col  = vec3( lamb );

  }else{




    if( false ){//abs( vUv.x - .5 ) > .49 || abs( vUv.y - .5 ) > .49 ){

    }else{discard;}
  }


 // col = vec3( 1. )
  //col = textureCube( cubeMap , reflDir ).xyz;

  gl_FragColor = vec4( col , 1. );


}
