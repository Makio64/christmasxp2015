
uniform vec2 resolution;
uniform float time;
uniform float fov;
uniform float raymarchMaximumDistance;
uniform float raymarchPrecision;
uniform vec3 camera;
uniform vec3 target;

uniform sampler2D noiseTexture;
uniform samplerCube cubemap;
uniform vec3 anchors[15];


//uses most of the StackGL methods
//https://github.com/stackgl

//https://github.com/hughsk/glsl-square-frame

vec2 squareFrame(vec2 screenSize) {
  vec2 position = 2.0 * (gl_FragCoord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}
vec2 squareFrame(vec2 screenSize, vec2 coord) {
  vec2 position = 2.0 * (coord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}

//https://github.com/stackgl/glsl-look-at/blob/gh-pages/index.glsl

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));
  return mat3(uu, vv, ww);
}

//https://github.com/stackgl/glsl-camera-ray

vec3 getRay(mat3 camMat, vec2 screenPos, float lensLength) {
  return normalize(camMat * vec3(screenPos, lensLength));
}
vec3 getRay(vec3 origin, vec3 target, vec2 screenPos, float lensLength) {
  mat3 camMat = calcLookAtMatrix(origin, target, 0.0);
  return getRay(camMat, screenPos, lensLength);
}

/////////////////////////////////////////////////////////////////////////

mat3 rotationMatrix3(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c          );
}

/////////////////////////////////////////////////////////////////////////

//primitives

vec2 sphere( vec3 p, float radius, vec3 pos , vec4 quat)
{
    mat3 transform = rotationMatrix3( quat.xyz, quat.w );
    float d = length( ( p * transform )-pos ) - radius;
    return vec2(d,0.);
}

vec2 sphere( vec3 p, float radius, vec3 pos )
{
    float d = length( p -pos ) - radius;
    return vec2(d,0.);
}

vec2 roundBox(vec3 p, vec3 size, float corner, vec3 pos )
{
    return vec2( length( max( abs( p-pos )-size, 0.0 ) )-corner,1.);
}
vec2 roundBox(vec3 p, vec3 size, float corner, vec3 pos, vec4 quat )
{
    mat3 transform = rotationMatrix3( quat.xyz, quat.w );
    return vec2( length( max( abs( ( p-pos ) * transform )-size, 0.0 ) )-corner,1.);
}

vec2 line( vec3 p, vec3 a, vec3 b, float r )
{
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return vec2( length( pa - ba*h ) - r, 1. );
}


float voronoiDistribution( in vec3 p )
{
    vec3 i  = floor(p + dot(p, vec3(0.333333)) );  p -= i - dot(i, vec3(0.166666)) ;
    vec3 i1 = step(0., p-p.yzx), i2 = max(i1, 1.0-i1.zxy); i1 = min(i1, 1.0-i1.zxy);
    vec3 p1 = p - i1 + 0.166666, p2 = p - i2 + 0.333333, p3 = p - 0.5;
    vec3 rnd = vec3(7, 157, 113); // I use this combination to pay homage to Shadertoy.com. :)
    vec4 v = max(0.5 - vec4(dot(p, p), dot(p1, p1), dot(p2, p2), dot(p3, p3)), 0.);
    vec4 d = vec4( dot(i, rnd), dot(i + i1, rnd), dot(i + i2, rnd), dot(i + 1., rnd) );
    d = fract(sin(d)*262144.)*v*2.;
    v.x = max(d.x, d.y), v.y = max(d.z, d.w), v.z = max(min(d.x, d.y), min(d.z, d.w)), v.w = min(v.x, v.y);
	return  max(v.x, v.y) - max(v.z, v.w); // Maximum minus second order, for that beveled Voronoi look. Range [0, 1].
}

vec2 torus( vec3 p, vec2 radii, vec3 pos, vec4 quat )
{
    mat3 transform = rotationMatrix3( quat.xyz, quat.w );
    vec3 pp = ( p - pos ) * transform;
    float d = length( vec2( length( pp.xz ) - radii.x, pp.y ) ) - radii.y;
    return vec2(d,1.);
}

vec2 cone( vec3 p, vec2 c, vec3 pos, vec4 quat  )
{
    mat3 transform = rotationMatrix3( quat.xyz, quat.w );
    vec3 pp = ( p - pos ) * transform;
    float q = length(pp.xy);
    return vec2( dot(c,vec2(q,pp.z)), 1. );
}
//operations

vec2 unionAB(vec2 a, vec2 b){return vec2(min(a.x, b.x),1.);}
vec2 intersectionAB(vec2 a, vec2 b){return vec2(max(a.x, b.x),1.);}
vec2 blendAB( vec2 a, vec2 b, float t ){ return vec2(mix(a.x, b.x, t ),1.);}
vec2 subtract(vec2 a, vec2 b){ return vec2(max(-a.x, b.x),1.); }
//http://iquilezles.org/www/articles/smin/smin.htm
vec2 smin( vec2 a, vec2 b, float k ) { float h = clamp( 0.5+0.5*(b.x-a.x)/k, 0.0, 1.0 ); return vec2( mix( b.x, a.x, h ) - k*h*(1.0-h), 1. ); }
float smin( float a, float b, float k ) { float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 ); return mix( b, a, h ) - k*h*(1.0-h); }

