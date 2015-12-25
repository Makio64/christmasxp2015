varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tInput2;
uniform float amount;

void main() {

	vec4 color = texture2D( tInput, vUv );
	float shadow = texture2D( tInput2, vUv ).r;
	float r = .75;
	vec4 res = clamp( color - r * shadow, vec4( 0. ), vec4( 1. ) ); //mix( color, .5 * vec4( 255., 22., 28., 255. ) / 255. * color, 1. - shadow );
	res = color * shadow;
	gl_FragColor.rgb = res.rgb;
	gl_FragColor.a = color.a;

}