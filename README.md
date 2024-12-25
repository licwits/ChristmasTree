# Three.js 粒子圣诞树 🎄

一个使用 Three.js 实现的粒子圣诞树动画效果。包含圣诞树、星星、满天星等元素，使用着色器实现绚丽的粒子效果。整个圣诞树由粒子系统构成，通过 GLSL 着色器实现炫丽的动画效果。

## 效果展示

- 粒子构建的圣诞树，带有旋转和呼吸效果
- 树顶的星星模型，周围环绕彩虹色发光粒子
- 满天星从天而降的雪花效果
- 反光地面，增强整体效果
- 可调节的参数面板，支持实时调整各种效果

## 主要特性

- 使用粒子系统构建圣诞树，支持调节数量和大小
- 多层次的粒子效果：树干粒子、星星粒子、满天星粒子
- 使用 GLSL 着色器实现自定义的粒子动画和发光效果
- 后期处理实现泛光效果，让整体画面更加梦幻
- 可交互的参数控制面板，支持实时调整各种效果参数
- 响应式设计，自适应不同屏幕尺寸

## 项目运行

1. 安装依赖
   ```bash
   npm install
   ```

2. 开发环境运行
   ```bash
   npm run dev
   ```

3. 打包
   ```bash
   npm run build
   ```

## 技术栈

- Vue 3：前端框架
- Three.js：3D 渲染引擎
- GLSL 着色器：自定义粒子效果
- Vite：构建工具
- lil-gui：交互式调试面板

## 核心实现

### 1. 项目搭建

使用 Vite 创建 Vue 3 项目，安装必要依赖：

```bash
npm create vite@latest
npm install three lil-gui
```

### 2. 场景初始化

创建基础的 Three.js 场景、相机和渲染器，支持阴影和后期处理：

```javascript
export class Scene {
  constructor(container) {
    // 创建Three.js场景
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    // 创建透视相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(4, 3, 3)
    
    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, container)
    this.controls.enableDamping = true
    // ...
  }
}
```

### 3. 粒子圣诞树系统

圣诞树采用双层粒子系统构建：
- 外层螺旋形粒子：创建树的主要轮廓
- 内部锥形粒子：填充树的内部体积

关键实现代码：

```javascript
// 1. 创建粒子几何体和材质
const particles = new THREE.BufferGeometry()
const positions = new Float32Array(this.params.粒子数量 * 3)
const scales = new Float32Array(this.params.粒子数量)
const colors = new Float32Array(this.params.粒子数量 * 3)

// 定义基础颜色
const baseColors = [
  new THREE.Color(0xff0000), // 红色
  new THREE.Color(0x00ff00), // 绿色
  new THREE.Color(0x0000ff), // 蓝色
  new THREE.Color(0xffff00), // 黄色
  new THREE.Color(0xff00ff), // 紫色
  new THREE.Color(0x00ffff)  // 青色
]

// 2. 创建外层螺旋
for (let i = 0; i < spiralParticles; i++) {
  const i3 = i * 3
  const heightRatio = i / spiralParticles
  const height = heightRatio * this.params.树高

  // 螺旋角度随高度变化
  const spiralAngle = heightRatio * Math.PI * 20 + Math.random() * Math.PI * 0.5
  const baseRadius = (1 - heightRatio) * this.params.树宽
  const radiusOffset = Math.random() * baseRadius * 0.3
  const radius = (1 - heightRatio) * this.params.树宽 * (0.8 + Math.random() * 0.4)

  positions[i3] = Math.cos(spiralAngle) * radius
  positions[i3 + 1] = height
  positions[i3 + 2] = Math.sin(spiralAngle) * radius
  
  scales[i] = Math.random()

  // 颜色设置
  const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)]
  const colorRatio = heightRatio * 0.8 + Math.random() * 0.2
  colors[i3] = baseColor.r * colorRatio
  colors[i3 + 1] = baseColor.g * colorRatio
  colors[i3 + 2] = baseColor.b * colorRatio
}

// 3. 创建内部锥形
for (let i = 0; i < coneParticles; i++) {
  const i3 = (i + spiralParticles) * 3
  const heightRatio = i / coneParticles
  const height = heightRatio * this.params.树高

  // 计算锥形半径
  const maxRadius = this.params.树宽 * 0.6
  const radius = (1 - heightRatio) * maxRadius * (0.8 + Math.random() * 0.4)

  // 在圆形横截面内随机分布
  const angle = Math.random() * Math.PI * 2
  positions[i3] = Math.cos(angle) * radius
  positions[i3 + 1] = height
  positions[i3 + 2] = Math.sin(angle) * radius
}

// 4. 设置几何体属性
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particles.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))
```

### 4. 粒子着色器效果

使用 GLSL 着色器实现粒子的动画和发光效果：

