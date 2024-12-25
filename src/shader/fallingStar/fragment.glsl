uniform vec3 color;
uniform float opacity;
uniform float time;

varying float vLifetime;

void main(){
  vec2 center=gl_PointCoord-vec2(.5);
  float dist=length(center);
  
  // 创建星星形状
  float strength=1.-smoothstep(0.,.4,dist);
  
  // 闪烁效果
  float fastTwinkle=sin(vLifetime*15.)*.5+.5;
  float slowTwinkle=sin(vLifetime*5.)*.5+.5;
  float twinkle=fastTwinkle*slowTwinkle;
  
  // 消失效果
  float fade=1.-smoothstep(5.,6.,vLifetime);
  
  // 增强发光效果
  vec3 finalColor=color*(strength*(1.+twinkle*.5));
  finalColor+=vec3(1.,1.,.8)*pow(1.-dist,3.)*twinkle;
  float alpha=strength*fade*opacity;
  
  gl_FragColor=vec4(finalColor,alpha);
}