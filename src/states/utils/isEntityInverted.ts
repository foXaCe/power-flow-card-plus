import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { BaseConfigEntity, EntityType } from "@/type";

export const isEntityInverted = (config: PowerFlowCardPlusConfig, entityType: EntityType) =>
  !!(config.entities[entityType] as BaseConfigEntity | undefined)?.invert_state;
