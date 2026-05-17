import type { CirclePosition } from "@/power-flow-card-plus-config";

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export const customPositionStyle = (position?: CirclePosition, important = false): string => {
  if (!position || !isFiniteNumber(position.top) || !isFiniteNumber(position.left)) {
    return "";
  }

  const suffix = important ? " !important" : "";
  return `top: ${position.top}px${suffix}; left: ${position.left}px${suffix}; bottom: auto; right: auto; transform: none;`;
};
