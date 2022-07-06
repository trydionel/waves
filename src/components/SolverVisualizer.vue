<template>
  <canvas ref="babylonCanvas" width="800" height="800" />
</template>

<script>
/* eslint-disable */

import { ArcRotateCamera, Vector3, Engine, HemisphericLight, MeshBuilder, Scene } from 'babylonjs'

export default {
  name: 'SolverVisualizer',
  props: ['heightmap'],
  data() {
    return {
      engine: null
    }
  },
  mounted() {
    const canvas = this.$refs.babylonCanvas
    this.engine = new Engine(canvas)

    const scene = new Scene(this.engine)
    const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene)
    const light = new HemisphericLight('Light1', new Vector3(1, 1, 0), scene)
    const ground = new MeshBuilder.CreateGroundFromHeightMap('Wave', this.heightmap, {}, scene)

    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
</script>

<style>

</style>