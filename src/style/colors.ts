import { HomeSources } from "../type";

export const computeColor = (colorType: boolean | string | undefined, homeSources: HomeSources, homeLargestSource: string): string => {
  let iconHomeColor: string = "var(--primary-text-color)";
  if (typeof colorType === "string") {
    const src = homeSources[colorType as keyof HomeSources];
    if (src) iconHomeColor = src.color;
  }
  if (colorType === true) {
    const largest = homeSources[homeLargestSource as keyof HomeSources];
    if (largest) iconHomeColor = largest.color;
  }
  return iconHomeColor;
};
