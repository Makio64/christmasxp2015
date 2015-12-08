#define saturate(a) clamp( a, 0.2, 1.0 )

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
//lightDir = normalize(lightPos)