varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tInput2;
uniform float amount;

void main() {

	vec4 res = mix( texture2D( tInput2, vUv ), texture2D( tInput, vUv ), .5 );
	if( length( res.xyz ) < .1 ) res.xyz = vec3( 0. );
	res.g = res.b = 0.;
	
	gl_FragColor = res;

}