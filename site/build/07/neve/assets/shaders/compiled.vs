{@}Clouds.fs{@}uniform sampler2D tCloud;
uniform vec3 diffuse;
uniform float alpha;

varying vec3 vColor;
varying vec3 vPos;
varying float vRotation;
varying float vOpacity;

#require(transformUV.glsl)
#require(range.glsl)

vec2 rotate(vec2 uv) {
    float r = vRotation;
    float values[9];
    values[0] = 0.0; //x
    values[1] = 0.0; //y
    values[2] = 0.0; //skewX
    values[3] = 0.0; //skewY
    values[4] = r; //rotation
    values[5] = 1.0; //scaleX
    values[6] = 1.0; //scaleY
    values[7] = 0.5; //originX
    values[8] = 0.5; //originY
    return transformUV(uv, values);
}

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    uv = rotate(uv);
    
    vec4 color = texture2D(tCloud, uv);
    
    color.rgb *= diffuse;
    
    color.rgb *= clamp(range(uv.y, 0.5, 1.0, 1.0, 0.75), 0.75, 1.0);
    color.rgb *= clamp(range(vPos.y, 0.0, -400.0, 1.0, 0.75), 0.75, 1.0);
    
    color.a *= vOpacity * alpha;
    color.a *= 0.1;
    
    color.rgb += vColor * 0.5;
    
    gl_FragColor = color;
}{@}Clouds.vs{@}uniform float size;
uniform sampler2D tColor;

attribute float scale;
attribute float rotation;
attribute float opacity;

varying float vRotation;
varying float vOpacity;
varying vec3 vPos;
varying vec3 vColor;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.z, -1000.0, 1000.0, 0.0, 1.0);
    uv.y = range(position.y, -400.0, 200.0, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    float alpha = 1.0 - smoothstep(600.0, 1200.0, position.z);
    alpha *= smoothstep(-1200.0, -700.0, position.z);
    
    vRotation = rotation;
    vOpacity = opacity * alpha;
    
    vPos = position;
    
    vColor = texture2D(tColor, getUVFromPos()).rgb;
}{@}Dome.fs{@}uniform samplerCube tCube;
uniform sampler2D tColor;
uniform sampler2D tMatcap;
uniform float alpha;

varying vec3 vReflect;
varying vec2 vUv;
varying vec3 vPos;
varying vec2 matcapUV;

#require(refl.fs)
#require(range.glsl)

void main() {
    vec3 color = envColor(tCube, vReflect).rgb;
    
    gl_FragColor.rgb = color;
    gl_FragColor.a = alpha;
    
}{@}Dome.vs{@}varying vec3 vReflect;
varying vec2 vUv;
varying vec3 vPos;

#require(refl.vs)

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vReflect = refraction(worldPosition, 0.9);
    
    vUv = uv;
    vPos = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}Flakes.fs{@}uniform sampler2D tMap;

varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 texel = texture2D(tMap, uv);
    
    texel.a *= vAlpha * 0.8;
    
    gl_FragColor = texel;
}{@}Flakes.vs{@}uniform float size;
uniform sampler2D tColor;

attribute float scale;
attribute float alpha;

varying float vAlpha;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.x, -1000.0, 1000.0, 0.0, 1.0);
    uv.y = range(position.y, -1000.0, 1000.0, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    float fade = smoothstep(900.0, 600.0, position.y);
    
    vAlpha = alpha * fade;
}{@}Hut.fs{@}uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform vec3 diffuse;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;
    vec3 sky = texture2D(tColor, vUv).rgb;
    
    color *= diffuse;
    color += sky * 0.3;
    
    gl_FragColor = vec4(color, texel.a);
}{@}Hut.vs{@}varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}Ice.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec3 vWorldPosition;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

uniform samplerCube tCube;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform sampler2D tColor;
uniform vec3 diffuse;
uniform vec3 specular;

#require(normalmap.glsl)
#require(refl.fs)
#require(range.glsl)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.5, 1.0);
    
    return light;
}

#define saturate(a) clamp( a, 0.6, 1.0 )

float dPhong(float shininess, float dotNH) {
    return (shininess * 0.5 + 1.0) * pow(dotNH, shininess);
}

vec3 schlick(vec3 specularColor, float dotLH) {
    float fresnel = exp2((-5.55437 * dotLH - 6.98316) * dotLH);
    return (1.0 - specularColor) * fresnel + specularColor;
}

