#define SHADER_NAME Wagner.ZoomBlur

uniform sampler2D tInput;
uniform vec2 center;
uniform vec2 resolution;
varying vec2 vUv;
uniform sampler2D bias;
uniform float amount;

float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

void main(){
	vec4 color=vec4(0.0);
	float total=0.0;
	float strength = amount * .5 * texture2D( bias, vUv ).r;
	vec2 toCenter=(vec2(.5)-vUv )*resolution;
	float offset=random(vec3(12.9898,78.233,151.7182),0.0);
	for(float t=0.0;t<=40.0;t++){
		float percent=(t+offset)/40.0;
		float weight=4.0*(percent-percent*percent);
		vec4 sample=texture2D(tInput,vUv+toCenter*percent*strength/resolution);
		sample.rgb*=sample.a;
		color+=sample*weight;
		total+=weight;
	}

	vec4 base = texture2D( tInput, vUv );
	vec4 blend = color/total;
	gl_FragColor = base + blend;
	//gl_FragColor= texture2D( tInput, vUv ) + color/total;
	gl_FragColor.rgb/=gl_FragColor.a+0.00001;
}
