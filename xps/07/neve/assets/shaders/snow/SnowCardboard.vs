uniform sampler2D tNormal;
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
}