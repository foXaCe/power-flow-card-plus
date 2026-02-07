export const loadHaForm = async () => {
  if (!customElements.get("ha-form")) {
    (customElements.get("hui-button-card") as any)?.getConfigElement();
  }
  if (!customElements.get("ha-entity-picker")) {
    (customElements.get("hui-entities-card") as any)?.getConfigElement();
  }
  if (customElements.get("ha-form")) return;

  await (window as any).loadCardHelpers?.();
};
