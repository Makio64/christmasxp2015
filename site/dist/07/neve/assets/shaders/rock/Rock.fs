#ifdef GL_OES_standard_derivatives
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
}