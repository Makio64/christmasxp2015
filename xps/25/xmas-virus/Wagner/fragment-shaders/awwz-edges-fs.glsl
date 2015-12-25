uniform sampler2D tInput;
uniform vec2 resolution;
varying vec2 vUv;
uniform sampler2D bias;
uniform float amount;

void main(void) {

	float x = 1.0 / resolution.x;
	float y = 1.0 / resolution.y;
	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= texture2D( tInput, vec2( vUv.x - x, vUv.y - y ) ) * 1.0;
	horizEdge -= texture2D( tInput, vec2( vUv.x - x, vUv.y     ) ) * 2.0;
	horizEdge -= texture2D( tInput, vec2( vUv.x - x, vUv.y + y ) ) * 1.0;
	horizEdge += texture2D( tInput, vec2( vUv.x + x, vUv.y - y ) ) * 1.0;
	horizEdge += texture2D( tInput, vec2( vUv.x + x, vUv.y     ) ) * 2.0;
	horizEdge += texture2D( tInput, vec2( vUv.x + x, vUv.y + y ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= texture2D( tInput, vec2( vUv.x - x, vUv.y - y ) ) * 1.0;
	vertEdge -= texture2D( tInput, vec2( vUv.x    , vUv.y - y ) ) * 2.0;
	vertEdge -= texture2D( tInput, vec2( vUv.x + x, vUv.y - y ) ) * 1.0;
	vertEdge += texture2D( tInput, vec2( vUv.x - x, vUv.y + y ) ) * 1.0;
	vertEdge += texture2D( tInput, vec2( vUv.x    , vUv.y + y ) ) * 2.0;
	vertEdge += texture2D( tInput, vec2( vUv.x + x, vUv.y + y ) ) * 1.0;
	vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));
	
	vec4 c = texture2D( tInput, vUv );
	float b = texture2D( bias, vUv ).r;
	gl_FragColor = c;
	gl_FragColor.rgb += amount * edge * b;

}