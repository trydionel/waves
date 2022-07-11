import pdeEngine from "pde-engine";

export class Solver {
  constructor(width, height, specs = {}) {
    this.n = 0
    this.width = width
    this.height = height
    this.coeffs = []

    this.engine = new pdeEngine(specs)
    this.engine.setResolution(this.width, this.height)
  }

  addSource(x, y, mag = 1) {
    this.engine.addSource(x, y, mag)
  }

  step() {
    this.coeffs = this.engine.update()
    this.n++
  }

  reset() {
    this.n = 0
    this.coeffs = []
    this.engine.setResolution(this.width, this.height) // resets internally
  }
}