#ifdef GL_OES_standard_derivatives
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
}