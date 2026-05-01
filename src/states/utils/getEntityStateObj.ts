import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "@/ha";
import { isEntityAvailable } from "./existenceEntity";
import { unavailableOrMisconfiguredError } from "@/utils/unavailableError";
import { getFirstEntityName } from "./mutliEntity";

export const getEntityStateObj = (hass: HomeAssistant, entity: string | undefined): HassEntity | undefined => {
  if (!entity || !isEntityAvailable(hass, entity)) {
    unavailableOrMisconfiguredError(entity);
    return undefined;
  }

  return hass.states[getFirstEntityName(entity)];
};
