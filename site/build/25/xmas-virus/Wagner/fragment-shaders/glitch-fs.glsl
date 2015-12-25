
// https://www.shadertoy.com/view/Md2GDw

uniform sampler2D tInput;
uniform vec2 resolution;
uniform float time;
uniform sampler2D tNoise;

varying vec2 vUv;


void main() {

	vec2 uv = vUv;

	vec2 block = floor( gl_FragCoord.xy / vec2( 16 ) );
	vec2 uv_noise = block / vec2( 64 );


	uv_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64);

	float block_thresh = pow(fract(time * 1236.0453), 2.0) * 0.2;
	float line_thresh = pow(fract(time * 2236.0453), 3.0) * 0.7;

	vec2 uv_r = uv, uv_g = uv, uv_b = uv;

	// glitch some blocks and lines
	if (texture2D(tNoise, uv_noise).r < block_thresh ||
		texture2D(tNoise, vec2(uv_noise.y, 0.0)).g < line_thresh) {

		vec2 dist = (fract(uv_noise) - 0.5) * 0.3;
		uv_r += dist * 0.1;
		uv_g += dist * 0.2;
		uv_b += dist * 0.125;
	}

	gl_FragColor.r = texture2D(tInput, uv_r).r;
	gl_FragColor.g = texture2D(tInput, uv_g).g;
	gl_FragColor.b = texture2D(tInput, uv_b).b;
	gl_FragColor = vec4( gl_FragColor.rgb, 1.0 );

	// loose luma for some blocks
	if ( texture2D( tNoise, uv_noise ).g < block_thresh ) {

		gl_FragColor.rgb = gl_FragColor.ggg;
	}

	// discolor block lines
	if ( texture2D( tNoise, vec2( uv_noise.y, 0.0 ) ).b * 3.5 < line_thresh ) {

		gl_FragColor.rgb = vec3( 0.0, dot( gl_FragColor.rgb, vec3( 1.0 ) ), 0.0 );
	}

	// interleave lines in some blocks
	if ( texture2D( tNoise, uv_noise ).g * 1.5 < block_thresh || texture2D( tNoise, vec2( uv_noise.y, 0.0 ) ).g * 2.5 < line_thresh ) {

		float line = fract( gl_FragCoord.y / 3.0 );
		vec3 mask = vec3( 3.0, 0.0, 0.0 );

		if ( line > 0.333 ) mask = vec3( 0.0, 3.0, 0.0 );
		if ( line > 0.666 ) mask = vec3( 0.0, 0.0, 3.0 );

		gl_FragColor.xyz *= mask;
	}
}