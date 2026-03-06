export type SeededRandom = () => number;

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = Math.floor(seed) % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function randomBetween(min: number, max: number, random: SeededRandom): number {
  return min + random() * (max - min);
}

export function shuffleWithSeed<T>(items: readonly T[], random: SeededRandom): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = copy[index];
    const swapValue = copy[swapIndex];
    if (current === undefined || swapValue === undefined) {
      continue;
    }
    copy[index] = swapValue;
    copy[swapIndex] = current;
  }
  return copy;
}

export function pickRandomSubset<T>(items: readonly T[], count: number, random: SeededRandom): T[] {
  if (count <= 0) {
    return [];
  }
  return shuffleWithSeed(items, random).slice(0, count);
}

export function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type DebouncedCallback = (() => void) & { cancel: () => void };

export function createDebouncedCallback(callback: () => void, delayMs: number): DebouncedCallback {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback();
    }, delayMs);
  }) as DebouncedCallback;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
