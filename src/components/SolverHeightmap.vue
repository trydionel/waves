<template>
  <canvas ref="canvas" width="800" height="800" />
</template>

<script>
// THREEJS COORDINATION SYSTEM: Y IS UP

import * as THREE from 'three'

const generateHeightmap = (solver) => {
  const { width, height, coeffs } = solver
  const heightmap = new ImageData(width, height)
  const { data } = heightmap

  for (let i = 0; i < coeffs.length; i++) {
    const value = Math.floor(0.5 * (coeffs[i] + 255)) // clamp to [0,255]
    data[4 * i + 0] = value
    data[4 * i + 1] = value
    data[4 * i + 2] = value
    data[4 * i + 3] = 255
  }

  return heightmap
}

const createHeightmapMesh = (solver) => {
  const heightmap = generateHeightmap(solver)

  const texture = new THREE.Texture(heightmap)
  texture.minFilter = THREE.NearestFilter
  texture.needsUpdate = true

  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    displacementMap: texture,
    displacementScale: 0.5,
    displacementBias: -0.25
  });
  const geometry = new THREE.PlaneGeometry(1, 1, 512, 512);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "Terrain";
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.rotation.x = -Math.PI / 2

  return mesh
}

const updateMesh = (solver, mesh) => {
  const { displacementMap } = mesh.material
  displacementMap.image = generateHeightmap(solver)
  displacementMap.needsUpdate = true
}

export default {
  name: 'SolverHeightmap',
  props: ['solver'],
  data() {
    return {
      // Don't register THREE elements with reactivity system!
    }
  },
  mounted() {
    const canvas = this.$refs.canvas

    this.scene = new THREE.Scene();

    const distance = 1.25 / Math.sqrt(2);
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 1, 1000);
    this.camera.position.set(distance, 1, distance)
    this.camera.lookAt(0, 0, 0)

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
    directionalLight.castShadow = true
    directionalLight.position.set(-4.4, 3.3, 2.2)
    directionalLight.shadow.bias = -0.004
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.left = -5
    directionalLight.shadow.camera.right = 5
    directionalLight.shadow.camera.top = -2
    directionalLight.shadow.camera.bottom = 2
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 10
    this.scene.add( directionalLight );

    const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
    this.scene.add(helper)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.physicallyCorrectLights = true


    this.mesh = createHeightmapMesh(this.solver)
    this.scene.add(this.mesh)

    const axesHelper = new THREE.AxesHelper( 100 );
    this.scene.add( axesHelper );

    this.animate()
  },
  watch: {
    'solver.n'() {
      updateMesh(this.solver, this.mesh)
    }
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate)

      this.mesh.rotation.z += 0.001

      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style>
</style>
