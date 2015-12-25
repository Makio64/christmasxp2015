varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;

void main() {

	float i = texture2D( bias, vUv ).r;

	vec3 c = texture2D( tInput, vUv ).rgb;
	vec3 luma = vec3( .299, 0.587, 0.114 );
	vec3 bw = vec3( dot( c, luma ) );

	gl_FragColor = vec4( mix( c, bw, i ), 1. );
	
}