//http://www.pouet.net/topic.php?post=367360
const vec3 pa = vec3(1., 57., 21.);
const vec4 pb = vec4(0., 57., 21., 78.);
float perlin(vec3 p) {
	vec3 i = floor(p);
	vec4 a = dot( i, pa ) + pb;
	vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
	a = mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)), f.x);
	a.xy = mix(a.xz, a.yw, f.y);
	return mix(a.x, a.y, f.z);
}
float zigzag( float x, float m )
{
    return abs( mod( x, (2.*m) ) -m);
}
float noise( in vec3 x )//image
{

    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);

	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = texture2D( noiseTexture, (uv+0.5)/256.0, -16.0 ).yx;
	return mix( rg.x, rg.y, f.z );
}
/////////////////////////////////////////////////////////////////////////

// STOP ! ! !

// HAMMER TIME !

/////////////////////////////////////////////////////////////////////////

const int raymarchSteps = 50;
const float PI = 3.14159;

//no height
vec2 plane( vec3 p , vec3 n) { return vec2( dot(p, n), 1. ); }
//with height
vec2 plane( vec3 p , vec4 n) { return vec2( dot(p, n.xyz) + n.w, 1. ); }

vec2 field( vec3 position )
{



    //position
    vec3 zero = vec3(0.);

    //rotation
    vec4 quat = vec4( 1., 0., 0., .75 );

    float rad = 500.;
    vec3 dir = vec3(.0,.0, time * 4.);
    float o =    zigzag( position.x, .25 ) + zigzag( position.x, .21 );
    vec2 ground = sphere( position + perlin( ( position + dir ) * .25 ) + o * .1, rad, vec3( 0.,-rad + 3.,0. ) );

    float radius = .5;
    float blendFactor = 1.;
    dir = vec3( 0., -time * 3., 0. );

    //blend distance (color blend)

    //left arm
    //skeleton = unionAB( skeleton, line( position, anchors[1], anchors[2], radius ) );//shoulder L
    vec2 skeleton = line( position, anchors[1], anchors[2], radius );
    skeleton = unionAB( skeleton, line( position, anchors[2], anchors[3], radius ) );
    skeleton = unionAB( skeleton, line( position, anchors[3], anchors[4], radius ) );

        //hand
        skeleton = unionAB( skeleton, roundBox( position, vec3( .1,.5,.1 ), .5, anchors[4] ) );

    //right arm
    skeleton = unionAB( skeleton, line( position, anchors[1], anchors[5], radius ) );//shoulder R
    skeleton = unionAB( skeleton, line( position, anchors[5], anchors[6], radius ) );
    skeleton = unionAB( skeleton, line( position, anchors[6], anchors[7], radius ) );

        //hand
        skeleton = unionAB( skeleton, roundBox( position, vec3( .1,.5,.1 ), .5, anchors[7] ) );

    //spine
    skeleton = smin( skeleton, line( position, anchors[1], anchors[8], radius * 1.5 ), blendFactor );

        //belly
        skeleton = smin( skeleton, sphere( position, radius * 2., anchors[8] ), blendFactor );

    //left leg
    skeleton = unionAB( skeleton, line( position, anchors[8], anchors[9], radius * .5 ));

    skeleton = unionAB( skeleton, line( position, anchors[9], anchors[10], radius ) );
    skeleton = unionAB( skeleton, line( position, anchors[10], anchors[11], radius ) );

    //right leg
    skeleton = unionAB( skeleton, line( position, anchors[8], anchors[12], radius * .5 ) );

    skeleton = unionAB( skeleton, line( position, anchors[12], anchors[13], radius ) );
    skeleton = unionAB( skeleton, line( position, anchors[13], anchors[14], radius ) );



    quat.w = 0.;
    vec3 offset = vec3( 0.,.25,0. );

    vec2 ruban = roundBox( position, vec3( 0.5,1.1,2.1 ), .5, anchors[0] + offset, quat );

    ruban = unionAB( ruban, roundBox( position, vec3( 2.1,1.1,.5 ), .5, anchors[0] + offset, quat ) );


    quat = vec4( 0., 0., 1., PI / 4. );
    ruban = unionAB( ruban, torus( position, vec2( 1.0,.1 ), anchors[0]+ offset + vec3( -1.,2.5,0.), quat ) );

    quat.w *= -1.;
    ruban = unionAB( ruban, torus( position, vec2( 1.0,.1 ), anchors[0]+ offset + vec3(  1.,2.5,0.), quat ) );

    quat.w = 0.;
    vec2 box = roundBox( position, vec3( 2.0,1.0,2. ), .5, anchors[0] + offset, quat );

    float dis0 = ruban.x;
    float dis1 = box.x;

    position *= .5;
    position.y += time;
    vec2 vor = vec2( voronoiDistribution(position), 0. );
    skeleton = unionAB( unionAB( ruban, box ), skeleton-vor );


    vec2 _out = smin( ground, skeleton, 1.5 );

	_out.y = 3.;
    if( _out.x == dis0 ) _out.y = 0.;
    if( _out.x == dis1 ) _out.y = 1.;
   // if( _out.x == dis2 ) _out.y = 2.;


    return _out;


}

