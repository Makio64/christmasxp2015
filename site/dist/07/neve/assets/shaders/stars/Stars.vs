uniform float size;
uniform vec2 resolution;
uniform sampler2D tMap;

attribute float scale;

varying vec3 vColor;
varying float vAlpha;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.x, -resolution.x, resolution.x, 0.0, 1.0);
    uv.y = range(position.y, -resolution.y, resolution.y, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    vColor = texture2D(tMap, getUVFromPos()).rgb;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float cameraDist = length(cameraPosition - worldPos.xyz);
    vAlpha = smoothstep(4000.0, 5500.0, cameraDist);
}