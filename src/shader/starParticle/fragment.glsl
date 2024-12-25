uniform vec3 color;
uniform float opacity;
uniform float glowSize;

varying vec2 vUv;
varying float vScale;
varying float vLifetime;

void main(){
  vec2 center=gl_PointCoord-vec2(.5);
  float dist=length(center);
  
  // 创建柔和的圆形
  float strength=1.-smoothstep(0.,.5,dist);
  
  // 根据生命周期调整透明度
  float fadeIn=smoothstep(0.,.1,vLifetime);
  float fadeOut=1.-smoothstep(.5,1.,vLifetime);
  float alpha=strength*fadeIn*fadeOut*opacity;
  
  // 发光效果
  vec3 finalColor=color*strength;
  finalColor+=color*.5*(1.-dist);
  
  gl_FragColor=vec4(finalColor,alpha);
}