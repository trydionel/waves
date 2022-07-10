<template>
  <div class="container">
    <div class="visualization">
      <SolverOutput :solver="solver" v-if="mode == '2D'"/>
      <SolverHeightmap :solver="solver" v-if="mode == '3D'" />
    </div>

    <div class="controls">
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

      <div>
        Step: {{ solver.n }}
        &nbsp;
        <button @click="run" :disabled="running">Run</button>
        <button @click="stop" :disabled="!running">Stop</button>
        <button @click="reset">Reset</button>
      </div>

      <div>
        <button @click="mode = '2D'">2D</button>
        <button @click="mode = '3D'">3D</button>
      </div>

    </div>
  </div>
</template>

<script>
import SolverOutput from './components/SolverOutput.vue'
import { Solver } from './solver'
import SolverHeightmap from './components/SolverHeightmap.vue'

export default {
  name: 'App',
  components: {
    SolverOutput,
    SolverHeightmap
},
  data() {
    return {
      solver: null,
      running: false,
      mode: '2D',
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
          Math.random()
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
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  width: 100vw;
  height: 100vh;
}

.container .visualization {
  overflow-y: scroll;
  display: flex;
  justify-content: center;
}

.container .controls {
  padding: 24px;
  border-top: 1px solid gray;
}
</style>
