uniform sampler2D tCloud;
uniform vec3 diffuse;
uniform float alpha;

varying vec3 vColor;
varying vec3 vPos;
varying float vRotation;
varying float vOpacity;

#require(transformUV.glsl)
#require(range.glsl)

vec2 rotate(vec2 uv) {
    float r = vRotation;
    float values[9];
    values[0] = 0.0; //x
    values[1] = 0.0; //y
    values[2] = 0.0; //skewX
    values[3] = 0.0; //skewY
    values[4] = r; //rotation
    values[5] = 1.0; //scaleX
    values[6] = 1.0; //scaleY
    values[7] = 0.5; //originX
    values[8] = 0.5; //originY
    return transformUV(uv, values);
}

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    uv = rotate(uv);
    
    vec4 color = texture2D(tCloud, uv);
    
    color.rgb *= diffuse;
    
    color.rgb *= clamp(range(uv.y, 0.5, 1.0, 1.0, 0.75), 0.75, 1.0);
    color.rgb *= clamp(range(vPos.y, 0.0, -400.0, 1.0, 0.75), 0.75, 1.0);
    
    color.a *= vOpacity * alpha;
    color.a *= 0.1;
    
    color.rgb += vColor * 0.5;
    
    gl_FragColor = color;
}