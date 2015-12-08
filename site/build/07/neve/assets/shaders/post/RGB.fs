varying vec2 vUv;

uniform sampler2D tDiffuse;

#require(rgbshift.fs)

void main() {
    gl_FragColor = getRGB(tDiffuse, vUv, 0.1, 0.0007);
}