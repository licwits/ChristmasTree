uniform float time;
uniform float size;

attribute float scale;
attribute float lifetime;
attribute vec3 velocity;

varying vec2 vUv;
varying float vScale;
varying float vLifetime;

void main(){
  vUv=uv;
  vScale=scale;
  
  // 计算粒子当前生命周期
  float t=mod(time+lifetime,1.);
  vLifetime=t;
  
  // 根据生命周期和速度更新位置
  vec3 pos=position+velocity*t*2.;
  
  vec4 mvPosition=modelViewMatrix*vec4(pos,1.);
  
  // 粒子大小随生命周期变化
  float fadeIn=smoothstep(0.,.1,t);
  float fadeOut=1.-smoothstep(.5,1.,t);
  gl_PointSize=size*scale*(fadeIn*fadeOut)*(300./-mvPosition.z);
  
  gl_Position=projectionMatrix*mvPosition;
}