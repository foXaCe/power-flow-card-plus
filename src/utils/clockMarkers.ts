import { svg } from "lit";

/**
 * Crée un marqueur d'heure pour les cadrans circulaires (12 graduations).
 * - Centre du SVG : (40, 40)
 * - Rayon extérieur : 38
 * - Rayon intérieur : 32 si heure principale (12, 3, 6, 9), sinon 33
 * - Stroke : `var(--primary-text-color)` avec opacité 0.5
 */
export const createHourMarker = (hour: number) => {
  const angle = hour * 30 - 90; // -90 pour commencer à 12h en haut
  const isMainHour = hour % 3 === 0; // 12, 3, 6, 9
  const outerRadius = 38;
  const innerRadius = isMainHour ? 32 : 33;

  const x1 = 40 + outerRadius * Math.cos((angle * Math.PI) / 180);
  const y1 = 40 + outerRadius * Math.sin((angle * Math.PI) / 180);
  const x2 = 40 + innerRadius * Math.cos((angle * Math.PI) / 180);
  const y2 = 40 + innerRadius * Math.sin((angle * Math.PI) / 180);

  return svg`<line
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
      stroke="var(--primary-text-color)"
      stroke-width="${isMainHour ? "2.5" : "1.5"}"
      opacity="0.5"
    />`;
};
