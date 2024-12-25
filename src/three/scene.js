import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * 场景管理类
 * 负责创建和管理Three.js的场景和相机
 */
export class Scene {
  constructor(container) {
    // 创建Three.js场景
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    // 创建透视相机，参数：视角、宽高比、近裁剪面、远裁剪面
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    // 设置相机初始位置
    this.camera.position.set(4, 3, 3) // 设置相机位置
    this.camera.lookAt(0, 2.5, 0) // 让相机看向树的中心点

    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, container)
    this.controls.enableDamping = true // 启用阻尼效果
    this.controls.dampingFactor = 0.05 // 设置阻尼系数
    this.controls.minDistance = 3 // 设置最小缩放距离
    this.controls.maxDistance = 20 // 设置最大缩放距离
    this.controls.maxPolarAngle = Math.PI / 1.5 // 限制垂直旋转角度
    this.controls.target.set(0, 2.5, 0) // 设置控制器的焦点

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x333333)
    this.scene.add(ambientLight)

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 1, 10)
    pointLight.position.set(0, 0.5, 0)
    pointLight.castShadow = true
    this.scene.add(pointLight)
  }

  /**
   * 处理窗口大小变化
   * 更新相机的宽高比和投影矩阵
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  /**
   * 更新轨道控制器
   */
  update() {
    this.controls.update()
  }
}
