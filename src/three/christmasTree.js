import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import particleVertexShader from '../shader/particle/vertex.glsl?raw'
import particleFragmentShader from '../shader/particle/fragment.glsl?raw'
import starParticleVertexShader from '../shader/starParticle/vertex.glsl?raw'
import starParticleFragmentShader from '../shader/starParticle/fragment.glsl?raw'
import fallingStarVertexShader from '../shader/fallingStar/vertex.glsl?raw'
import fallingStarFragmentShader from '../shader/fallingStar/fragment.glsl?raw'
/**
 * 圣诞树类
 * 负责创建和管理圣诞树的粒子系统和星星
 */
export class ChristmasTree {
  /**
   * @param {THREE.Scene} scene - Three.js场景
   * @param {Object} params - 圣诞树的参数配置
   */
  constructor(scene, params) {
    this.scene = scene
    this.params = params
    this.points = null // 树的粒子系统
    this.star = null // 树顶的星星
    this.time = 0
    this.starParticles = null // 添加星星粒子系统
    this.ground = null
    this.fallingStars = []
    this.lastStarTime = 0 // 用于控制星星生成频率

    // 创建圆形粒子纹理
    const textureLoader = new THREE.TextureLoader()
    this.particleTexture = this.createCircleTexture()
    // 或者使用内置的圆形纹理
    // this.particleTexture = textureLoader.load('./textures/circle.png')

    this.createTree()
    this.createGround()
    this.loadStar()
  }

  /**
   * 创建圆形纹理
   */
  createCircleTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const context = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 3

    // 创建径向渐变
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    // 绘制圆形
    context.fillStyle = gradient
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.fill()