vec3 calcBlinnPhong(vec3 specularColor, float shininess, vec3 normal, vec3 lightDir, vec3 viewDir) {
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float dotNH = saturate(dot(normal, halfDir));
    float dotLH = saturate(dot(lightDir, halfDir));
    
    vec3 F = schlick(specularColor, dotLH);
    
    vec2 offset = vec2(0.0);
    offset.x = -1.0 + (dotNH * 1.0);
    float G = texture2D(tDepth, vUv + offset).r * abs(dotLH) * 4.0;
        
    float D = dPhong(shininess, dotNH);
    
    return F * G * D;
}

vec3 phong(float amount, vec3 diffuse, vec3 specular, float shininess, float attenuation, vec3 normal, vec3 lightDir, vec3 viewDir) {
    float cosineTerm = saturate(dot(normal, lightDir));
    vec3 brdf = calcBlinnPhong(specular, shininess, normal, lightDir, viewDir);
    return brdf * amount * diffuse * attenuation * cosineTerm;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 1.0, vUv);
    
    vec3 rVec = refraction(vWorldPosition, normal, 0.98);
    vec3 reflected = envColor(tCube, rVec).rgb;
    
    float light = calculateLight(normal);
    
    vec2 uv = vUv;
    uv.y = range(uv.y, 1.0, 0.0, 0.5, 0.6);
    vec3 skyColor = texture2D(tColor, uv).rgb;
    
    vec3 lightDir = normalize(vec3(0.0, 1000.0, 1000.0));
    vec3 viewDir = vViewPosition;
    vec3 color = phong(3.6, skyColor + diffuse, specular, 0.3, 1.0, normal, lightDir, viewDir);
    
    color += reflected * 0.4;
    
    color *= light;
    color *= 0.15;
//    color += skyColor * 0.3;
    
    gl_FragColor = vec4(color, 1.0);
}{@}Ice.vs{@}varying vec3 vWorldPosition;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}matcap.vs{@}vec2 reflectMatcap(vec3 position, mat4 modelViewMatrix, mat3 normalMatrix, vec3 normal) {
    vec4 p = vec4(position, 1.0);
    
    vec3 e = normalize(vec3(modelViewMatrix * p));
    vec3 n = normalize(normalMatrix * normal);
    vec3 r = reflect(e, n);
    float m = 2.0 * sqrt(
        pow(r.x, 2.0) +
        pow(r.y, 2.0) +
        pow(r.z + 1.0, 2.0)
    );
    
    vec2 uv = r.xy / m + .5;
    
    return uv;
}

vec2 reflectMatcap(vec3 position, mat4 modelViewMatrix, vec3 normal) {
    vec4 p = vec4(position, 1.0);
    
    vec3 e = normalize(vec3(modelViewMatrix * p));
    vec3 n = normalize(normal);
    vec3 r = reflect(e, n);
    float m = 2.0 * sqrt(
                         pow(r.x, 2.0) +
                         pow(r.y, 2.0) +
                         pow(r.z + 1.0, 2.0)
                         );
    
    vec2 uv = r.xy / m + .5;
    
    return uv;
}{@}perlin3d.glsl{@}//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}{@}simplex2d.glsl{@}//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    
    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    
    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                     + i.x + vec3(0.0, i1.x, 1.0 ));
    
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    
    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
    
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    
    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    
    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}{@}simplex3d.glsl{@}// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    i = mod289(i);
    vec4 p = permute( permute( permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

//float surface(vec3 coord) {
//    float n = 0.0;
//    n += 1.0 * abs(snoise(coord));
//    n += 0.5 * abs(snoise(coord * 2.0));
//    n += 0.25 * abs(snoise(coord * 4.0));
//    n += 0.125 * abs(snoise(coord * 8.0));
//    float rn = 1.0 - n;
//    return rn * rn;
//}{@}normalmap.glsl{@}vec3 unpackNormal( vec3 eye_pos, vec3 surf_norm, sampler2D normal_map, float intensity, float scale, vec2 uv ) {
    surf_norm = normalize(surf_norm);
    
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    
    vec3 S = normalize( q0 * st1.t - q1 * st0.t );
    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
    vec3 N = normalize( surf_norm );
    
    vec3 mapN = texture2D( normal_map, uv * scale ).xyz * 2.0 - 1.0;
    mapN.xy *= intensity;
    mat3 tsn = mat3( S, T, N );
    return normalize( tsn * mapN );
}{@}phong.fs{@}#define saturate(a) clamp( a, 0.2, 1.0 )

float dPhong(float shininess, float dotNH) {
    return (shininess * 0.5 + 1.0) * pow(dotNH, shininess);
}

vec3 schlick(vec3 specularColor, float dotLH) {
    float fresnel = exp2((-5.55437 * dotLH - 6.98316) * dotLH);
    return (1.0 - specularColor) * fresnel + specularColor;
}

vec3 calcBlinnPhong(vec3 specularColor, float shininess, vec3 normal, vec3 lightDir, vec3 viewDir) {
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float dotNH = saturate(dot(normal, halfDir));
    float dotLH = saturate(dot(lightDir, halfDir));
    
    vec3 F = schlick(specularColor, dotLH);
    float G = 0.85;
    float D = dPhong(shininess, dotNH);
    
    return F * G * D;
}

vec3 phong(float amount, vec3 diffuse, vec3 specular, float shininess, float attenuation, vec3 normal, vec3 lightDir, vec3 viewDir) {
    float cosineTerm = saturate(dot(normal, lightDir));
    vec3 brdf = calcBlinnPhong(specular, shininess, normal, lightDir, viewDir);
    return brdf * amount * diffuse * attenuation * cosineTerm;
}

//viewDir = vViewPosition
//lightDir = normalize(lightPos){@}range.glsl{@}float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}{@}refl.fs{@}vec3 reflection(vec3 worldPosition, vec3 normal) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return reflect(cameraToVertex, normal);
}

