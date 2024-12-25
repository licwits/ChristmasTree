uniform float time;
uniform float size;

attribute float scale;

varying vec2 vUv;
varying float vScale;

void main(){
  vUv=uv;
  vScale=scale;
  
  vec3 pos=position;
  
  vec4 mvPosition=modelViewMatrix*vec4(pos,1.);
  
  // 粒子大小随高度变化，添加呼吸效果
  float sizeScale=1.-position.y/5.;
  float breathe=1.+sin(time*2.+vScale*6.28)*.2;
  gl_PointSize=size*(sizeScale*2.+.5)*breathe*(300./-mvPosition.z);
  gl_Position=projectionMatrix*mvPosition;
}