export const loadHaForm = async () => {
  if (customElements.get("ha-form")) return;

  // Trigger HA's helpers to register `ha-form` if not yet defined.
  (customElements.get("hui-button-card") as any)?.getConfigElement();
  (customElements.get("hui-entities-card") as any)?.getConfigElement();

  await (window as any).loadCardHelpers?.();
  await customElements.whenDefined("ha-form");
};
