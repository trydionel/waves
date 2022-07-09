<template>
  <div class="solver">
    <canvas ref="coeffCanvas" width="800" height="800" />
  </div>
</template>

<script>
// import SolverVisualizer from './SolverVisualizer.vue'
import { defineComponent } from "vue"

export default defineComponent({
  components: {
    // SolverVisualizer
  },
  props: ['solver'],
  data() {
    return {
      ctx: null,
      texture: null
    }
  },
  mounted() {
    const canvas = this.$refs.coeffCanvas
    this.ctx = canvas.getContext('2d')
    this.ctx.width = canvas.width
    this.ctx.height = canvas.height

    this.draw()
  },
  watch: {
    'solver.n'() {
      this.draw()
    }
  },
  methods: {
    draw() {
      if (!this.ctx) return
      if (!this.solver) return

      this.ctx.save()

      const { coeffs, width, height } = this.solver
      const imageData = this.ctx.createImageData(width, height)
      const { data } = imageData

      for (let i = 0; i < coeffs.length; i++) {
        const value = Math.floor(0.5 * (coeffs[i] + 255)) // clamp to [0,255]
        data[4 * i + 0] = value
        data[4 * i + 1] = value
        data[4 * i + 2] = value
        data[4 * i + 3] = 255
      }

      // Draw scaled image
      const newCanvas = document.createElement('canvas')
      newCanvas.getContext('2d').putImageData(imageData, 0, 0)

      this.ctx.scale(this.ctx.width / width, this.ctx.height / height)
      this.ctx.drawImage(newCanvas, 0, 0)

      this.ctx.restore()
    },
    showHeightmap() {
      this.ctx.canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        this.texture = url
      })
    }
  }
})
</script>

<style>
canvas {
  border: 1px solid red;
}
</style>