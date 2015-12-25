#define SHADER_NAME Wagner.Copy

varying vec2 vUv;
uniform sampler2D tInput;

void main() {

	gl_FragColor = texture2D( tInput, vUv );

}