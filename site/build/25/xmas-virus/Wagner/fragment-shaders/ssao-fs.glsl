#extension GL_OES_standard_derivatives : enable

varying vec2 vUv;
uniform sampler2D tDepth;
uniform sampler2D tInput;
uniform vec2 resolution;
uniform float isPacked;
uniform float onlyOcclusion;
uniform sampler2D noiseTexture;

uniform mat4 invProjMat;

/*float unpack_depth(const in vec4 color) {
	return color.r;
	//return ( color.r * 256. * 256. * 256. + color.g * 256. * 256. + color.b * 256. + color.a ) / ( 256. * 256. * 256. );
}*/

float unpack_depth( const in vec4 rgba_depth ) {
	const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
	float depth = dot( rgba_depth, bit_shift );
	return depth;
}

vec3 position_from_depth( vec2 vTexCoord ) {
	
	// Get the depth value for this pixel
    float z = unpack_depth( texture2D(tDepth, vTexCoord) );  
    // Get x/w and y/w from the viewport position
    float x = vTexCoord.x * 2. - 1.;
    float y = (1. - vTexCoord.y) * 2. - 1.;
    vec4 vProjectedPos = vec4(x, y, z, 1.);
    // Transform by the inverse projection matrix
    vec4 vPositionVS = invProjMat * vProjectedPos;  
    // Divide by w to get the view-space position
    vec3 res = vPositionVS.xyz / vPositionVS.w;  
    return res;

}

vec3 normal_from_depth(float depth, vec2 texcoords) {
  
  /*vec2 offset1 = vec2( 0.0, 1. / resolution.y );
  vec2 offset2 = vec2( 1. / resolution.x, 0.0 );
  
  float depth1 = unpack_depth( texture2D( tDepth, texcoords + offset1 ) );
  float depth2 = unpack_depth( texture2D( tDepth, texcoords + offset2 ) );
  
  vec3 p1 = vec3(offset1, depth1 - depth);
  vec3 p2 = vec3(offset2, depth2 - depth);
  
  vec3 normal = cross(p1, p2);
  normal.z = -normal.z;
  
  return normalize(normal);*/

  vec3 p = position_from_depth( texcoords.xy ).xyz;
  vec3 p1 = normalize(dFdx( p ));
  vec3 p2 = normalize(dFdy( p ));

  return cross( p1, p2 );

}

void main() {

	const float total_strength = 1.0;
	const float base = 0.2;

	const float area = 0.0075;
	const float falloff = 0.00001;

	const float radius = 0.02;

	const int samples = 16;
	vec3 sample_sphere[ 16 ];
	sample_sphere[ 0 ] = vec3( 0.5381, 0.1856,-0.4319);
	sample_sphere[ 1 ] = vec3( 0.1379, 0.2486, 0.4430);
	sample_sphere[ 2 ] = vec3( 0.3371, 0.5679,-0.0057);
	sample_sphere[ 3 ] = vec3(-0.6999,-0.0451,-0.0019);
	sample_sphere[ 4 ] = vec3( 0.0689,-0.1598,-0.8547);
	sample_sphere[ 5 ] = vec3( 0.0560, 0.0069,-0.1843);
	sample_sphere[ 6 ] = vec3(-0.0146, 0.1402, 0.0762);
	sample_sphere[ 7 ] = vec3( 0.0100,-0.1924,-0.0344);
	sample_sphere[ 8 ] = vec3(-0.3577,-0.5301,-0.4358);
	sample_sphere[ 9 ] = vec3(-0.3169, 0.1063, 0.0158);
	sample_sphere[ 10 ] = vec3( 0.0103,-0.5869, 0.0046);
	sample_sphere[ 11 ] = vec3(-0.0897,-0.4940, 0.3287);
	sample_sphere[ 12 ] = vec3( 0.7119,-0.0154,-0.0918);
	sample_sphere[ 13 ] = vec3(-0.0533, 0.0596,-0.5411);
	sample_sphere[ 14 ] = vec3( 0.0352,-0.0631, 0.5460);
	sample_sphere[ 15 ] = vec3(-0.4776, 0.2847,-0.0271);

	vec3 random = normalize( texture2D( noiseTexture, vUv * 4.0).rgb );

	float depth = unpack_depth( texture2D(tDepth, vUv) );

	vec3 position = vec3(vUv, depth);
	vec3 normal = normal_from_depth(depth, vUv);

	float radius_depth = radius/depth;
	float occlusion = 0.0;
	for(int i=0; i < samples; i++) {

		vec3 ray = radius_depth * reflect(sample_sphere[i], random);
		vec3 hemi_ray = position + sign(dot(ray,normal)) * ray;

		float occ_depth = unpack_depth( texture2D(tDepth, clamp(hemi_ray.xy, vec2(0.),vec2(1.))) );
		float difference = depth - occ_depth;

		occlusion += step(falloff, difference) * (1.0-smoothstep(falloff, area, difference));
	}

	float ao = 1.0 - total_strength * occlusion * (1.0 / float(samples ));
	gl_FragColor.rgb = vec3( clamp(ao + base, 0., 1. ) );
	gl_FragColor.a = 1.;
	if( onlyOcclusion == 0. ) gl_FragColor = texture2D( tInput, vUv );
	
	//gl_FragColor.rgb = .5 + .5 * normal;
	//gl_FragColor.rgb = position_from_depth( vUv );
	//gl_FragColor = vec4( vec3( depth ), 1. );
	gl_FragColor = texture2D( tInput, vUv );

}