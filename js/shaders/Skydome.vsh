uniform mat4 u_worldViewProjection;

attribute vec4 a_position;
attribute vec3 a_vertcolor;
attribute vec2 a_texcoord;

varying vec3 v_vertcolor;
varying vec2 v_texCoord;

void main() {
  v_vertcolor = a_vertcolor;
  v_texCoord = a_texcoord;
  gl_Position = (u_worldViewProjection * a_position);
}