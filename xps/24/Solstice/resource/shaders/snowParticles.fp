uniform vec3 uColorSky;
uniform vec3 uColorSnow;

uniform sampler2D uTex;
varying float vTime;
varying vec3 vPosWorld;
varying float vDistToCamera;

void main() {

	vec2 uv = gl_PointCoord;

	vec4 texColor = texture2D(uTex, gl_PointCoord);
	float fogCoeff = clamp(vDistToCamera*0.003,0.0,1.0);

	float len = length( uv*2.0-vec2(1.0) );
	texColor.xyz = mix( vec3(1.0), texColor.xyz*uColorSnow, smoothstep( 0.0, 0.25, len ));
	texColor.xyz = mix( texColor.xyz, uColorSky, fogCoeff );

	gl_FragColor = texColor;//vec4(gl_PointCoord, 0.0, 1.0);
}