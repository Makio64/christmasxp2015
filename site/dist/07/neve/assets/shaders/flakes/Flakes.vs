uniform float size;
uniform sampler2D tColor;

attribute float scale;
attribute float alpha;

varying float vAlpha;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.x, -1000.0, 1000.0, 0.0, 1.0);
    uv.y = range(position.y, -1000.0, 1000.0, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    float fade = smoothstep(900.0, 600.0, position.y);
    
    vAlpha = alpha * fade;
}