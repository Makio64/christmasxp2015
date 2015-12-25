varying vec2 vUv;

uniform sampler2D tInput;
uniform vec2 resolution;

uniform sampler2D tDepth;
uniform mat4 viewProjectionInverseMatrix;
uniform mat4 previousViewProjectionMatrix;
uniform float velocityFactor;
uniform vec3 linearVelocity;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

float unpack_depth(const in vec4 color) {
	return color.r;
	//return ( color.r * 256. * 256. * 256. + color.g * 256. * 256. + color.b * 256. + color.a ) / ( 256. * 256. * 256. );
}

void main() {
	
	float zOverW = unpack_depth( texture2D( tDepth, vUv ) );

	// H is the viewport position at this pixel in the range -1 to 1.  
	vec4 H = vec4( vUv.x * 2. - 1., vUv.y * 2. - 1., zOverW, 1. );  
	// Transform by the view-projection inverse.  
	vec4 D = H * viewProjectionInverseMatrix;
	// Divide by w to get the world position.  
	vec4 worldPos = D / D.w;

	vec4 currentPos = H;
	// Use the world position, and transform by the previous view-projection matrix.  
	vec4 previousPos = worldPos * previousViewProjectionMatrix;
	// Convert to nonhomogeneous points [-1,1] by dividing by w.  
	previousPos /= previousPos.w;  
	// Use this frame's position and last frame's to compute the pixel velocity.  
	vec3 l = .1 * ( projectionMatrix * modelViewMatrix * vec4( linearVelocity, 0. ) ).xyz;
	vec2 velocity = vec2( 1. / 100000000000. );//l.xy;

	vec4 finalColor = vec4( 0. );
	vec2 offset = vec2( 0. ); 
	float weight = 0.;
	const int samples = 20;
	for( int i = 0; i < samples; i++ ) {  
			offset = velocity * ( float( i ) / ( float( samples ) - 1. ) - .5 );
			vec4 c = texture2D( tInput, vUv + offset );
		finalColor += c;
	}  
	//finalColor /= .5 * float( samples );
	gl_FragColor = vec4( finalColor.rgb, 1. );
	//gl_FragColor = vec4( velocity, 0., 1. );
	//gl_FragColor = vec4( vec3( zOverW ), 1. );
	//gl_FragColor = vec4( .5 + .5 * l, 1. );

}
