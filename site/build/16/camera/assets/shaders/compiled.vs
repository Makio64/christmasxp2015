{@}Sphere.fs{@}// ADDED BY DEFAULT BY THREEJS
//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//#define FLIP_SIDED
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

uniform sampler2D map;
uniform float time;

varying vec2 vUv;

void main() {
    vec4 image = texture2D(map, vUv);
    gl_FragColor = image;
}
{@}Sphere.vs{@}// ADDED BY DEFAULT BY THREEJS
//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define VERTEX_TEXTURES
//#define GAMMA_FACTOR 2
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define MAX_BONES 251
//uniform mat4 modelMatrix;
//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
//uniform mat4 viewMatrix;
//uniform mat3 normalMatrix;
//uniform vec3 cameraPosition;
//attribute vec3 position;
//attribute vec3 normal;
//attribute vec2 uv;
//#ifdef USE_COLOR
//	attribute vec3 color;
//#endif
//#ifdef USE_MORPHTARGETS
//	attribute vec3 morphTarget0;
//	attribute vec3 morphTarget1;
//	attribute vec3 morphTarget2;
//	attribute vec3 morphTarget3;
//	#ifdef USE_MORPHNORMALS
//		attribute vec3 morphNormal0;
//		attribute vec3 morphNormal1;
//		attribute vec3 morphNormal2;
//		attribute vec3 morphNormal3;
//	#else
//		attribute vec3 morphTarget4;
//		attribute vec3 morphTarget5;
//		attribute vec3 morphTarget6;
//		attribute vec3 morphTarget7;
//	#endif
//#endif
//#ifdef USE_SKINNING
//	attribute vec4 skinIndex;
//	attribute vec4 skinWeight;
//#endif

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}NoiseBlur.fs{@}//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 0
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;


uniform sampler2D map;
uniform sampler2D depth;
uniform float fStrength;
uniform float time;
uniform float focus;
//uniform vec2 uResolution;

varying vec2 vUv;

#require(range.glsl)

#define ITERATIONS 10
#define TAU 6.28318530718

highp float random(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

//Use last part of hash function to generate new random radius and angle
vec2 mult(inout vec2 r) {
    r = fract(r * vec2(12.9898,78.233));
    return sqrt(r.x + .001) * vec2(sin(r.y * TAU), cos(r.y * TAU));
}

vec3 sample(vec2 uv) {
    return texture2D(map, uv).rgb;
}

vec3 blur(vec2 uv, float radius, float aspect, float offset) {
    vec2 circle = vec2(radius);
    circle.x *= aspect;
    vec2 rnd = vec2(random(vec2(uv + offset)));

    vec3 acc = vec3(0.0);
    for (int i = 0; i < ITERATIONS; i++) {
        acc += sample(uv + circle * mult(rnd)).xyz;
    }
    return acc / float(ITERATIONS);
}

void main() {
    vec3 color = vec3(0.0);

    vec2 uv = vUv;
    uv.x = 1.0 - uv.x;

    float strength = 0.001 * fStrength * abs(texture2D(depth, uv).r - focus);

    //jitter the noise but not every frame
    float tick = floor(fract(time * 0.001) * 20.0);
    float jitter = mod(tick * 382.0231, 21.321);

    //apply blur
    vec3 tex = blur(uv, strength, 1.0, jitter);
    gl_FragColor.rgb = tex;
    gl_FragColor.a = 1.0;
}{@}range.glsl{@}float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}{@}UILayer.fs{@}//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 0
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

varying vec2 vUv;

uniform float fRetina;
uniform float fLoader1;
uniform float fLoader2;
uniform float fLoader3;
uniform float fLoader4;
uniform sampler2D tDiffuse;
uniform sampler2D tObjective1;
uniform sampler2D tObjective2;
uniform sampler2D tObjective3;
uniform sampler2D tObjective4;
uniform sampler2D tObjective5;
uniform float fComplete1;
uniform float fComplete2;
uniform float fComplete3;
uniform float fComplete4;
uniform float fComplete5;
//uniform sampler2D tMask;
uniform float fTransition;
uniform float fColor;
uniform vec2 uResolution;
uniform float fFocus;
uniform float fFlash;
uniform float fDarken;

vec4 background = vec4(0.19, 0.19, 0.19, 1.0);

#require(range.glsl)

float aastep(float threshold, float value) {
    return smoothstep(threshold - 1.0, threshold + 1.0, value);
}

float line(float thickness, float position) {
    thickness *= fRetina;
    return aastep(-0.5 * thickness, position) * (1.0 - aastep(0.5 * thickness, position));
}

float horizontalLine(float thickness, float position) {
    return line(thickness, gl_FragCoord.y - position);
}

float verticalLine(float thickness, float position) {
    return line(thickness, gl_FragCoord.x - position);
}

float circleStroke(float radius, float thickness, vec2 position) {
    thickness *= fRetina;
    vec2 center = position;
    center -= gl_FragCoord.xy;

    float length = length(center);

    return aastep(radius, length) * (1.0 - aastep(radius + (thickness - 1.0), length - 1.0));
}