    return new THREE.CanvasTexture(canvas)
  }

  /**
   * 创建圣诞树的粒子系统
   * 使用随机分布的粒子生成圆锥形的树
   */
  createTree() {
    const oldPoints = this.scene.children.find((child) => child.isPoints && child.name === 'treeParticles')
    if (oldPoints) this.scene.remove(oldPoints)

    // 计算总粒子数（外层螺旋 + 内部锥形）
    const spiralParticles = Math.floor(this.params.粒子数量 * 0.7) // 70%的粒子用于螺旋
    const coneParticles = this.params.粒子数量 - spiralParticles // 30%的粒子用于锥形

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
      new THREE.Color(0x00ffff) // 青色
    ]

    // 1. 创建外层螺旋
    for (let i = 0; i < spiralParticles; i++) {
      const i3 = i * 3
      const heightRatio = i / spiralParticles
      const height = heightRatio * this.params.树高

      // 螺旋角度随高度变化
      const spiralAngle = heightRatio * Math.PI * 20 + Math.random() * Math.PI * 0.5
      const baseRadius = (1 - heightRatio) * this.params.树宽
      const radiusOffset = Math.random() * baseRadius * 0.3
      const radius = baseRadius * (0.8 + Math.random() * 0.4) + radiusOffset

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

    // 2. 创建内部锥形
    for (let i = 0; i < coneParticles; i++) {
      const i3 = (i + spiralParticles) * 3
      const heightRatio = i / coneParticles
      const height = heightRatio * this.params.树高

      // 计算锥形半径（随高度线性减小）
      const maxRadius = this.params.树宽 * 0.6 // 锥形基础半径比外层小一些
      const radius = (1 - heightRatio) * maxRadius * (0.8 + Math.random() * 0.4)

      // 在圆形横截面内随机分布
      const angle = Math.random() * Math.PI * 2
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = height
      positions[i3 + 2] = Math.sin(angle) * radius

      scales[i + spiralParticles] = Math.random()

      // 内部粒子使用亮的颜色
      const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)]
      const colorRatio = heightRatio * 0.5 + 0.5 + Math.random() * 0.2 // 保持较高的亮度
      colors[i3] = baseColor.r * colorRatio
      colors[i3 + 1] = baseColor.g * colorRatio
      colors[i3 + 2] = baseColor.b * colorRatio
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // 创建自定义着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        size: { value: this.params.粒子大小 },
        color: { value: new THREE.Color(1, 1, 1) },
        opacity: { value: this.params.透明度 },
        glowSize: { value: this.params.闪耀大小 }
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })

    this.points = new THREE.Points(particles, material)
    this.points.name = 'treeParticles'
    this.scene.add(this.points)
  }

  /**
   * 创建星周围的粒子效果
   */
  createStarParticles() {
    const oldParticles = this.scene.children.find((child) => child.name === 'starParticles')
    if (oldParticles) this.scene.remove(oldParticles)

    const particleCount = 200 // 增加粒子数量
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    const colors = new Float32Array(particleCount * 3)
    // 添加生命周期和速度属性
    const lifetimes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)

    // 创建从中心向外发射的粒子
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // 初始位置在星星内部的小范围内随机分布
      const radius = Math.random() * 0.1 // 初始半径小
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // 设置向外的速度方向
      const speed = 0.1 + Math.random() * 0.3 // 随机速度
      velocities[i3] = (positions[i3] / radius) * speed
      velocities[i3 + 1] = (positions[i3 + 1] / radius) * speed
      velocities[i3 + 2] = (positions[i3 + 2] / radius) * speed

      // 随机生命周期
      lifetimes[i] = Math.random()

      scales[i] = Math.random() * 0.8 + 0.7 // 增加基础大小和随机范围

      // 使用星星的颜色
      const color = new THREE.Color(this.params.星星颜色)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        size: { value: 0.04 },
        color: { value: new THREE.Color(this.params.星星颜色) },
        opacity: { value: 1.0 },
        glowSize: { value: 0.7 }
      },
      vertexShader: starParticleVertexShader,
      fragmentShader: starParticleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    this.starParticles = new THREE.Points(geometry, material)
    this.starParticles.name = 'starParticles'
    if (this.star) {
      this.starParticles.position.copy(this.star.position)
      this.scene.add(this.starParticles)
    }
  }

  /**
   * 加载星星模型
   */
  loadStar() {
    const oldStar = this.scene.children.find((child) => child.name === 'star')
    if (oldStar) this.scene.remove(oldStar)

    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./draco/')
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      './model/star.glb',
      (gltf) => {
        this.star = gltf.scene
        this.star.name = 'star'

        // 调整星星位置和大小
        this.star.scale.set(0.3, 0.3, 0.3)
        this.star.position.set(0, this.params.树高 + 0.2, 0)

        // 设置材质为发光材质
        this.star.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: this.params.星星颜色,
              emissive: this.params.星星颜色,
              emissiveIntensity: 1,
              metalness: 0.8,
              roughness: 0.2
            })
          }
        })

        this.scene.add(this.star)
        // 创建星星周围的粒子
        this.createStarParticles()
      },
      undefined,
      (error) => {
        console.error('加载星星模型时出错:', error)
      }
    )
  }

  /**
   * 创建反射地面
   */
  createGround() {
    const geometry = new THREE.PlaneGeometry(20, 20)
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7
    })

    this.ground = new THREE.Mesh(geometry, material)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.y = -0.1
    this.ground.receiveShadow = true
    this.scene.add(this.ground)
  }

  /**
   * 创建一个新的落下的星星
   */
  createFallingStar() {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(1 * 3)
    const scales = new Float32Array(1)
    const lifetimes = new Float32Array(1)
    const velocities = new Float32Array(1 * 3)

    // 随机位置（在上方区域）
    const x = (Math.random() - 0.5) * 15 // 扩大水平分布范围
    const y = 8 + Math.random() * 2
    const z = (Math.random() - 0.5) * 15 // 扩大水平分布范围

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

  /**
   * 更新圣诞树动画
   * 控制树和星星的旋转
   */
  update() {
    this.time += 0.016
    if (this.points && this.points.material.uniforms) {
      this.points.material.uniforms.time.value = this.time
      this.points.rotation.y += this.params.旋转速度
    }
    if (this.star) {
      this.star.rotation.y += this.params.旋转速度
      // 更新星星颜色
      this.star.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive.set(this.params.星星颜色)
          child.material.color.set(this.params.星星颜色)
        }
      })
    }
    // 更新星星粒子系统
    if (this.starParticles && this.starParticles.material.uniforms) {
      this.starParticles.material.uniforms.time.value = this.time
      this.starParticles.material.uniforms.color.value.set(this.params.星星颜色)
      // 让粒子系统跟随星旋转，但有自的运动
      this.starParticles.rotation.y -= this.params.旋转速度 * 0.5
    }

    // 每隔一定时间创建新的星星
    if (this.time - this.lastStarTime > 0.1) {
      // 每0.1秒创建一个新星星，增加生成频率
      this.createFallingStar()
      this.lastStarTime = this.time
    }

    // 更新落下的星星
    this.fallingStars = this.fallingStars.filter((star) => {
      if (!star.material.uniforms) return false

      const lifetime = this.time - star.startTime
      star.material.uniforms.time.value = this.time
      star.geometry.attributes.lifetime.array[0] = lifetime
      star.geometry.attributes.lifetime.needsUpdate = true

      // 如果生命周期超过4秒，移除星星
      if (lifetime > 6.0) {
        this.scene.remove(star)
        return false
      }
      return true
    })
  }
}
