<template>
  <canvas ref="canvas" width="800" height="800" />
</template>

<script>
// THREEJS COORDINATION SYSTEM: Y IS UP

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const createHeightmapMesh = (solver, options = {}) => {
  const { width, height, coeffs } = solver;
  const scale = options.scale || 1;

  const color = new THREE.TextureLoader().load(
    'textures/Wood066_1K_Color.jpg'
  )
  const roughness = new THREE.TextureLoader().load(
    'textures/Wood066_1K_Roughness.jpg'
  )
  const displacement = new THREE.TextureLoader().load(
    'textures/Wood066_1K_Displacement.jpg'
  )

  const material = new THREE.MeshStandardMaterial({
    map: color,
    roughnessMap: roughness,
    displacementMap: displacement,
    displacementScale: 0.01
  });
  const geometry = new THREE.PlaneGeometry(1, 1, width - 1, height - 1);
  const mesh = new THREE.Mesh(geometry, material);

  const position = geometry.attributes.position;
  position.usage = THREE.DynamicDrawUsage;

  for ( let i = 0; i < position.count; i ++ ) {
    const z = coeffs[i] * scale;
    position.setZ( i, z );
  }

  mesh.name = "Terrain";
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.rotation.x = -Math.PI / 2

  return mesh
}

const updateMesh = (solver, mesh, options = {}) => {
  const { coeffs } = solver
  const { geometry } = mesh
  const scale = options.scale || 1

  const position = geometry.attributes.position;

  for ( let i = 0; i < position.count; i ++ ) {
    const z = coeffs[i] * scale;
    position.setZ( i, z );
  }

  position.needsUpdate = true;
  geometry.needsUpdate = true
}

export default {
  name: 'SolverHeightmap',
  props: [
    'solver',
    'options'
  ],
  data() {
    return {
      // Don't register THREE elements with reactivity system!
      helpers: false
    }
  },
  mounted() {
    const canvas = this.$refs.canvas

    this.scene = new THREE.Scene();

    const azimuth = 35; // degrees
    const distance = 1.25;
    const cameraX = distance * Math.cos(azimuth * Math.PI / 180)
    const cameraY = distance * Math.sin(azimuth * Math.PI / 180)
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(cameraX, cameraY, 0)
    this.camera.lookAt(0, 0, 0)

    const orbit = new OrbitControls(this.camera, canvas)
    this.orbit = orbit

    const ambientLight = new THREE.AmbientLight( 0xffffff, 3 );
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.castShadow = true
    directionalLight.position.set(-4.4, 1.3, 2.2)
    directionalLight.shadow.bias = -0.003
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.camera.left = -5
    directionalLight.shadow.camera.right = 5
    directionalLight.shadow.camera.top = -2
    directionalLight.shadow.camera.bottom = 2
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 10
    this.scene.add( directionalLight );

    if (this.helpers) {
      const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
      this.scene.add(helper)

      const axesHelper = new THREE.AxesHelper( 100 );
      this.scene.add( axesHelper );
    }

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.physicallyCorrectLights = true

    this.mesh = createHeightmapMesh(this.solver, this.options)
    this.scene.add(this.mesh)

    this.animate()
  },
  watch: {
    'solver.n'() {
      updateMesh(this.solver, this.mesh, this.options)
    }
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate)

      this.mesh.rotation.z += 0.001
      this.orbit.update()

      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style>
</style>
