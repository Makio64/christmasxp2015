//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 0
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;


uniform sampler2D map;
uniform sampler2D depth;
uniform float fStrength;
uniform float time;
uniform float focus;
//uniform vec2 uResolution;

varying vec2 vUv;

#require(range.glsl)

#define ITERATIONS 10
#define TAU 6.28318530718

highp float random(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

//Use last part of hash function to generate new random radius and angle
vec2 mult(inout vec2 r) {
    r = fract(r * vec2(12.9898,78.233));
    return sqrt(r.x + .001) * vec2(sin(r.y * TAU), cos(r.y * TAU));
}

vec3 sample(vec2 uv) {
    return texture2D(map, uv).rgb;
}

vec3 blur(vec2 uv, float radius, float aspect, float offset) {
    vec2 circle = vec2(radius);
    circle.x *= aspect;
    vec2 rnd = vec2(random(vec2(uv + offset)));

    vec3 acc = vec3(0.0);
    for (int i = 0; i < ITERATIONS; i++) {
        acc += sample(uv + circle * mult(rnd)).xyz;
    }
    return acc / float(ITERATIONS);
}

void main() {
    vec3 color = vec3(0.0);

    vec2 uv = vUv;
    uv.x = 1.0 - uv.x;

    float strength = 0.001 * fStrength * abs(texture2D(depth, uv).r - focus);

    //jitter the noise but not every frame
    float tick = floor(fract(time * 0.001) * 20.0);
    float jitter = mod(tick * 382.0231, 21.321);

    //apply blur
    vec3 tex = blur(uv, strength, 1.0, jitter);
    gl_FragColor.rgb = tex;
    gl_FragColor.a = 1.0;
}