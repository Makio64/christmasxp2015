/*
"uniform mat4 viewMatrix;",
"uniform vec3 cameraPosition;",
*/

varying vec3 vColor;
varying vec3 vNormal;


void main() {
	gl_FragColor = vec4(vColor,1.0);
}