/////////////////////////////////////////////////////////////////////////

// the methods below this need the field function

/////////////////////////////////////////////////////////////////////////


//the actual raymarching from:
//https://github.com/stackgl/glsl-raytrace/blob/master/index.glsl

vec2 raymarching( vec3 rayOrigin, vec3 rayDir, float maxd, float precis ) {

    float latest = precis * 2.0;
    float dist   = 0.0;
    float type   = -1.0;
    for (int i = 0; i < raymarchSteps; i++) {

        if (latest < precis || dist > maxd) break;

        vec2 result = field( rayOrigin + rayDir * dist );
        latest = result.x;
        dist  += latest;
        type = result.y;
    }

    vec2 res    = vec2(-1.0, -1.0 );
    if (dist < maxd) { res = vec2( dist, type ); }
    return res;

}

//https://github.com/stackgl/glsl-sdf-normal

vec3 calcNormal(vec3 pos, float eps) {
  const vec3 v1 = vec3( 1.0,-1.0,-1.0);
  const vec3 v2 = vec3(-1.0,-1.0, 1.0);
  const vec3 v3 = vec3(-1.0, 1.0,-1.0);
  const vec3 v4 = vec3( 1.0, 1.0, 1.0);

  return normalize( v1 * field( pos + v1*eps ).x +
                    v2 * field( pos + v2*eps ).x +
                    v3 * field( pos + v3*eps ).x +
                    v4 * field( pos + v4*eps ).x );
}

vec3 calcNormal(vec3 pos) {
  return calcNormal(pos, 0.002);
}

vec3 rimlight( vec3 pos, vec3 nor )
{
    vec3 v = normalize(-pos);
    float vdn = 1.0 - max(dot(v, nor), 0.0);
    return vec3(smoothstep(0., 1.0, vdn));
}


float turbulence ( vec3 coord ) {
    float frequency = 2.1;
    float n = 0.0;

    n += 1.0    * ( perlin( coord * frequency ) );
    n += 0.5    * sin( perlin( coord * frequency * 2.2 ) );
    n += 0.25   * cos( perlin( coord * frequency * 4.4 ) );

    return n;
}

void main() {

    vec2  screenPos    = squareFrame( resolution );

    float alpha = smoothstep( .2, 1., 1.- abs( screenPos.x ) );

    //uncomment below for fullscreen
    //alpha = 1.;

    if( alpha <= 0. ) discard;

    vec3  rayDirection = getRay( camera, target, screenPos, fov );

    vec2 collision = raymarching( camera, rayDirection, raymarchMaximumDistance, raymarchPrecision );

    vec3 color = vec3( 0.4, 0.8, 0.99 );

    float n = turbulence(vec3(screenPos.x, -time * 0.1, screenPos.y));

    gl_FragColor = vec4( color * ( screenPos.y-normalize( camera).y+.5) * exp(1.-n), alpha );


    if ( collision.x > -0.5)
    {

        vec3 pos = camera + rayDirection * collision.x;

       //diffuse color
       vec3 col = vec3(.65);

       //normal vector
       vec3 nor = calcNormal( pos );

       vec3 lig1 = normalize( vec3( cos( time * .25 ) * 50.0, 20.0, sin( time * .95 ) * 50.0) );
       vec3 light1 = max( 0.0, dot( lig1, nor) ) * color;
       vec3 light2 = max( 0.0, dot( -lig1 * .5, nor) ) * color;

       vec3 rim1 = rimlight( pos, -lig1 );
       vec3 rim2 = rimlight( lig1, nor ) * .25;

       float dep = ( ( collision.x + .5 ) / ( raymarchMaximumDistance * .5 ) );

       vec3 body =  ( col + rim2 + light1  ) * .8 - rim1 * dep;

       vec3 refl = textureCube( cubemap, nor ).rgb;


        if( collision.y ==0. )
        {
            col = ( ( refl * vec3(0.1,1.,0.) ) ) * dep;
            col = ( col + rim2 ) - .5 * rim1 * dep;
        }
        else if( collision.y == 1. )
        {
            col = ( ( refl * vec3(1.,0.1,0.) ) ) * dep;
            col = ( col + rim2 ) - .5 * rim1 * dep;
        }
        else
        {
            col = min( vec3( .86 ), body ) + refl * .15 + noise( pos * nor * 1000. ) * .15;
        }

       gl_FragColor = vec4( col + light2, alpha );


    }


}