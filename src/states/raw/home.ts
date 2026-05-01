import { HomeAssistant } from "@/ha";
import { getSecondaryState } from "./base";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";

export const getHomeSecondaryState = (hass: HomeAssistant, config: PowerFlowCardPlusConfig) => getSecondaryState(hass, config, "home");
