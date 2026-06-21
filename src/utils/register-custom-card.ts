import type { HomeAssistant } from "../ha";

/** Suggestion renvoyée au card picker pour une entité donnée (HA 2026.6+). */
export interface EntitySuggestion {
  config: Record<string, unknown>;
}

interface RegisterCardParams {
  type: string;
  name: string;
  description: string;
  /**
   * Hook optionnel « 2026.6+ » : permet à la carte de se proposer elle-même
   * dans le card picker quand l'utilisateur choisit une entité pertinente.
   * Propriété purement additive — ignorée par les versions de HA qui ne la
   * supportent pas encore, donc sans risque sur l'existant.
   */
  getEntitySuggestion?: (hass: HomeAssistant, entityId: string) => EntitySuggestion | undefined;
}
export function registerCustomCard(params: RegisterCardParams) {
  const windowWithCards = window as unknown as Window & {
    customCards: unknown[];
  };
  windowWithCards.customCards = windowWithCards.customCards || [];

  windowWithCards.customCards.push({
    ...params,
    preview: true,
    documentationURL: `https://github.com/foXaCe/power-flow-card-plus`,
  });
}
