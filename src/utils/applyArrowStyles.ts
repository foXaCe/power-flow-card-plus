import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export const getArrowStyles = (
  arrowName: keyof NonNullable<PowerFlowCardPlusConfig["arrows"]>,
  config: PowerFlowCardPlusConfig
): string => {
  const arrowConfig = config.arrows?.[arrowName];
  if (!arrowConfig) return "";

  const styles: string[] = [];

  if (arrowConfig.color) {
    styles.push(`stroke: ${arrowConfig.color}`);
  }

  if (arrowConfig.thickness !== undefined) {
    styles.push(`stroke-width: ${arrowConfig.thickness}px`);
  }

  return styles.join("; ");
};

export const getArrowTransform = (
  arrowName: keyof NonNullable<PowerFlowCardPlusConfig["arrows"]>,
  config: PowerFlowCardPlusConfig
): string => {
  const arrowConfig = config.arrows?.[arrowName];
  if (!arrowConfig) return "";

  const transforms: string[] = [];

  if (arrowConfig.offset_x !== undefined || arrowConfig.offset_y !== undefined) {
    const x = arrowConfig.offset_x || 0;
    const y = arrowConfig.offset_y || 0;
    // SVG transform syntax without units
    transforms.push(`translate(${x}, ${y})`);
  }

  return transforms.join(" ");
}
