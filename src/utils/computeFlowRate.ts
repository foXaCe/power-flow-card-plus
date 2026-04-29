import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { defaultValues } from "./get-default-config";

const newFlowRateMapRange = (value: number, minOut: number, maxOut: number, minIn: number, maxIn: number): number => {
  if (maxIn === minIn) return minOut;
  const clamped = Math.max(minIn, Math.min(maxIn, value));
  if (clamped > maxIn) return maxOut;
  return ((clamped - minIn) * (maxOut - minOut)) / (maxIn - minIn) + minOut;
};

const newFlowRate = (config: PowerFlowCardPlusConfig, value: number): number => {
  const maxPower = config.max_expected_power;
  const minPower = config.min_expected_power;
  const maxRate = config.max_flow_rate;
  const minRate = config.min_flow_rate;
  return newFlowRateMapRange(value, maxRate, minRate, minPower, maxPower);
};

const oldFlowRate = (config: PowerFlowCardPlusConfig, value: number, total: number): number => {
  const min = config?.min_flow_rate ?? defaultValues.minFlowRate;
  const max = config?.max_flow_rate ?? defaultValues.maxFlowRate;
  if (total <= 0) return max;
  return max - (value / total) * (max - min);
};

export const computeFlowRate = (config: PowerFlowCardPlusConfig, value: number, total: number): number => {
  const isNewFlowRateModel = config.use_new_flow_rate_model ?? true;
  if (isNewFlowRateModel) return newFlowRate(config, value);
  return oldFlowRate(config, value, total);
};

export const computeIndividualFlowRate = (entry?: boolean | number, value?: number): number => {
  if (entry !== false && value) {
    return value;
  }
  if (typeof entry === "number") {
    return entry;
  }
  return 1.66;
};
