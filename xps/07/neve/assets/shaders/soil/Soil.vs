varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformedNormal;
varying vec3 vLightPos;

uniform sampler2D tNormal;
uniform float variation;
uniform vec3 worldLight;

#require(transforms.glsl)

void main() {
    vec3 pos = position;
    
    pos.y += step(195.0, pos.y) * sin(radians(uv.x * variation)) * cos(radians(uv.x * variation)) * 50.0;
    
    float disturb = texture2D(tNormal, uv).g;
    vec3 offset = normalize(pos) * disturb * 50.0;
    offset *= step(-195.0, pos.y) * (1.0 - step(195.0, pos.y));
    pos += offset;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformedNormal = normalMatrix * normal;
    vLightPos = transformPosition(worldLight, viewMatrix, mvPosition);
    
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
}