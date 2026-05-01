// Vendored debounce helper. Mirrors the API used by Home Assistant frontend.
export const debounce = <T extends (...args: any[]) => unknown>(func: T, wait: number, immediate = false): T => {
  let timeout: number | undefined;
  return function (this: unknown, ...args: Parameters<T>) {
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && timeout === undefined;
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  } as T;
};