```glsl
// 顶点着色器
uniform float time;
uniform float size;

attribute float scale;

varying vec2 vUv;
varying float vScale;

void main() {
  vUv = uv;
  vScale = scale;
  
  vec3 pos = position;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // 粒子大小随高度变化，添加呼吸效果
  float sizeScale = 1.0 - position.y / 5.0;
  float breathe = 1.0 + sin(time * 2.0 + vScale * 6.28) * 0.2;
  gl_PointSize = size * (sizeScale * 2.0 + 0.5) * breathe * (300.0 / -mvPosition.z);
  
  gl_Position = projectionMatrix * mvPosition;
}

// 片元着色器
uniform vec3 color;
uniform float time;
uniform float opacity;
uniform float glowSize;

varying vec2 vUv;
varying float vScale;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // 创建柔和的圆形粒子
  float strength = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // 添加彩虹色渐变
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (vScale + vec3(0.0, 0.33, 0.67)));
  
  // 发光效果
  vec3 glow = color * strength * (1.0 + sin(time * 3.0) * 0.2);
  
  // 增强发光效果
  vec3 finalColor = mix(glow, rainbow, 0.5) * (1.0 + sin(time * 5.0 + vScale * 10.0) * 0.2);
  float alpha = strength * opacity * (0.8 + sin(time * 3.0 + vScale * 8.0) * 0.2);
  
  gl_FragColor = vec4(finalColor, alpha);
}
```

### 5. 满天星效果

实现缓慢降落的星星效果：
- 随机生成星星位置和大小
- 使用物理运动模拟下落轨迹
- 着色器实现星星的闪烁和渐隐效果

```javascript
createFallingStar() {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(1 * 3)
  const scales = new Float32Array(1)
  const lifetimes = new Float32Array(1)
  const velocities = new Float32Array(1 * 3)

  // 随机位置（在上方区域）
  const x = (Math.random() - 0.5) * 15
  const y = 8 + Math.random() * 2
  const z = (Math.random() - 0.5) * 15

  positions[0] = x
  positions[1] = y
  positions[2] = z

  scales[0] = Math.random() * 0.8 + 0.6
  lifetimes[0] = 0

  // 添加轻微的水平漂移
  velocities[0] = (Math.random() - 0.5) * 0.3
  velocities[1] = -1.0 - Math.random() * 0.8
  velocities[2] = (Math.random() - 0.5) * 0.3

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      size: { value: 0.35 },
      color: { value: new THREE.Color(0xffffaa) },
      opacity: { value: 1.0 }
    },
    vertexShader: fallingStarVertexShader,
    fragmentShader: fallingStarFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const star = new THREE.Points(geometry, material)
  star.startTime = this.time
  this.fallingStars.push(star)
  this.scene.add(star)
}
```

### 6. 后期处理

使用 EffectComposer 添加后期处理效果：
- UnrealBloomPass：实现泛光效果
- 自定义的色调映射：调整整体画面氛围

```javascript
setupPostProcessing(scene, camera, params) {
  // 创建渲染通道
  this.renderPass = new RenderPass(scene, camera)

  // 创建泛光通道
  this.bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.后期处理.发光强度,
    params.后期处理.发光半径,
    params.后期处理.发光阈值
  )

  // 创建输出通道
  this.outputPass = new OutputPass()

  // 创建效果组合器
  this.composer = new EffectComposer(this.renderer)
  this.composer.addPass(this.renderPass)
  this.composer.addPass(this.bloomPass)
  this.composer.addPass(this.outputPass)
}
```

### 7. 交互控制

使用 lil-gui 创建可调节的参数面板：

```javascript
setupControls(params, callbacks) {
  const treeFolder = this.gui.addFolder('圣诞树参数')
  treeFolder.add(params, '粒子数量', 1000, 10000, 100).onChange(onTreeUpdate)
  treeFolder.add(params, '粒子大小', 0.01, 0.2, 0.01).onChange(onParticleSize)
  // ...
}
```

## 参数说明

可以通过右上角的控制面板调节以下参数：

- 树参数
  - 粒子数量：构成圣诞树的粒子数量（1000-10000）
  - 粒子大小：单个粒子的大小（0.01-0.2）
  - 树高：圣诞树的高度（2-10）
  - 树宽：圣诞树底部的宽度（1-5）
  - 旋转速度：圣诞树的旋转速度（0-0.01）
  - 透明度：粒子的透明度（0-1）
  - 闪耀大小：粒子的发光范围（0.1-1.0）

- 颜色参数
  - 星星颜色：顶部星星的颜色
  - 星星大小：星星的大小（0.1-1）

- 后期处理
  - 发光强度：整体的泛光强度（0-3）
  - 发光半径：泛光效果的扩散范围（0-1）
  - 发光阈值：产生泛光的亮度阈值（0-1）
  - 曝光度：整体画面的明暗程度（0-2）

## 性能优化

- 使用 BufferGeometry 存储粒子数据
- 实现粒子系统的动态剔除
- 优化着色器计算
- 合理设置粒子数量范围

## 浏览器支持

- 需要支持 WebGL 2.0
- 推荐使用 Chrome、Firefox、Safari 最新版本
- 移动端支持但性能可能受限
