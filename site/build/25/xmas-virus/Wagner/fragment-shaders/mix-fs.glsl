uniform sampler2D tInput;
uniform sampler2D motion;
uniform vec2 resolution;
varying vec2 vUv;
float level( in float value, in float min, in float max ) {
	return min / 255.0 + ( max - min ) * value / 255.0;
}
float gamma( in float value, in float g ) {
	return pow( value, 1.0 / g );
}
void main(void) {
	
	vec3 inc = vec3( vec2( 10. ) / resolution, 0. );

	vec4 i = texture2D( tInput, vUv - inc.zy ) +
		 	 texture2D( tInput, vUv - inc.xz ) +
			// texture2D( tInput, vUv ) +
			 texture2D( tInput, vUv + inc.xz ) +
			 texture2D( tInput, vUv + inc.zy );
	//i /= 4.;
			 			 
	gl_FragColor = .2 * i + texture2D( motion, vUv );

}