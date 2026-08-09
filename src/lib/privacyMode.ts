export type DataMode = 'local' | 'cloud';

export function getDataMode(value: string | undefined = process.env.EXPO_PUBLIC_DATA_MODE): DataMode {
  return value === 'cloud' ? 'cloud' : 'local';
}

export const DATA_MODE = getDataMode();

export function isLocalOnly(): boolean {
  return getDataMode() === 'local';
}
