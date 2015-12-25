varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;

float applyColorDodgeToChannel( float base, float blend ) {

	return ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0));

}

void main() {

	float i = texture2D( bias, vUv ).r;

	vec3 c = texture2D( tInput, vUv ).rgb;
	vec3 res = vec3(
		applyColorDodgeToChannel( c.r, c.r ),
		applyColorDodgeToChannel( c.g, c.g ),
		applyColorDodgeToChannel( c.b, c.b )
	);

	gl_FragColor = vec4( mix( c, res, i ), 1. );
	
}
