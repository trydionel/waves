<template>
  <div class="container">
    <div class="visualization" v-if="output">
      <SolverTexture :solver="output" v-if="mode == '2D'" />
      <SolverHeightmap :solver="output" :options="heightmap" v-if="mode == '3D'" />
    </div>

    <div class="controls">
      <div>
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

        <div v-if="output">
          Step: {{ output.n }}
          &nbsp;
          <button @click="run" :disabled="running">Run</button>
          <button @click="stop" :disabled="!running">Stop</button>
          <button @click="reset">Reset</button>
        </div>
      </div>

      <div>
        <div>
          View mode:
          &nbsp;
          <button @click="mode = '2D'">2D</button>
          <button @click="mode = '3D'">3D</button>
        </div>

        <div>
          <label for="scale">Scale</label>
          <input type="range" name="scale" min="0.1" max="1" step="0.1" v-model="heightmap.scale" />
          {{ heightmap.scale }}
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import SolverTexture from './components/SolverTexture.vue'
import SolverHeightmap from './components/SolverHeightmap.vue'

export default {
  name: 'App',
  components: {
    SolverTexture,
    SolverHeightmap
  },
  data() {
    return {
      output: null,
      running: false,
      mode: '2D',
      options: {
        resolution: 50,
        gamma: 0.02,
        velocity: 2
      },
      heightmap: {
        scale: 1
      }
    }
  },
  beforeMount() {
    this.worker = new Worker(new URL('workers/solver.js', import.meta.url));
    this.worker.onmessage = (message) => {
      this.handleMessage(message)
    };

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
      this.worker.postMessage({
        event: 'init',
        payload: {
          width: resolution,
          height: resolution,
          specs: {
            velocity,
            gamma
          }
        }
      });
    },
    handleMessage({ data: { event, payload }}) {
      switch (event) {
        case 'tick:complete':
          this.output = payload
          break;
        default:
          throw new Error(`Unrecognized event '${event}'`)
      }
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

      if (Math.random() < 0.05) {
        this.worker.postMessage({
          event: 'addSource',
          payload: {
            x: Math.floor(Math.random() * this.output.width),
            y: Math.floor(Math.random() * this.output.height),
            mag: Math.random()
          }
        })
      }

      this.worker.postMessage({
        event: 'tick'
      })
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
  display: flex;
  justify-content: center;
  gap: 48px;
}
</style>
