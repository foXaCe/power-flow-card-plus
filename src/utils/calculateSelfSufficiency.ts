/**
 * Calcule le pourcentage d'autosuffisance énergétique
 * Autosuffisance = (Production solaire directe + Batterie vers maison) / Consommation totale
 */
export function calculateSelfSufficiency(
  solarToHome: number,
  batteryToHome: number,
  gridToHome: number
): number {
  const renewableEnergy = solarToHome + batteryToHome;
  const totalConsumption = solarToHome + batteryToHome + gridToHome;

  if (totalConsumption === 0) return 0;

  const percentage = (renewableEnergy / totalConsumption) * 100;
  return Math.round(Math.min(100, Math.max(0, percentage)));
}

/**
 * Retourne la couleur en fonction du pourcentage d'autosuffisance
 */
export function getSelfSufficiencyColor(percentage: number): string {
  if (percentage >= 80) return '#4caf50'; // Vert - Excellent
  if (percentage >= 60) return '#8bc34a'; // Vert clair - Très bon
  if (percentage >= 40) return '#ff9800'; // Orange - Bon
  if (percentage >= 20) return '#ff5722'; // Orange foncé - Moyen
  return '#f44336'; // Rouge - Faible
}
