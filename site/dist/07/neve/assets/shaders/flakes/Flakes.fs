uniform sampler2D tMap;

varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 texel = texture2D(tMap, uv);
    
    texel.a *= vAlpha * 0.8;
    
    gl_FragColor = texel;
}