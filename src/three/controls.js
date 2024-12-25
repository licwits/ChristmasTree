import GUI from 'lil-gui'

/**
 * 控制器类
 * 使用lil-gui创建交互式控制面板
 */
export class Controls {
  /**
   * @param {Object} params - 可调节的参数对象
   * @param {Renderer} renderer - 渲染器实例
   * @param {Scene} scene - 场景实例
   * @param {Object} callbacks - 参数变化时的回调函数集合
   */
  constructor(params, renderer, scene, callbacks) {
    this.gui = new GUI()
    this.renderer = renderer
    this.scene = scene
    this.setupControls(params, callbacks)
  }

  /**
   * 设置控制面板
   * @param {Object} params - 可调节的参数对象
   * @param {Object} callbacks - 回调函数集合
   * @param {Function} callbacks.onTreeUpdate - 树更新回调
   * @param {Function} callbacks.onStarUpdate - 星星更新回调
   * @param {Function} callbacks.onParticleSize - 粒子大小更新回调
   * @param {Function} callbacks.onOpacityChange - 透明度更新回调
   */
  setupControls(params, { onTreeUpdate, onStarUpdate, onParticleSize, onOpacityChange }) {
    // 创建树参数控制文件夹
    const treeFolder = this.gui.addFolder('圣诞树参数')
    // 粒子数量控制
    treeFolder.add(params, '粒子数量', 1000, 10000, 100).onChange(onTreeUpdate)
    // 粒子大小控制
    treeFolder.add(params, '粒子大小', 0.01, 0.2, 0.01).onChange(onParticleSize)
    // 树高度控制
    treeFolder.add(params, '树高', 2, 10, 0.5).onChange(() => {
      onTreeUpdate()
      onStarUpdate()
    })
    // 树宽度控制
    treeFolder.add(params, '树宽', 1, 5, 0.2).onChange(onTreeUpdate)
    // 旋转速度控制
    treeFolder.add(params, '旋转速度', 0, 0.01, 0.001)
    // 透明度控制
    treeFolder.add(params, '透明度', 0, 1, 0.1).onChange(onOpacityChange)
    // 添加闪耀大小控制
    treeFolder.add(params, '闪耀大小', 0.1, 1.0, 0.1).onChange((value) => {
      if (this.scene.scene.children.find((child) => child.name === 'treeParticles')) {
        this.scene.scene.children.find((child) => child.name === 'treeParticles').material.uniforms.glowSize.value = value
      }
    })

    // 创建颜色参数控制文件夹
    const colorFolder = this.gui.addFolder('颜色参数')

    // 星星颜色控制
    colorFolder.addColor(params, '星星颜色').onFinishChange(onStarUpdate)
    // 星星大小控制
    colorFolder.add(params, '星星大小', 0.1, 1, 0.1).onFinishChange(onStarUpdate)

    // 创建后期处理参数控制文件夹
    const postFolder = this.gui.addFolder('后期处理')

    // 发光效果控制
    postFolder.add(params.后期处理, '发光强度', 0, 3, 0.1).onChange((value) => (this.renderer.bloomPass.strength = value))

    postFolder.add(params.后期处理, '发光半径', 0, 1, 0.01).onChange((value) => (this.renderer.bloomPass.radius = value))

    postFolder.add(params.后期处理, '发光阈值', 0, 1, 0.01).onChange((value) => (this.renderer.bloomPass.threshold = value))

    postFolder.add(params.后期处理, '曝光度', 0, 2, 0.1).onChange((value) => (this.renderer.renderer.toneMappingExposure = value))
  }
}
