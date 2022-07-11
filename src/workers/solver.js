import { Solver } from '../solver'

let solver; // singleton

const onTickComplete = (solver) => {
  self.postMessage({
    event: 'tick:complete',
    payload: {
      n: solver.n,
      coeffs: solver.coeffs,
      width: solver.width,
      height: solver.height
    }
  });
}

self.onmessage = ({ data: { event, payload }}) => {

  switch (event) {
    case 'init':
      solver = new Solver(payload.width, payload.height, payload.specs)
      console.log('Solver initialized')

      onTickComplete(solver)
      break

    case 'tick':
      if (!solver) throw new Error("Solver not initialized")
      solver.step()

      onTickComplete(solver)
      break

    case 'addSource':
      if (!solver) throw new Error("Solver not initialized")
      solver.addSource(
        payload.x,
        payload.y,
        payload.mag
      )
      break

    default:
      throw new Error(`Unrecognized event '${event}'`)
  }
}
