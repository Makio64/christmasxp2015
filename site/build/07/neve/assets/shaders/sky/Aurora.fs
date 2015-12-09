varying vec3 vPos;

uniform float time;
uniform float hue;
uniform vec3 base;
uniform float brightness;

#require(simplex3d.glsl)
#require(range.glsl)
#require(rgb2hsv.fs)

void main() {
    float noise = snoise(time + vPos * 0.00003);
    
    vec3 rgb = vec3(0.0, 0.6, 0.5);
    rgb.x = range(vPos.x, -10000.0, 10000.0, 0.0, 1.0) * 0.4;
    rgb.x += hue;
    
    vec3 aurora = hsv2rgb(rgb);
    aurora *= noise;
    aurora *= 0.25 * brightness;
    
    vec3 b = base;
    
    vec3 color = b + aurora;
    
    gl_FragColor = vec4(color, 1.0);
}