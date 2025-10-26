import { ConfigEntities } from "@/power-flow-card-plus-config";

export type ConfigPage = keyof ConfigEntities | "advanced" | "custom_positions" | "individual" | null;
