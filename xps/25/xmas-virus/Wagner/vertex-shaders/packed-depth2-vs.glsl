//position in eye space coordinates (camera space, view space)
varying vec3 ecPosition;

void main() {
  vec4 ecPos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * ecPos;

  ecPosition = ecPos.xyz;
}