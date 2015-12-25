uniform sampler2D tSource;
uniform sampler2D tInput;
varying vec2 vUv;

uniform float f;
uniform vec3 dimensions;

void main() {

	vec4 c;
	if( f != 0. ) {
		c = mix( texture2D( tInput, vUv ), texture2D( tSource, vUv ), f );
	} else {
		c = texture2D( tInput, vUv );

		float x = mod( vUv.x * dimensions.x * dimensions.z, dimensions.x ) / dimensions.x;
		float y = vUv.y;
		float z = floor( vUv.x * dimensions.z ) / dimensions.z;

		float ix = 1. / ( dimensions.x * dimensions.z );
		float iy = 1. / dimensions.y;

		float a1 = texture2D( tInput, vUv + vec2( -ix, -iy ) ).r;
		float a2 = texture2D( tInput, vUv + vec2(  0., -iy ) ).r;
		float a3 = texture2D( tInput, vUv + vec2(  ix, -iy ) ).r;

		float a4 = texture2D( tInput, vUv + vec2( -ix,  0. ) ).r;
		float a6 = texture2D( tInput, vUv + vec2(  ix,  0. ) ).r;
		
		float a7 = texture2D( tInput, vUv + vec2( -ix,  iy ) ).r;
		float a8 = texture2D( tInput, vUv + vec2(  0.,  iy ) ).r;
		float a9 = texture2D( tInput, vUv + vec2(  ix,  iy ) ).r;

		int s = 0;
		if( a1 == 1. ) s++;
		if( a2 == 1. ) s++;
		if( a3 == 1. ) s++;
		if( a4 == 1. ) s++;
		if( a6 == 1. ) s++;
		if( a7 == 1. ) s++;
		if( a8 == 1. ) s++;
		if( a9 == 1. ) s++;

		float res = 0.;
		if( s < 2 ) res = 0.;
		if( s > 3 ) res = 0.;
		if( s == 3 ) res = 1.;
		if( s >= 2 && s <= 3 ) res = c.r;
		
		c = vec4( res, 0., 0., 1. );
		//float x = mod( vUv.u * dimensions.x * dimensions.z, dimensions.x ) / dimensions.x;
		//c = vec3( x, 0., 0. );
		
	} 

	gl_FragColor = c;

}