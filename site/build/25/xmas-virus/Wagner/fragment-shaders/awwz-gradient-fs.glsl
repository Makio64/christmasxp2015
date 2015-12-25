varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;
uniform vec3 from;
uniform vec3 to;
uniform float amount;

void main() {

	float i = texture2D( bias, vUv ).r;

	vec3 c = texture2D( tInput, vUv ).rgb;
	vec3 luma = vec3( .299, 0.587, 0.114 );
	float bw = dot( c, luma );

	vec3 gradient = mix( from, to, bw );

	gl_FragColor = vec4( mix( c, gradient, amount * i ), 1. );

}
