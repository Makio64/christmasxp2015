uniform sampler2D tFlare;
uniform sampler2D tCenter;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    
    vec3 color = texture2D(tFlare, uv).rgb * vColor;
    color += texture2D(tCenter, uv).rgb * 0.5;
    
    gl_FragColor = vec4(color, vAlpha);
}