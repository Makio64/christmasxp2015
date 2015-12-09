#ifdef GL_OES_standard_derivatives
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
}