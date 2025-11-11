/**
 * Calcule un chemin SVG dynamique entre deux points
 * @param from Point de départ {x, y}
 * @param to Point d'arrivée {x, y}
 * @param radius Rayon du cercle pour éviter le chevauchement
 * @param curved Si true, crée une courbe, sinon une ligne droite
 * @returns Chemin SVG (path d attribute)
 */
export function calculateDynamicPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  radius: number = 73, // rayon par défaut du cercle
  curved: boolean = false
): string {
  // Calculer la direction et la distance
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return "M0,0"; // Pas de ligne si les points sont identiques
  }

  // Normaliser le vecteur de direction
  const nx = dx / distance;
  const ny = dy / distance;

  // Calculer les points de départ et d'arrivée en tenant compte du rayon des cercles
  const startX = from.x + nx * radius;
  const startY = from.y + ny * radius;
  const endX = to.x - nx * radius;
  const endY = to.y - ny * radius;

  if (curved) {
    // Créer une courbe de Bézier
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Offset perpendiculaire pour la courbure
    const offsetX = -ny * 30; // 30px de courbure
    const offsetY = nx * 30;

    return `M${startX},${startY} Q${midX + offsetX},${midY + offsetY} ${endX},${endY}`;
  }
  // Ligne droite
  return `M${startX},${startY} L${endX},${endY}`;
}

/**
 * Convertit des coordonnées absolues en coordonnées viewBox SVG (0-100)
 */
export function toSVGCoordinates(point: { x: number; y: number }, cardWidth: number, cardHeight: number): { x: number; y: number } {
  return {
    x: (point.x / cardWidth) * 100,
    y: (point.y / cardHeight) * 100,
  };
}