vec3 refraction(vec3 worldPosition, vec3 normal, float rRatio) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return refract(cameraToVertex, normal, rRatio);
}

vec4 envColor(samplerCube map, vec3 vec) {
    float flipNormal = 1.0;
    return textureCube(map, flipNormal * vec3(-1.0 * vec.x, vec.yz));
}{@}refl.vs{@}vec3 inverseTransformDirection(in vec3 normal, in mat4 matrix) {
    return normalize((matrix * vec4(normal, 0.0) * matrix).xyz);
}

vec3 reflection(vec4 worldPosition) {
    vec3 transformedNormal = normalMatrix * normal;
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    vec3 worldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
    
    return reflect(cameraToVertex, worldNormal);
}

vec3 refraction(vec4 worldPosition, float refractionRatio) {
    vec3 transformedNormal = normalMatrix * normal;
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    vec3 worldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
    
    return refract(cameraToVertex, worldNormal, refractionRatio);
}{@}rgb2hsv.fs{@}vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}{@}rgbshift.fs{@}vec4 getRGB(sampler2D tDiffuse, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture2D(tDiffuse, uv + offset);
    vec4 g = texture2D(tDiffuse, uv);
    vec4 b = texture2D(tDiffuse, uv - offset);
    return vec4(r.r, g.g, b.b, g.a);
}{@}TiltShift.fs{@}varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float blur;
uniform float gradientBlur;
uniform vec2 start;
uniform vec2 end;
uniform vec2 delta;
uniform vec2 texSize;

float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
    float radius = smoothstep(0.0, 1.0, abs(dot(vUv * texSize - start, normal)) / gradientBlur) * blur;
    
    for (float t = -4.0; t <= 4.0; t++)
    {
        float percent = (t + offset - 0.5) / 4.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(tDiffuse, vUv + delta / texSize * percent * radius);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }
    
    gl_FragColor = color / total;
    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}{@}transformUV.glsl{@}vec2 transformUV(vec2 uv, float a[9]) {

    // Convert UV to vec3 to apply matrices
	vec3 u = vec3(uv, 1.0);

    // Array consists of the following
    // 0 translate.x
    // 1 translate.y
    // 2 skew.x
    // 3 skew.y
    // 4 rotate
    // 5 scale.x
    // 6 scale.y
    // 7 origin.x
    // 8 origin.y

    // Origin before matrix
    mat3 mo1 = mat3(
        1, 0, -a[7],
        0, 1, -a[8],
        0, 0, 1);

    // Origin after matrix
    mat3 mo2 = mat3(
        1, 0, a[7],
        0, 1, a[8],
        0, 0, 1);

    // Translation matrix
    mat3 mt = mat3(
        1, 0, -a[0],
        0, 1, -a[1],
    	0, 0, 1);

    // Skew matrix
    mat3 mh = mat3(
        1, a[2], 0,
        a[3], 1, 0,
    	0, 0, 1);

    // Rotation matrix
    mat3 mr = mat3(
        cos(a[4]), sin(a[4]), 0,
        -sin(a[4]), cos(a[4]), 0,
    	0, 0, 1);

    // Scale matrix
    mat3 ms = mat3(
        1.0 / a[5], 0, 0,
        0, 1.0 / a[6], 0,
    	0, 0, 1);

	// apply translation
   	u = u * mt;

	// apply skew
   	u = u * mh;

    // apply rotation relative to origin
    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    // apply scale relative to origin
    u = u * mo1;
    u = u * ms;
    u = u * mo2;

    // Return vec2 of new UVs
    return u.xy;
}{@}transforms.glsl{@}vec3 transformPosition(vec3 pos, mat4 viewMat, vec3 mvPos) {
    vec4 worldPosition = viewMat * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos;
}

