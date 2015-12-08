vec3 transformPosition(vec3 pos, mat4 viewMat, vec3 mvPos) {
    vec4 worldPosition = viewMat * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos;
}

vec3 transformPosition(vec3 pos, mat4 viewMat, vec4 mvPos) {
    vec4 worldPosition = viewMat * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}