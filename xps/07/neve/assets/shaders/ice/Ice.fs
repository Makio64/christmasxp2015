#ifdef GL_OES_standard_derivatives
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
}