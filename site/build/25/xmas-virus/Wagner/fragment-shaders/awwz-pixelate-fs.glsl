varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D bias;
uniform vec2 delta;
uniform vec2 resolution;

void main() {

	float i = texture2D( bias, vUv ).r;

	float total = 640.;
	float parts = 160.;
	float amount =( 640. - parts );

	float d = 1.0 / amount;
	float ar = resolution.x / resolution.y;
	float u = floor( vUv.x / d ) * d;
	d = ar / amount;
	float v = floor( vUv.y / d ) * d;

	float influence = texture2D( bias, vec2( u, v ) ).r;

	amount = total - influence * ( total - parts );

	d = 1.0 / amount;
	ar = resolution.x / resolution.y;
	u = floor( vUv.x / d ) * d;
	d = ar / amount;
	v = floor( vUv.y / d ) * d;

	gl_FragColor = texture2D( tInput, vec2( u, v ) );

	gl_FragColor.a = 1.;

}
