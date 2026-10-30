export type FluidSimulation = {
  destroy(): void;
  setActive(on: boolean): void;
};

/** Starts the fluid ink on a canvas. Throws if WebGL is not available. */
export function fluidSimulation(canvas: HTMLCanvasElement): FluidSimulation;