vec3 transformPosition(vec3 pos, mat4 viewMat, vec4 mvPos) {
    vec4 worldPosition = viewMat * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}{@}RGB.fs{@}varying vec2 vUv;

uniform sampler2D tDiffuse;

#require(rgbshift.fs)

void main() {
    gl_FragColor = getRGB(tDiffuse, vUv, 0.1, 0.0007);
}{@}Rock.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform sampler2D tDiffuse0;
uniform sampler2D tDiffuse1;
uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tColor;
uniform vec3 diffuse;
uniform vec3 specular;
uniform vec3 worldLight;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vLightPos;

#require(normalmap.glsl)
#require(range.glsl)
#require(phong.fs)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.2, 1.0);
    
    return light;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 1.0, vUv);
    
    float n = texture2D(tNoise, vUv).r;
    
    vec3 diffuse0 = texture2D(tDiffuse0, vUv).rgb;
    vec3 diffuse1 = texture2D(tDiffuse1, vUv).rgb;
    
    vec3 color = mix(diffuse0, diffuse1, n);
    
    vec2 uv = vUv;
    uv.y = range(uv.y, 1.0, 0.0, 0.2, 0.8);
    vec3 skyColor = texture2D(tColor, uv).rgb;
    
    skyColor *= 1.4;
    skyColor += diffuse * 0.9;
    
    vec3 lightDir = normalize(vec3(0.0, 1000.0, 1000.0));
    vec3 viewDir = vViewPosition;
    vec3 lightColor = phong(1.1, skyColor, specular, 1.0, 1.0, normal, lightDir, viewDir);
    
    color *= lightColor;
    
    color += phong(1.1, skyColor, specular, 1.0, 1.0, normal, normalize(vLightPos), viewDir) * 0.08;
        
    gl_FragColor = vec4(color, 1.0);
}{@}Rock.vs{@}varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vLightPos;

uniform sampler2D tNormal;
uniform vec3 worldLight;

#require(transforms.glsl)

void main() {
    vec3 pos = position;
    
    float variation = 50.0;
    pos.y += step(195.0, pos.y) * sin(radians(uv.x * variation)) * cos(radians(uv.x * variation)) * 50.0;
    
    float disturb = texture2D(tNormal, uv).g;
    vec3 offset = normalize(pos) * disturb * 50.0;
    offset *= step(-295.0, pos.y) * (1.0 - step(295.0, pos.y));
    pos += offset;
    
    if (pos.y > 295.0) pos.y += sin(radians(pos.y * 150.0)) * 150.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    vLightPos = transformPosition(worldLight, viewMatrix, mvPosition);
    
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}Aurora.fs{@}varying vec3 vPos;

uniform float time;
uniform float hue;
uniform vec3 base;
uniform float brightness;

#require(simplex3d.glsl)
#require(range.glsl)
#require(rgb2hsv.fs)

void main() {
    float noise = snoise(time + vPos * 0.00003);
    
    vec3 rgb = vec3(0.0, 0.6, 0.5);
    rgb.x = range(vPos.x, -10000.0, 10000.0, 0.0, 1.0) * 0.4;
    rgb.x += hue;
    
    vec3 aurora = hsv2rgb(rgb);
    aurora *= noise;
    aurora *= 0.25 * brightness;
    
    vec3 b = base;
    
    vec3 color = b + aurora;
    
    gl_FragColor = vec4(color, 1.0);
}{@}Aurora.vs{@}varying vec3 vPos;

void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}Snow.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec2 vUv;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform sampler2D tDeform;
uniform samplerCube tCube;
uniform vec2 uvOffset;
uniform vec3 emissive;

