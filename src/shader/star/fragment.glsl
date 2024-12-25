uniform vec3 color;
uniform vec3 glowColor;
uniform float glowStrength;
uniform float glowRange;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main(){
  // 计算视线方向
  vec3 viewDir=normalize(vViewPosition);
  
  // 基础发光效果
  float glow=pow(.8-dot(vNormal,viewDir),3.);
  
  // 边缘发光
  float fresnel=pow(1.-abs(dot(vNormal,viewDir)),3.);
  
  // 脉冲动画
  float pulse=.8+.2*sin(time*2.);
  
  // 从中心向外的渐变
  float dist=length(vPosition.xy);
  float centerGlow=1.-smoothstep(0.,glowRange,dist);
  
  // 合并所有发光效果
  float brightness=(glow+fresnel*glowStrength+centerGlow)*pulse;
  
  // 混合基础颜色和发光颜色
  vec3 finalColor=mix(color,glowColor,fresnel*.5+centerGlow*.3);
  finalColor*=brightness;
  
  // 添加闪烁效果
  float sparkle=pow(sin(time*5.+dist*10.)*.5+.5,2.)*.3;
  finalColor+=glowColor*sparkle;
  
  gl_FragColor=vec4(finalColor,brightness);
}