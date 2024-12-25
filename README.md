# Three.js 粒子圣诞树 🎄

一个使用 Three.js 实现的粒子圣诞树动画效果。包含圣诞树、星星、满天星等元素,使用着色器实现绚丽的粒子效果。

## 效果展示

- 粒子构建的圣诞树,带有旋转和闪烁效果
- 树顶的星星模型,周围环绕发光粒子
- 满天星从天而降的效果
- 反光地面
- 可调节的参数面板

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

- Vue 3
- Three.js
- GLSL 着色器
- Vite

## 实现思路

### 1. 项目搭建

使用 Vite 创建 Vue 3 项目,安装必要依赖:

```bash
npm create vite@latest
npm install three lil-gui
```

### 2. 场景初始化

创建基础的 Three.js 场景、相机和渲染器:

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

### 3. 粒子圣诞树

圣诞树由两部分粒子组成:
- 外层螺旋形粒子
- 内部锥形粒子

关键代码:

```javascript
// 创建外层螺旋
for (let i = 0; i < spiralParticles; i++) {
  const heightRatio = i / spiralParticles
  const height = heightRatio * this.params.树高

  // 螺旋角度随高度变化
  const spiralAngle = heightRatio * Math.PI * 20 + Math.random() * Math.PI * 0.5
  const radius = (1 - heightRatio) * this.params.树宽 * (0.8 + Math.random() * 0.4)

  positions[i3] = Math.cos(spiralAngle) * radius
  positions[i3 + 1] = height
  positions[i3 + 2] = Math.sin(spiralAngle) * radius
}
```

### 4. 树顶星星

使用 GLTFLoader 加载星星模型,并添加发光材质:

```javascript
loader.load('./model/star.glb', (gltf) => {
  this.star = gltf.scene
  this.star.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: this.params.星星颜色,
        emissive: this.params.星星颜色,
        emissiveIntensity: 1
      })
    }
  })
})
```

### 5. 粒子效果着色器

使用 GLSL 着色器实现粒子的发光和动画效果:

```glsl
// 顶点着色器
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
```

### 6. 交互控制

使用 lil-gui 创建可调节的参数面板:

```javascript
setupControls(params, callbacks) {
  const treeFolder = this.gui.addFolder('圣诞树参数')
  treeFolder.add(params, '粒子数量', 1000, 10000, 100).onChange(onTreeUpdate)
  treeFolder.add(params, '粒子大小', 0.01, 0.2, 0.01).onChange(onParticleSize)
  // ...
}
```

## 参数说明

可以通过右上角的控制面板调节以下参数:

- 树参数
  - 粒子数量: 构成圣诞树的粒子数量
  - 粒子大小: 单个粒子的大小
  - 树高: 圣诞树的高度
  - 树宽: 圣诞树底部的宽度
  - 旋转速度: 圣诞树的旋转速度
  - 透明度: 粒子的透明度
  - 闪耀大小: 粒子的发光范围

- 颜色参数
  - 星星颜色: 顶部星星的颜色
  - 星星大小: 星星的大小

- 后期处理
  - 发光强度: 整体的泛光强度
  - 发光半径: 泛光效果的扩散范围
  - 发光阈值: 产生泛光的亮度阈值
  - 曝光度: 整体画面的明暗程度