float circleFill(float radius) {
    vec2 center = vec2(uResolution.x * 0.5, uResolution.y * 0.5);
    center -= gl_FragCoord.xy;

    float length = length(center);

    return (1.0 - aastep(radius, length));
}

float linePattern(float thickness, float distance) {
    thickness *= fRetina * 1.3;
    distance *= fRetina * 1.3;
    return aastep(distance - thickness, mod(gl_FragCoord.x - gl_FragCoord.y, distance));
}

float semiCircleLines(float radius, float thickness, float distance) {
    float circle = circleFill(radius);
    float lines = linePattern(thickness, 2.0 * thickness);
    float hemisphere = max(0.0, sign(-gl_FragCoord.y + uResolution.y * 0.5 - 1.0 * fRetina));

    vec2 center = vec2(uResolution.x * 0.5 - radius, uResolution.y * 0.5);
    center -= gl_FragCoord.xy;
    float angle = aastep(atan(center.y, -center.x) / 3.1415926 * 1000.0, range(fLoader2, 0.5, 1.0, 0.0, 0.5) * 1000.0);
    return circle * lines * hemisphere * angle;
}

float reticleLine(float length, float thickness) {
    length += thickness * fRetina;
    float clip = verticalLine(length * fLoader1, uResolution.x * 0.5 + length - length * fLoader1);
    float line = horizontalLine(thickness, uResolution.y * 0.5);
    return clip * line;
}

float reticleCircle(float radius, float thickness, vec2 position) {
    vec2 center = vec2(uResolution.x * 0.5, uResolution.y * 0.5);
    center -= gl_FragCoord.xy;
    float angle = aastep(atan(center.y, -center.x) / 3.1415926 * 1000.0, range(fLoader2, 0.0, 1.0, -1.0, 1.0) * 1000.0);

    float circle = circleStroke(radius, thickness, position);
    return angle * circle;
}


float reticleCorners(float width, float height, float thickness, float length) {
    float top = horizontalLine(thickness, uResolution.y * 0.5 + height * 0.5);
    float bottom = horizontalLine(thickness, uResolution.y * 0.5 - height * 0.5);
    float left = verticalLine(thickness, uResolution.x * 0.5 - width * 0.5);
    float right = verticalLine(thickness, uResolution.x * 0.5 + width * 0.5);
//    return top + bottom + left + right;

    float topMask = horizontalLine(length, uResolution.y * 0.5 + height * 0.5 - length);
    float bottomMask = horizontalLine(length, uResolution.y * 0.5 - height * 0.5 + length);
    float leftMask = verticalLine(length, uResolution.x * 0.5 - width * 0.5 + length);
    float rightMask = verticalLine(length, uResolution.x * 0.5 + width * 0.5 - length);
//    return topMask + bottomMask + leftMask + rightMask;

    float topLeft = top * leftMask + left * topMask;
    float topRight = top * rightMask + right * topMask;
    float bottomRight = bottom * rightMask + right * bottomMask;
    float bottomLeft = bottom * leftMask + left * bottomMask;

    return topLeft + topRight + bottomRight + bottomLeft;
}

float verticalLines(float thickness, float gutter) {
    return aastep(gutter, mod(gl_FragCoord.x, thickness + gutter));
}

float focusLines(float width, float percentage, float position, float min, float falloff, float height, float thickness, float gutter) {
    min *= fRetina;
    falloff *= fRetina;
    thickness *= fRetina;
    gutter *= fRetina;
    float lines = verticalLines(thickness, gutter);

    percentage = range(percentage, 0.0, 1.0, 0.5 * (uResolution.x - width) / uResolution.x - 0.005, 1.0 - 0.5 * (uResolution.x - width) / uResolution.x - 0.005);

    float inclineX = clamp(range((gl_FragCoord.x - mod(gl_FragCoord.x, thickness + gutter)) / uResolution.x, percentage - falloff / uResolution.x, percentage, 0.0, 1.0), 0.0, 1.0);
    float declineX = clamp(range((gl_FragCoord.x - mod(gl_FragCoord.x, thickness + gutter)) / uResolution.x, percentage, percentage + falloff / uResolution.x, -1.0, 0.0), -1.0, 0.0);
    float curveTop = (1.0 - aastep(declineX * declineX * inclineX * inclineX * height + position + min * 0.5, gl_FragCoord.y));
    float curveBottom = aastep(declineX * declineX * inclineX * inclineX * -height + position - min * 0.5, gl_FragCoord.y);

    float clip = verticalLine(width / fRetina, uResolution.x * 0.5);

    return lines * curveTop * curveBottom * clip;
    return curveTop * curveBottom * clip;
}

