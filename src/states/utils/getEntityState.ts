import { HomeAssistant } from "@/ha";
import { isEntityAvailable } from "./existenceEntity";
import { unavailableOrMisconfiguredError } from "@/utils/unavailableError";
import { coerceNumber } from "@/utils/utils";
import { getEntityNames } from "./mutliEntity";

export const getEntityState = (hass: HomeAssistant, entity: string | undefined): number | null => {
  if (!entity || !isEntityAvailable(hass, entity)) {
    unavailableOrMisconfiguredError(entity);
    return null;
  }

  const ids = getEntityNames(entity);

  let endResult: number = 0;
  for (const id of ids) {
    const stateObj = hass.states[id];
    if (stateObj) {
      // somehow using += does not work here (maybe something with rollup?)
      endResult += coerceNumber(stateObj.state);
    }
  }

  return endResult;
};
