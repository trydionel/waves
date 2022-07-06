<template>
  <SolverOutput :solver="solver" />

  <div>
    <label for="resolution">Resolution</label>
    <input type="range" name="resolution" min="10" max="100" v-model="options.resolution" />
    {{ options.resolution }}
  </div>

  <div>
    <label for="gamma">Gamma</label>
    <input type="range" name="gamma" min="0.01" max="0.5" step="0.01" v-model="options.gamma" />
    {{ options.gamma }}
  </div>

  <div>
    <label for="velocity">Velocity</label>
    <input type="range" name="velocity" min="0.1" max="5" step="0.1" v-model="options.velocity" />
    {{ options.velocity }}
  </div>

  <button @click="run" :disabled="running">Run</button>
  <button @click="stop" :disabled="!running">Stop</button>
  <button @click="reset">Reset</button>
</template>

<script>
import SolverOutput from './components/SolverOutput.vue'
import { Solver } from './solver'

export default {
  name: 'App',
  components: {
    SolverOutput,
  },
  data() {
    return {
      solver: null,
      running: false,
      options: {
        resolution: 50,
        gamma: 0.02,
        velocity: 2
      }
    }
  },
  beforeMount() {
    this.buildSolver()
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.buildSolver()
      }
    }
  },
  methods: {
    buildSolver() {
      const { gamma, velocity, resolution } = this.options
      this.solver = new Solver(resolution, resolution, {
        gamma,
        velocity
      })
    },
    run() {
      this.running = true
      this.tick()
    },
    stop() {
      this.running = false
      cancelAnimationFrame(this.request)
    },
    reset() {
      this.solver.reset()
    },
    tick() {
      if (this.running) {
        this.request = requestAnimationFrame(this.tick)
      }

      if (this.solver.n % 500 === 0) {
        this.solver.addSource(
          Math.floor(Math.random() * this.solver.width),
          Math.floor(Math.random() * this.solver.height),
          Math.floor(Math.random() * 128 + 127) // max magnitude is 255
        )
      }

      this.solver.step()
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
