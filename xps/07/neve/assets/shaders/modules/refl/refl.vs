vec3 inverseTransformDirection(in vec3 normal, in mat4 matrix) {
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
}