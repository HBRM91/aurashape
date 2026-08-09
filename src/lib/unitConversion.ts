function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function kgToLb(value: number): number {
  return round(value * 2.2046226218);
}

export function lbToKg(value: number): number {
  return round(value / 2.2046226218, 2);
}

export function cmToIn(value: number): number {
  return round(value / 2.54);
}

export function inToCm(value: number): number {
  return round(value * 2.54);
}
