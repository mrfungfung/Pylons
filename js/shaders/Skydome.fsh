precision mediump float;

varying vec3 v_vertcolor;
varying vec2 v_texCoord;

uniform sampler2D u_diffuse;

void main() {
  vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
  gl_FragColor = diffuseColor;
}