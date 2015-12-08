varying vec3 vReflect;
varying vec2 vUv;
varying vec3 vPos;

#require(refl.vs)

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vReflect = refraction(worldPosition, 0.9);
    
    vUv = uv;
    vPos = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}