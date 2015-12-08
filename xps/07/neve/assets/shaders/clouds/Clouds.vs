uniform float size;
uniform sampler2D tColor;

attribute float scale;
attribute float rotation;
attribute float opacity;

varying float vRotation;
varying float vOpacity;
varying vec3 vPos;
varying vec3 vColor;

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.z, -1000.0, 1000.0, 0.0, 1.0);
    uv.y = range(position.y, -400.0, 200.0, 0.0, 1.0);
    return uv;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (size * scale) * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
    
    float alpha = 1.0 - smoothstep(600.0, 1200.0, position.z);
    alpha *= smoothstep(-1200.0, -700.0, position.z);
    
    vRotation = rotation;
    vOpacity = opacity * alpha;
    
    vPos = position;
    
    vColor = texture2D(tColor, getUVFromPos()).rgb;
}