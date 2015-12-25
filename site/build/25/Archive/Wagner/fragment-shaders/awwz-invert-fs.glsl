varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;
uniform float amount;

void main() {

	float i = texture2D( bias, vUv ).r;

	vec4 c = texture2D( tInput, vUv );
	
	gl_FragColor = mix( c, 1. - c, amount * i );
	gl_FragColor.a = 1.;
	
}
