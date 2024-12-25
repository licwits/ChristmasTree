uniform float time;
uniform float size;

attribute float scale;
attribute float lifetime;
attribute vec3 velocity;

varying float vLifetime;

void main(){
  vLifetime=lifetime;
  
  // 更新位置
  vec3 pos=position+velocity*lifetime;
  
  vec4 mvPosition=modelViewMatrix*vec4(pos,1.);
  
  // 大小随距离变化
  gl_PointSize=size*scale*(800./-mvPosition.z);
  
  gl_Position=projectionMatrix*mvPosition;
}