#require(normalmap.glsl)
#require(range.glsl)
#require(refl.fs)
#require(rgb2hsv.fs)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.2, 1.0);
    
    return light;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 5.0, vUv + uvOffset);
    
    vec4 noise = texture2D(tNoise, 5.0 * (vUv + uvOffset));
    
    float light = calculateLight(normal);
    
    float n = range(noise.r, 0.0, 1.0, 0.8, 1.0);
    
    vec3 diffuse = texture2D(tDiffuse, 2.0 * (vUv + uvOffset)).rgb;
    vec3 colorMap = texture2D(tColor, vUv).rgb;
    
    colorMap += emissive;
    
    vec3 reflectVec = reflection(vWorldPosition, normal);
    vec3 sky = envColor(tCube, reflectVec).rgb;
    
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    vec3 color = diffuse * colorMap * light * n;
    color += sky * 0.1 * reflectNoise;
    
    float deform = texture2D(tDeform, vUv).r;
    deform = clamp(range(deform, 0.3, 1.0, 0.0, 1.0), 0.0, 1.0);
    color *= range(1.0 - deform, 0.0, 1.0, 0.8, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}{@}Snow.vs{@}uniform sampler2D tNormal;
uniform sampler2D tDeform;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vWorldPosition;

#require(range.glsl)

void main() {
    vUv = uv;
    
    vec3 pos = position;
    float deform = texture2D(tDeform, uv).r;
    deform = clamp(range(deform, 0.3, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    deform *= smoothstep(950.0, 900.0, pos.x);
    deform *= smoothstep(-950.0, -900.0, pos.x);
    deform *= smoothstep(950.0, 900.0, pos.z);
    deform *= smoothstep(-950.0, -900.0, pos.z);
    
    pos += -normal * 250.0 * deform;
//    pos.y -= deform * 150.0;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}SnowCardboard.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec2 vUv;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform sampler2D tDeform;
uniform samplerCube tCube;
uniform vec2 uvOffset;
uniform vec3 emissive;

#require(normalmap.glsl)
#require(range.glsl)
#require(refl.fs)
#require(rgb2hsv.fs)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.2, 1.0);
    
    return light;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 7.0, vUv + uvOffset);
    
    float light = calculateLight(normal);
    
    vec3 diffuse = texture2D(tDiffuse, 2.0 * (vUv + uvOffset)).rgb;
    vec3 colorMap = texture2D(tColor, vUv).rgb;
    
    colorMap += emissive * 0.5;
    
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    vec3 color = diffuse * colorMap * light;
    
    float deform = texture2D(tDeform, vUv).r;
    deform = clamp(range(deform, 0.3, 1.0, 0.0, 1.0), 0.0, 1.0);
    color *= range(1.0 - deform, 0.0, 1.0, 0.8, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}{@}SnowCardboard.vs{@}uniform sampler2D tNormal;
uniform sampler2D tDeform;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vWorldPosition;

#require(range.glsl)

void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    //    pos.y -= deform * 150.0;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}SnowOculus.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec2 vUv;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform sampler2D tDeform;
uniform samplerCube tCube;
uniform vec2 uvOffset;
uniform vec3 emissive;

#require(normalmap.glsl)
#require(range.glsl)
#require(refl.fs)
#require(rgb2hsv.fs)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.2, 1.0);
    
    return light;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 5.0, vUv + uvOffset);
    
    vec4 noise = texture2D(tNoise, 5.0 * (vUv + uvOffset));
    
    float light = calculateLight(normal);
    
    float n = range(noise.r, 0.0, 1.0, 0.8, 1.0);
    
    vec3 diffuse = texture2D(tDiffuse, 2.0 * (vUv + uvOffset)).rgb;
    vec3 colorMap = texture2D(tColor, vUv).rgb;
    
    colorMap += emissive * 0.6;
    
    vec3 reflectVec = reflection(vWorldPosition, normal);
    vec3 sky = envColor(tCube, reflectVec).rgb;
    
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    vec3 color = diffuse * colorMap * light * n;
    color += sky * 0.12 * reflectNoise;
    
    gl_FragColor = vec4(color, 1.0);
}{@}SnowOculus.vs{@}uniform sampler2D tNormal;
uniform sampler2D tDeform;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vWorldPosition;

#require(range.glsl)

void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}SnowSimple.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec2 vUv;
varying vec3 vTransformedNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform sampler2D tDeform;
uniform samplerCube tCube;
uniform vec2 uvOffset;
uniform vec3 emissive;

