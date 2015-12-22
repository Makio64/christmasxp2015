uniform float uVignetteAlpha;
uniform float uVignetteRadius;
uniform float uFadeAlpha;
uniform vec3 uFadeColor;

varying vec2 vUv;

void main() {
	vec4 filterColor = vec4(vUv,1.0,0.05);

	float vigCoeff = smoothstep( uVignetteRadius, 1.6, length(vUv*2.0 - vec2(1.0))) * uVignetteAlpha;
	//filterColor = vec4(0.0,0.0,0.0, vigCoeff);
	filterColor = mix( filterColor, vec4(0.0,0.0,0.0,1.0), vigCoeff );

	filterColor.xyz = mix( filterColor.xyz, uFadeColor.xyz, uFadeAlpha );
	filterColor.w = mix( filterColor.w, uFadeAlpha, uFadeAlpha );
	//filterColor.w = 1.0;

  	gl_FragColor = filterColor; 
}