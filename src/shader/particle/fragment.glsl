uniform vec3 color;
uniform float time;
uniform float opacity;
uniform float glowSize;

varying vec2 vUv;
varying float vScale;

// 添加彩虹色函数
vec3 rainbow(float t){
  vec3 c=.5+.5*cos(6.28318*(t+vec3(0.,.33,.67)));
  return mix(vec3(1.),c,.7);
}

// 添加柔和圆形函数
float softCircle(vec2 uv,float radius,float softness){
  float dist=length(uv);
  return 1.-smoothstep(radius-softness,radius+softness,dist);
}

void main(){
  // 计算到粒子中心的距离，并归一化
  vec2 center=gl_PointCoord-vec2(.5);
  float dist=length(center);
  
  // 创建多层柔和圆形，使用 glowSize 控制发光范围
  float mainGlow=softCircle(center,.35*glowSize,.3*glowSize);
  float innerGlow=softCircle(center,.2*glowSize,.1*glowSize);
  float coreGlow=softCircle(center,.1*glowSize,.05*glowSize);
  
  // 基于位置和时间的彩虹色
  float colorTime=time*.5+vScale*5.;
  vec3 rainbowColor=rainbow(colorTime);
  
  // 增强闪烁效果
  float sparkle=sin(time*3.+vScale*10.)*.5+.5;
  sparkle*=sin(time*2.+vScale*5.)*.5+.75;
  sparkle+=sin(time*8.+vScale*20.)*.25;
  
  // 组合不同层的发光效果
  float strength=mainGlow*.5+innerGlow*.3+coreGlow*.2;
  strength*=.6+sparkle*.8;
  
  // 颜色渐变和混合
  vec3 baseColor=mix(color,rainbowColor,.8);
  vec3 finalColor=baseColor*(strength*2.);
  
  // 增强发光效果，使用更柔和的衰减
  float glow=exp(-dist*2.)*smoothstep(1.,.0,dist);
  vec3 glowColor=rainbow(colorTime+dist);
  finalColor+=glowColor*glow*1.;
  
  // 增强高光效果，使用更圆润的形状
  float highlight=pow(coreGlow,2.)*sparkle;
  finalColor+=vec3(1.)*highlight*1.;
  
  // 确保边缘完全透明
  float alpha=strength*opacity*smoothstep(1.,.7,dist);
  
  gl_FragColor=vec4(finalColor,alpha);
}