// ADDED BY DEFAULT BY THREEJS
//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//#define FLIP_SIDED
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

uniform sampler2D map;
uniform float time;

varying vec2 vUv;

void main() {
    vec4 image = texture2D(map, vUv);
    gl_FragColor = image;
}
