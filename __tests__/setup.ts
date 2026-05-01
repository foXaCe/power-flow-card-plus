/**
 * Test environment setup for jsdom.
 *
 * jsdom does not implement `ResizeObserver` (used indirectly by some Lit-based
 * web-components and HA helpers). We provide a minimal no-op stub so component
 * mounting does not crash on `new ResizeObserver(...)`.
 */

class ResizeObserverStub {
  observe(): void {
    /* noop */
  }
  unobserve(): void {
    /* noop */
  }
  disconnect(): void {
    /* noop */
  }
}

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = ResizeObserverStub;
}

// Some HA helpers expect `matchMedia` to exist on `window`.
if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
        /* noop */
      },
      removeListener: () => {
        /* noop */
      },
      addEventListener: () => {
        /* noop */
      },
      removeEventListener: () => {
        /* noop */
      },
      dispatchEvent: () => false,
    }),
  });
}