#require(normalmap.glsl)
#require(range.glsl)
#require(refl.fs)
#require(rgb2hsv.fs)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    light = range(light, 0.0, 1.0, 0.2, 1.0);
    
    return light;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 5.0, vUv + uvOffset);

    float light = calculateLight(normal);
    
    vec3 diffuse = texture2D(tDiffuse, 2.0 * (vUv + uvOffset)).rgb;
    vec3 colorMap = texture2D(tColor, vUv).rgb;
    
    colorMap += emissive;
    
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    vec3 color = diffuse * colorMap * light;
    
    float deform = texture2D(tDeform, vUv).r;
    deform = clamp(range(deform, 0.3, 1.0, 0.0, 1.0), 0.0, 1.0);
    color *= range(1.0 - deform, 0.0, 1.0, 0.8, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}{@}SnowSimple.vs{@}uniform sampler2D tNormal;
uniform sampler2D tDeform;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vWorldPosition;

#require(range.glsl)

void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    float deform = texture2D(tDeform, uv).r;
    deform = clamp(range(deform, 0.3, 1.0, 0.0, 1.0), 0.0, 1.0);
    
    deform *= smoothstep(950.0, 900.0, pos.x);
    deform *= smoothstep(-950.0, -900.0, pos.x);
    deform *= smoothstep(950.0, 900.0, pos.z);
    deform *= smoothstep(-950.0, -900.0, pos.z);
    
    pos += -normal * 250.0 * deform;
//    pos.y -= deform * 150.0;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}Soil.fs{@}#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform sampler2D tDiffuse0;
uniform sampler2D tDiffuse1;
uniform sampler2D tNoise;
uniform sampler2D tNormal;
uniform sampler2D tColor;
uniform vec3 diffuse;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vLightPos;

#require(normalmap.glsl)
#require(range.glsl)

float calculateLight(vec3 normal) {
    vec3 lightPos = vec3(0.0, 1000.0, 1000.0);
    float light = max(dot(normalize(lightPos), normal), 0.0);
    return light;
}

float calculateWorldLight(vec3 lightPos, vec3 normal) {
    float light = max(dot(normalize(lightPos), normal), 0.0);
    return light * 0.03;
}

void main() {
    vec3 normal = unpackNormal(-vViewPosition, vTransformedNormal, tNormal, 1.0, 1.0, vUv);

    float n = texture2D(tNoise, vUv).r;
    
    vec3 diffuse0 = texture2D(tDiffuse0, vUv).rgb;
    vec3 diffuse1 = texture2D(tDiffuse1, vUv).rgb;
    
    vec3 color = mix(diffuse0, diffuse1, n);
    
    color *= diffuse * 1.2;
    
    vec2 uv = vUv;
    uv.y = range(uv.y, 1.0, 0.0, 0.2, 0.6);
    vec3 skyColor = texture2D(tColor, uv).rgb;
    
    color += skyColor * 0.2;
    
    color *= calculateLight(normal);
    
    color += calculateWorldLight(vLightPos, normal);
    
    gl_FragColor = vec4(color, 1.0);
}{@}Soil.vs{@}varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vLightPos;

uniform sampler2D tNormal;
uniform float variation;
uniform vec3 worldLight;

#require(transforms.glsl)

void main() {
    vec3 pos = position;
    
    pos.y += step(195.0, pos.y) * sin(radians(uv.x * variation)) * cos(radians(uv.x * variation)) * 50.0;
    
    float disturb = texture2D(tNormal, uv).g;
    vec3 offset = normalize(pos) * disturb * 50.0;
    offset *= step(-195.0, pos.y) * (1.0 - step(195.0, pos.y));
    pos += offset;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    vLightPos = transformPosition(worldLight, viewMatrix, mvPosition);
    
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
}{@}Stars.fs{@}uniform sampler2D tFlare;
uniform sampler2D tCenter;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    
    vec3 color = texture2D(tFlare, uv).rgb * vColor;
    color += texture2D(tCenter, uv).rgb * 0.5;
    
    gl_FragColor = vec4(color, vAlpha);
}{@}Stars.vs{@}uniform float size;
uniform vec2 resolution;
uniform sampler2D tMap;

attribute float scale;

varying vec3 vColor;
varying float vAlpha;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.x, -resolution.x, resolution.x, 0.0, 1.0);
    uv.y = range(position.y, -resolution.y, resolution.y, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    vColor = texture2D(tMap, getUVFromPos()).rgb;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float cameraDist = length(cameraPosition - worldPos.xyz);
    vAlpha = smoothstep(4000.0, 5500.0, cameraDist);
}