void addObjective(float radius, sampler2D image, float complete, vec2 position) {
    vec2 center = position;
    center -= gl_FragCoord.xy;

    float length = length(center);

    vec2 uv = (center - vec2(radius)) / radius * -0.5;
    uv.x *= 0.5;
    uv.x += 0.5 * complete;

    vec4 objImage = texture2D(image, uv);

    gl_FragColor = mix(gl_FragColor, objImage, (1.0 - aastep(radius, length)) * objImage.a * fLoader4);
    gl_FragColor.rgb += vec3(circleStroke(radius, 2.0, position) * fLoader4);
}

void addObjectives(float radius, float margin) {
    margin *= fRetina;

    float offset = (radius * 2.0 + margin) / uResolution.y;

    addObjective(radius, tObjective1, fComplete1, uResolution * vec2(0.07, 0.5 + offset * 2.0));
    addObjective(radius, tObjective2, fComplete2, uResolution * vec2(0.07, 0.5 + offset));
    addObjective(radius, tObjective3, fComplete3, uResolution * vec2(0.07, 0.5));
    addObjective(radius, tObjective4, fComplete4, uResolution * vec2(0.07, 0.5 - offset));
    addObjective(radius, tObjective5, fComplete5, uResolution * vec2(0.07, 0.5 - offset * 2.0));
}

//float scale = 0.2;
//float speed = 0.05;
//
//float simple_iqnoise(vec3 x) {
//    vec3 p = floor(x);
//    vec3 f = fract(x);
//	f = f*f*(3.0-2.0*f);
//
//	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
//	vec2 rg = texture2D( iChannel0, (uv+0.5)/256.0, -100.0 ).yx;
//	return mix( rg.x, rg.y, f.z ) * 2.0 - 1.0;
//}
//
//#define fBm(p, func) { f = 0.5 * func(p); p *= 2.01; f += 0.25 * func(p); p *= 2.03; f += 0.125 * func(p); p *= 2.02; f += 0.0625 * func(p); }
//
//void mainImage( out vec4 fragColor, in vec2 fragCoord )
//{
//	vec2 uv = fragCoord / iResolution.xy;
//    vec3 q = vec3(uv * vec2(scale * 0.7, scale), iGlobalTime * speed);
//
//    float f;
//
//	q *= 2.0;
//    fBm(q, simple_iqnoise);
//
//	f = f / 2.0 + 0.5;
//     f *= f;
//    f *= f;
//
//    fragColor = vec4(f) ;
//}

void main() {
//    gl_FragColor = transition(texture2D(tDiffuse, vUv));
//    gl_FragColor = texture2D(tDiffuse, vUv);
    vec4 color = texture2D(tDiffuse, vUv);
    float grayscale = dot(vec3(0.222, 0.707, 0.071), color.rgb);
    gl_FragColor = vec4(vec3(grayscale), 1.0);
    gl_FragColor.rgb = max(background.rgb, gl_FragColor.rgb * fTransition);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, color.rgb, fColor);

    gl_FragColor.rgb += vec3(reticleLine(uResolution.x * 0.05, 2.0));
    gl_FragColor.rgb += vec3(reticleCircle(uResolution.x * 0.05, 2.0, uResolution * 0.5));
    gl_FragColor.rgb += vec3(semiCircleLines(uResolution.x * 0.05, 2.0, 4.0));
    gl_FragColor.rgb += vec3(reticleCorners(uResolution.x * 0.4, uResolution.y * 0.5, 2.0, 50.0) * fLoader3);
    gl_FragColor.rgb += vec3(focusLines(uResolution.x * 0.4, fFocus, uResolution.y * 0.07, 5.0, 60.0, uResolution.y * 0.05, 2.0, 5.0) * fLoader3);

    addObjectives(max(uResolution.x, uResolution.y) * 0.03, 15.0);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), fFlash);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, background.rgb, fDarken);
}{@}colorBurn.glsl{@}float applyColorBurnToChannel(float base, float blend) {
	return ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0));
}

vec3 colorBurn(vec3 base, vec3 blend) {
    vec3 o = vec3(1.0);
    o.r = applyColorBurnToChannel(base.r, blend.r);
    o.g = applyColorBurnToChannel(base.g, blend.g);
    o.b = applyColorBurnToChannel(base.b, blend.b);
//    applyColorBurnToChannel(base.a, blend.a)
    return o;
}{@}levels.glsl{@}float levelChannel(float inPixel, float inBlack, float inGamma, float inWhite, float outBlack, float outWhite) {
    return (pow(((inPixel * 255.0) - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack) / 255.0;
}

vec3 levels(vec3 inPixel, float inBlack, float inGamma, float inWhite, float outBlack, float outWhite) {
    vec3 o = vec3(1.0);
    o.r = levelChannel(inPixel.r, inBlack, inGamma, inWhite, outBlack, outWhite);
    o.g = levelChannel(inPixel.g, inBlack, inGamma, inWhite, outBlack, outWhite);
    o.b = levelChannel(inPixel.b, inBlack, inGamma, inWhite, outBlack, outWhite);
    return o;
}