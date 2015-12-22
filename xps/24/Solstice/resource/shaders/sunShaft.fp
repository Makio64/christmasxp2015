/*
"uniform mat4 viewMatrix;",
"uniform vec3 cameraPosition;",
*/

uniform sampler2D uTex;
uniform float uShaftAlpha;

varying float vTime;
varying vec2 vUV;
varying vec3 vRandData;

void main() {

	vec2 uv = vec2( vUV.x*0.9, vTime*0.05 );
	vec4 texColor = texture2D(uTex, uv);
	
	float shaftVal = pow(texColor.x, 2.0);
	shaftVal *= 1.0-smoothstep( 0.0, 1.0, length(vUV*2.0-vec2(1.0)));


	//gl_FragColor = vec4(vUV,0.0,1.0);
	gl_FragColor = vec4(vec3(1.0,1.0,0.7), shaftVal*uShaftAlpha);
}