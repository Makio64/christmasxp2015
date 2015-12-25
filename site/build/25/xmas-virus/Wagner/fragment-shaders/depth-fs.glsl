/*
vec4 pack_depth( const in float f ) {
	vec4 color;
	color.r = floor( f / ( 256. * 256. * 256. ) );
	color.g = floor( ( mod( f,  256. * 256. * 256. ) ) / ( 256. * 256. ) );
	color.b = floor( ( mod( f,  256. * 256. ) ) / 256. );
	color.a = floor( mod( f, 256.)  );
	return color / 256.0;
}*/

vec4 pack_depth( const in float depth ) {
	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
	const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
	vec4 res = fract( depth * bit_shift );
	res -= res.xxyz * bit_mask;
	return res;
}

void main() {
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	//float color = 1. - ( depth - mNear ) / ( mFar - mNear );
	//gl_FragColor = vec4( color, color, color, 1. );
	gl_FragColor = pack_depth( gl_FragCoord.z );//vec4( vec3( color ) ,1. );//pack_depth( color );

}