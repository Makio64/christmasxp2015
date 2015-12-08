varying vec3 vWorldPosition;
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
}