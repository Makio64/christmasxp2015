
uniform float time;

uniform float parameter1;
uniform float parameter2;
uniform float parameter3;
uniform float parameter4;
uniform float parameter5;
uniform float parameter6;

uniform vec3 lightColor1;
uniform vec3 lightColor2;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec3 vLight1;
varying vec3 vLight2;



varying vec2 vUv;


// Branch Code stolen from : https://www.shadertoy.com/view/ltlSRl
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

const float MAX_TRACE_DISTANCE = 5.0;             // max trace distance
const float INTERSECTION_PRECISION = 0.01;        // precision of the intersection
const int NUM_OF_TRACE_STEPS = 15;
const float PI = 3.14159;

vec3 hsv(float h, float s, float v){
        return mix( vec3( 1.0 ), clamp(( abs( fract(h + vec3( 3.0, 2.0, 1.0 ) / 3.0 )
                   * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
      }



mat4 rotateX(float angle){
    
  angle = -angle/180.0*3.1415926536;
    float c = cos(angle);
    float s = sin(angle);
  return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
    
}

mat4 rotateY(float angle){
    
  angle = -angle/180.0*3.1415926536;
    float c = cos(angle);
    float s = sin(angle);
  return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
    
}

mat4 rotateZ(float angle){
    
  angle = -angle/180.0*3.1415926536;
    float c = cos(angle);
    float s = sin(angle);
  return mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    
}
mat4 translate(vec3 t){
    
  return mat4(1.0, 0.0, 0.0, -t.x, 0.0, 1.0, 0.0, -t.y, 0.0, 0.0, 1.0, -t.z, 0.0, 0.0, 0.0, 1.0);
    
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

float sphereField( vec3 p ){

  float fieldSize = 1.  + abs( sin( parameter5) ) * 1.;
  return opRepSphere( p , vec3(fieldSize ), .04 + parameter4 * .05 );

}

//--------------------------------
// Modelling 
//--------------------------------
vec2 map( vec3 pos ){  
    
    
    float branchSize = .3;
    float reductionFactor = .7 +  .1 * sin( time * .73 );
    float trunkSize = .2 +  .1 * sin( time * .27 );
    float bs = branchSize;
    float rot = 40. + 10. * sin( time * .6 );
    
    pos += vec3( 0. , branchSize , 0. );

   
    vec4 p = vec4( pos , 1. );
    mat4 m;
    
    //vec2 res = vec2( length( pos + vec3( 0. , .5, 0.) ) - .5, 0.0 );
  
    //vec2 res = smoothU( res ,vec2(sdCappedCylinder( p.xyz , vec2( trunkSize * bs , bs )),1.);

    //vec2 res = vec2( sdCappedCylinder( p.xyz , vec2( trunkSize * bs , bs )),1.);
    vec2 res = vec2( length(p.xyz + vec3( 0., 6. , 0. )) - 6. , 1. );
         //res = smoothU( res, vec2( length(p.xyz + vec3( 0., 0. , 11. ))-10. ,10. ) , 2.);
      //  res = smoothU( res, vec2( length( p.xyz - vLight2+ vec3( 0., .3 , 0. )) - .3 ,100. ), .1);

    res = smoothU( res , vec2(sdCappedCylinder( p.xyz , vec2( trunkSize * bs , bs )),1.), .1);
    
    for( int i = 0; i < 4; i ++ ){
        bs *= reductionFactor;

        m = translate(vec3(0.0, bs*2. , 0.0)) * rotateY(rot) * rotateX(rot);    
        p.x = abs(p.x) - bs / 2.;
        p.z = abs(p.z) - bs / 2.;   
        p = p * m; 

        res = smoothU( res , vec2( sdCappedCylinder( p.xyz , vec2( trunkSize * bs , bs )),1.) , .1);
    }



    return res;
    
}



//----
// Camera Stuffs
//----
mat3 calcLookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}

void doCamera( out vec3 camPos, out vec3 camTar, in float time, in vec2 mouse )
{
    float an = 0.3 + 3.0*mouse.x;
    float an2 = 0.3 + 3.0*mouse.y;

  camPos = vec3(3.5*sin(an),3. * cos( an2),3.5*cos(an));
    camTar = vec3(0. ,0.0,0.0);
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


vec2 doLight( vec3 lightPos , vec3 pos , vec3 norm , vec3 eyeDir ){

  vec3 lightDir = normalize( lightPos - pos );
  vec3 reflDir  = reflect( lightDir , norm );


  float lamb = max( 0. , dot( lightDir ,    norm ) );
  float spec = max( 0. , dot( reflDir  , eyeDir ) );

  return vec2( lamb , spec );

}


void main(){

  vec3 ro = vPos;
  vec3 rdI = normalize( vPos - vCam );
  vec3 rd = refract( rdI , vNorm , 1. / 1.5 );

  vec2 res = calcIntersection( ro , rd );

  vec2 light1 = doLight( vLight1 , ro , vNorm , rdI );
  vec2 light2 = doLight( vLight2 , ro , vNorm , rdI );

  vec3 col = vec3( 0. );
  col += lightColor1 * 2. * pow( light1.y , 20. );
  col += lightColor2 * 2. * pow( light2.y, 20. );

  float opacity = length( col );
  
  if( res.y > .5 ){

    vec3 pos = ro + rd * res.x;

    vec3 lightDir = normalize( vLight1 - pos);
    vec3 norm;

    
    norm = calcNormal( pos );
    
    light1 = doLight( vLight1 , pos , norm , rd );
    light2 = doLight( vLight2 , pos , norm , rd );


    float AO = calcAO( pos , norm );


    col += lightColor1 * light1.x + lightColor1 * 2. * pow( light1.y , 40. );
    col += lightColor2 * light2.x + lightColor2 * 2. * pow( light2.y, 40. );
    col *= AO;


    opacity += 1.;


  }else{

  }


 
  gl_FragColor = vec4( col ,1.);// opacity );





}