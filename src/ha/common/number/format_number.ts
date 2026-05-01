import type { FrontendLocaleData } from "../../types";

/**
 * Vendored, locale-aware number formatter used by the card.
 * Sufficient for the limited use within power-flow-card-plus.
 */
export const formatNumber = (num: string | number, localeOptions?: FrontendLocaleData, options?: Intl.NumberFormatOptions): string => {
  const locale = localeOptions?.language ?? "en";
  const value = typeof num === "string" ? Number(num) : num;
  if (!Number.isFinite(value)) return String(num);
  try {
    return new Intl.NumberFormat(locale.replace("_", "-"), options).format(value);
  } catch {
    return new Intl.NumberFormat("en", options).format(value);
  }
};
