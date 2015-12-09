uniform samplerCube tCube;
uniform sampler2D tColor;
uniform sampler2D tMatcap;
uniform float alpha;

varying vec3 vReflect;
varying vec2 vUv;
varying vec3 vPos;
varying vec2 matcapUV;

#require(refl.fs)
#require(range.glsl)

void main() {
    vec3 color = envColor(tCube, vReflect).rgb;
    
    gl_FragColor.rgb = color;
    gl_FragColor.a = alpha;
    
}