uniform sampler2D tDiffuse;
uniform sampler2D tColor;
uniform vec3 diffuse;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;
    vec3 sky = texture2D(tColor, vUv).rgb;
    
    color *= diffuse;
    color += sky * 0.3;
    
    gl_FragColor = vec4(color, texel.a);
}