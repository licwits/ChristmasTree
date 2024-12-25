varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main(){
  vNormal=normalMatrix*normal;
  vPosition=position;
  
  vec4 mvPosition=modelViewMatrix*vec4(position,1.);
  vViewPosition=-mvPosition.xyz;
  gl_Position=projectionMatrix*mvPosition;
}