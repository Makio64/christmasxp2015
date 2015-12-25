varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;
uniform float amount;

void main() {

	float i = texture2D( bias, vUv ).r;

	vec2 coord = vUv;
	coord.x = mix( coord.x, 1. - coord.x, amount * i );
	vec4 c = texture2D( tInput, coord );
	
	gl_FragColor = c;
	gl_FragColor.a = 1.;
	
}
