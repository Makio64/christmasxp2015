uniform sampler2D tInput;
uniform vec2 resolution;

uniform sampler2D tInput1;
uniform sampler2D tInput2;
uniform sampler2D tInput3;

uniform sampler2D tDepth1;
uniform sampler2D tDepth2;
uniform sampler2D tDepth3;

varying vec2 vUv;

void main( void ) {

	vec4 col1 = gl_FragColor = texture2D( tInput1, vUv );
	vec4 col2 = gl_FragColor = texture2D( tInput2, vUv );
	vec4 col3 = gl_FragColor = texture2D( tInput3, vUv );

	float depth1 = texture2D( tDepth1, vUv ).r * col1.a;
	float depth2 = texture2D( tDepth2, vUv ).r * col2.a;
	float depth3 = texture2D( tDepth3, vUv ).r * col3.a;

	if( depth1 >= depth2 ) {
		if( depth1 >= depth3 ) {
			gl_FragColor = col1;
		} else {
			gl_FragColor = col3;
		}
	} else {
		if( depth2 >= depth3 ) {
			gl_FragColor = col2;
		} else {
			gl_FragColor = col3;
		}
	}

}