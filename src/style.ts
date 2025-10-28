import { css } from "lit";

export const styles = css`
  :host {
    --size-circle-entity: 79.99px;
    --mdc-icon-size: 24px;
    --clickable-cursor: pointer;
    --individual-left-bottom-color: #d0cc5b;
    --individual-left-top-color: #964cb5;
    --individual-right-top-color: #b54c9d;
    --individual-right-bottom-color: #5bd0cc;
    --non-fossil-color: var(--energy-non-fossil-color, #0f9d58);
    --icon-non-fossil-color: var(--non-fossil-color, #0f9d58);
    --icon-solar-color: var(--energy-solar-color, #ff9800);
    --icon-individual-bottom-color: var(--individual-left-bottom-color, #d0cc5b);
    --icon-individual-top-color: var(--individual-left-top-color, #964cb5);
    --icon-grid-color: var(--energy-grid-consumption-color, #488fc2);
    --icon-battery-color: var(--energy-battery-in-color, #f06292);
    --icon-home-color: var(--energy-grid-consumption-color, #488fc2);
    --text-solar-color: var(--primary-text-color);
    --text-non-fossil-color: var(--primary-text-color);
    --text-individual-bottom-color: var(--primary-text-color);
    --text-individual-top-color: var(--primary-text-color);
    --text-home-color: var(--primary-text-color);
    --secondary-text-individual-bottom-color: var(--primary-text-color);
    --secondary-text-individual-top-color: var(--primary-text-color);
    --text-battery-state-of-charge-color: var(--primary-text-color);
    --cirlce-grid-color: var(--energy-grid-consumption-color, #488fc2);
    --circle-battery-color: var(--energy-battery-in-color, #f06292);
    --battery-grid-line: var(--energy-grid-return-color, #8353d1);
    --secondary-text-solar-color: var(--primary-text-color);
    --secondary-text-grid-color: var(--primary-text-color);
    --secondary-text-home-color: var(--primary-text-color);
    --secondary-text-non-fossil-color: var(--primary-text-color);
    --lines-svg-not-flat-line-height: 106%;
    --lines-svg-not-flat-line-top: -2%;
    --lines-svg-flat-width: calc(100% - var(--size-circle-entity) * 2);
    --lines-svg-not-flat-width: calc(100% - var(--size-circle-entity) * 2 + 3%);
    --lines-svg-not-flat-multi-indiv-height: 104%;
    --lines-svg-not-flat-multi-indiv-width: calc((100% - var(--size-circle-entity) * 2) * 0.5);
    --lines-svg-not-flat-multi-indiv-right-indiv-width: calc((100% - var(--size-circle-entity) * 2) * 0.5);
    --lines-svg-not-flat-multi-indiv-right-indiv-height: 103%;
    --lines-svg-flat-multi-indiv-width: calc((100% - var(--size-circle-entity) * 2) * 0.5);
    --lines-svg-flat-left: 0;
    --lines-svg-not-flat-left: 0;
    --dot-size: 3.5px;

    --transparency: var(--transparency-unused-lines);
    --greyed-out--line-color: #bdbdbd;
    --text-grid-consumption-color: var(--energy-grid-consumption-color);
    --text-grid-return-color: var(--energy-grid-return-color);
    --text-battery-in-color: var(--energy-battery-in-color);
    --text-battery-out-color: var(--energy-battery-out-color);
    --home-circle-animation: rotate-in 0.6s ease-in;
  }

  ha-card {
    overflow: hidden;
  }

  ha-card.full-size {
    height: 100%;
  }

  .card-content.full-size {
    transform: scale(2) translateY(30%);
  }

  .card-content {
    position: relative;
    margin: 0 auto;
    min-height: 400px;
    height: 400px;
  }

  /* Nouveau layout absolu pour tous les cercles */
  .circle-container {
    position: absolute !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1; /* Au-dessus des lignes (z-index: 0) */
  }

  /* Positions par défaut de chaque cercle */
  .circle-container.solar {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .circle-container.grid {
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
  }

  .circle-container.home {
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .circle-container.battery {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .circle-container.daily-cost {
    top: 160px;
    left: 20px;
    transform: none;
  }

  .circle-container.daily-export {
    top: 20px;
    right: 120px;
    transform: none;
  }

  .circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-sizing: border-box;
    border: var(--circle-border-width, 2px) solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12px;
    line-height: 12px;
    position: relative;
    text-decoration: none;
    color: var(--primary-text-color);
    gap: 2px;
    z-index: 2;
    background-color: var(--card-background-color); /* hide overflowing lines behind background */
  }

  .card-content,
  .row {
    max-width: 470px;
  }
  .lines {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 146px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    box-sizing: border-box;
    z-index: 1;
  }

  .lines:not(.multi-individual) svg.flat-line {
    left: var(--lines-svg-flat-left);
  }

  .lines:not(.multi-individual) svg:not(.flat-line) {
    left: var(--lines-svg-not-flat-left);
  }

  .lines:has(svg:not(.flat-line)) {
    margin-left: -1%;
  }
  .lines.individual-bottom-individual-top {
    bottom: 110px;
  }
  .lines.high {
    bottom: 100px;
    height: 156px;
  }
  .lines svg {
    width: var(--lines-svg-flat-width);
    height: 100%;
    position: relative;
  }

  .lines svg:not(.flat-line) {
    width: var(--lines-svg-not-flat-width);
    height: var(--lines-svg-not-flat-line-height);
    top: var(--lines-svg-not-flat-line-top);
  }

  .multi-individual {
    left: calc(var(--size-circle-entity) + 2%);
    margin-left: -2.2% !important;
  }

  .multi-individual svg {
    width: var(--lines-svg-flat-multi-indiv-width);
  }

  .multi-individual svg:not(.flat-line) {
    width: var(--lines-svg-not-flat-multi-indiv-width);
    margin-top: 1px;
    height: var(--lines-svg-not-flat-multi-indiv-height);
  }

  /* Supprimé - plus besoin de .row et .grid-column-wrapper avec le layout absolu */

  .daily-cost-container {
    position: absolute;
    top: 160px;
    left: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
    pointer-events: auto;
  }

  .daily-export-floating {
    position: absolute;
    top: 20px;
    right: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    pointer-events: auto;
  }

  /* Anciens styles flexbox supprimés - maintenant en absolute */
  .spacer {
    width: var(--size-circle-entity);
  }

  .circle-container .circle {
    cursor: var(--clickable-cursor);
  }
  #battery-grid {
    stroke: var(--battery-grid-line);
  }
  ha-icon {
    padding-bottom: 2px;
  }
  ha-icon.small {
    --mdc-icon-size: 12px;
  }
  .label {
    color: var(--secondary-text-color);
    font-size: 12px;
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 20px;
  }

  .daily-export .label {
    max-width: 120px;
  }

  .daily-export .circle {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .daily-export-arrow {
    position: absolute;
    height: 15px;
    width: 80px;
    top: 50%;
    right: 100%;
    margin-right: 8px;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 3;
  }

  .daily-export-arrow path {
    stroke: var(--energy-solar-color);
    stroke-width: 1.5px;
  }

  .daily-export-arrow circle {
    fill: var(--energy-solar-color);
  }

  .cost-info {
    color: var(--secondary-text-color);
    font-size: 10px;
    margin-top: 2px;
    display: block;
    font-weight: 500;
  }

  .daily-cost .circle {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    position: relative;
    border-width: 0;
  }

  .daily-cost #daily-cost-icon {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
  }

  .daily-cost .daily-cost-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .daily-cost .daily-cost-energy {
    font-size: 11px;
    color: var(--secondary-text-color);
    font-weight: 500;
    white-space: nowrap;
  }

  circle.daily-cost-base {
    stroke: var(--primary-text-color);
    fill: none;
    stroke-width: 4px;
    opacity: 0.15;
    pointer-events: none;
  }

  circle.daily-cost-progress {
    stroke: #ff0000;
    fill: none;
    stroke-width: 4px;
    stroke-linecap: round;
    opacity: 1;
    z-index: 10;
  }

  .daily-cost-arrow {
    height: 35px;
    width: 20px;
    margin: 0;
    position: relative;
    z-index: 3;
  }

  .daily-cost-arrow path {
    stroke: var(--energy-grid-consumption-color);
    stroke-width: 2;
    fill: none;
  }

  .daily-cost-arrow circle {
    fill: var(--energy-grid-consumption-color);
  }

  .daily-export .circle {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  line,
  path {
    stroke: var(--disabled-text-color);
    stroke-width: 1;
    fill: none;
  }
  path.transparency,
  line.transparency {
    opacity: calc(calc(100 - var(--transparency)) / 100);
  }
  path.grey,
  line.grey {
    stroke: var(--greyed-out--line-color) !important;
  }
  .circle svg {
    position: absolute;
    fill: none;
    stroke-width: 4px;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  span.secondary-info {
    color: var(--primary-text-color);
    font-size: 12px;
    max-width: 60px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .individual-top path,
  .individual-top circle {
    stroke: var(--individual-left-top-color);
  }

  #individual-left-bottom-icon {
    color: var(--icon-individual-left-bottom-color);
  }
  #individual-left-top-icon {
    color: var(--icon-individual-left-top-color);
  }

  #individual-right-bottom-icon {
    color: var(--icon-individual-right-bottom-color);
  }
  #individual-right-top-icon {
    color: var(--icon-individual-right-top-color);
  }

  #solar-icon {
    color: var(--icon-solar-color);
  }
  circle.individual-top {
    stroke-width: 4;
    width: var(--dot-size);
    fill: var(--individual-left-top-color);
  }
  circle.individual-bottom {
    stroke-width: 4;
    width: var(--dot-size);
    fill: var(--individual-left-bottom-color);
  }
  .individual-top .circle {
    border-color: var(--individual-left-top-color);
  }
  .individual-bottom path,
  .individual-bottom circle {
    stroke: var(--individual-left-bottom-color);
  }
  .individual-bottom .circle {
    border-color: var(--individual-left-bottom-color);
  }

  .individual-right-top .circle {
    border-color: var(--individual-right-top-color);
  }

  circle.individual-right-top .circle {
    fill: var(--individual-right-top-color);
  }

  .individual-right-top path,
  .individual-right-top circle {
    stroke: var(--individual-right-top-color);
  }
  .individual-right-bottom .circle {
    border-color: var(--individual-right-bottom-color);
  }

  circle.individual-right-bottom .circle {
    fill: var(--individual-right-bottom-color);
  }

  .individual-right-bottom path,
  .individual-right-bottom circle {
    stroke: var(--individual-right-bottom-color);
  }

  .right-individual-flow-container {
    position: absolute;
    right: calc(var(--size-circle-entity) - 27% * 1.1 + 6px);
    width: 100%;
    display: flex;
    justify-content: flex-end;
    height: 156px;
    bottom: 100px;
    padding: 0 16px 16px;
    margin-right: -1.2%;
    box-sizing: border-box;
    pointer-events: none;
  }
  .right-individual-flow-container > svg {
    width: var(--lines-svg-not-flat-multi-indiv-right-indiv-width);
  }

  .right-individual-flow {
    height: var(--lines-svg-not-flat-multi-indiv-right-indiv-height);
    margin-top: 2px;
    width: var(--lines-svg-not-flat-multi-indiv-width);
    top: var(--lines-svg-not-flat-line-top);
    position: relative;
  }
  .circle-container.low-carbon {
    height: 130px;
  }
  .low-carbon path {
    stroke: var(--non-fossil-color);
  }
  .low-carbon .circle {
    border-color: var(--non-fossil-color);
  }
  .low-carbon ha-icon:not(.small) {
    color: var(--icon-non-fossil-color);
  }
  circle.low-carbon {
    stroke-width: 4;
    fill: var(--non-fossil-color);
    stroke: var(--non-fossil-color);
  }
  .solar {
    color: var(--primary-text-color);
  }
  .solar .circle {
    border-color: var(--energy-solar-color);
  }
  .solar ha-icon:not(.small) {
    color: var(--icon-solar-color);
  }
  circle.solar,
  path.solar,
  line.solar {
    stroke: var(--energy-solar-color);
  }
  circle.solar {
    stroke-width: 4;
    fill: var(--energy-solar-color);
  }
  .battery .circle {
    border-color: var(--circle-battery-color);
    gap: 0px;
    font-size: 11px;
    line-height: 11px;
  }
  circle.battery,
  path.battery,
  line.battery {
    stroke: var(--energy-battery-out-color);
  }
  path.battery-home,
  line.battery-home,
  circle.battery-home {
    stroke: var(--energy-battery-out-color);
  }
  circle.battery-home {
    stroke-width: 4;
    fill: var(--energy-battery-out-color);
  }
  path.battery-solar,
  line.battery-solar,
  circle.battery-solar {
    stroke: var(--energy-battery-in-color);
  }
  circle.battery-solar {
    stroke-width: 4;
    fill: var(--energy-battery-in-color);
  }
  .battery-in {
    color: var(--energy-battery-in-color);
  }
  .battery-out {
    color: var(--energy-battery-out-color);
  }
  span.battery-in {
    color: var(--text-battery-in-color);
  }
  span.battery-out {
    color: var(--text-battery-out-color);
  }
  path.battery-from-grid,
  line.battery-from-grid {
    stroke: var(--energy-grid-consumption-color);
  }
  path.battery-to-grid,
  line.battery-to-grid {
    stroke: var(--battery-grid-line);
  }
  .battery ha-icon:not(.small) {
    color: var(--icon-battery-color);
  }

  path.return,
  line.return,
  circle.return,
  circle.battery-to-grid {
    stroke: var(--energy-grid-return-color);
  }
  circle.return,
  circle.battery-to-grid {
    stroke-width: 4;
    fill: var(--energy-grid-return-color);
  }
  .return {
    color: var(--energy-grid-return-color);
  }
  span.return {
    color: var(--text-grid-return-color);
  }
  .grid .circle {
    border-color: var(--circle-grid-color);
  }
  .consumption {
    color: var(--energy-grid-consumption-color);
  }
  span.consumption {
    color: var(--text-grid-consumption-color);
  }
  circle.grid,
  circle.battery-from-grid,
  path.grid,
  line.grid {
    stroke: var(--energy-grid-consumption-color);
  }
  circle.grid,
  circle.battery-from-grid {
    stroke-width: 4;
    fill: var(--energy-grid-consumption-color);
  }
  .grid ha-icon:not(.small) {
    color: var(--icon-grid-color);
  }
  .home .circle {
    border-width: 0;
    border-color: var(--primary-color);
  }
  .home .circle.border {
    border-width: 2px;
  }
  .home ha-icon:not(.small) {
    color: var(--icon-home-color);
  }
  .circle svg circle {
    animation: var(--home-circle-animation);
    transition: stroke-dashoffset 0.4s, stroke-dasharray 0.4s;
    fill: none;
  }
  span.solar {
    color: var(--text-solar-color);
  }

  span.low-carbon {
    color: var(--text-non-fossil-color);
  }

  span.low-carbon.secondary-info {
    color: var(--secondary-text-non-fossil-color);
  }

  #home-circle {
    color: var(--text-home-color);
    z-index: 3;
  }

  .individual-bottom .circle {
    color: var(--text-individual-bottom-color);
  }

  .individual-top .circle {
    color: var(--text-individual-top-color);
  }

  .individual-bottom span.secondary-info {
    color: var(--secondary-text-individual-bottom-color);
  }

  .individual-top span.secondary-info {
    color: var(--secondary-text-individual-top-color);
  }

  span.secondary-info.left-top {
    color: var(--secondary-text-individual-left-top-color);
  }
  span.individual-left-top {
    color: var(--text-individual-left-top-color);
  }
  span.secondary-info.left-bottom {
    color: var(--secondary-text-individual-left-bottom-color);
  }
  span.individual-left-bottom {
    color: var(--text-individual-left-bottom-color);
  }
  span.secondary-info.right-top {
    color: var(--secondary-text-individual-right-top-color);
  }
  span.individual-right-top {
    color: var(--text-individual-right-top-color);
  }

  span.secondary-info.right-bottom {
    color: var(--secondary-text-individual-right-bottom-color);
  }
  span.individual-right-bottom {
    color: var(--text-individual-right-bottom-color);
  }

  .solar span.secondary-info {
    color: var(--secondary-text-solar-color);
  }

  .grid span.secondary-info {
    color: var(--secondary-text-grid-color);
  }

  .home span.secondary-info {
    color: var(--secondary-text-home-color);
  }

  #battery-state-of-charge-text {
    color: var(--text-battery-state-of-charge-color);
  }

  @keyframes rotate-in {
    from {
      stroke-dashoffset: 238.76104;
      stroke-dasharray: 238.76104;
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-actions a {
    text-decoration: none;
  }

  .home-circle-sections {
    pointer-events: none;
  }

  /* ===== Phase 1 Features ===== */

  /* Pulse Animation */
  .circle.pulse-animation {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(128, 128, 128, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 8px rgba(128, 128, 128, 0);
    }
  }

  /* Compact Mode */
  .card-content.compact-mode {
    --size-circle-entity: 65px;
    --mdc-icon-size: 20px;
  }

  .card-content.compact-mode .circle {
    width: 65px;
    height: 65px;
    font-size: 10px;
    line-height: 10px;
  }

  .card-content.compact-mode .circle-container.solar,
  .card-content.compact-mode .circle-container.individual-top {
    height: 110px;
  }

  .card-content.compact-mode .circle-container.battery {
    height: 95px;
  }

  .card-content.compact-mode .label {
    font-size: 10px;
  }

  /* Gradient Mode */
  .card-content.gradient-mode .solar .circle {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.05) 100%), var(--card-background-color);
  }

  .card-content.gradient-mode .battery .circle {
    background: linear-gradient(135deg, rgba(240, 98, 146, 0.2) 0%, rgba(240, 98, 146, 0.05) 100%), var(--card-background-color);
  }

  .card-content.gradient-mode .grid .circle {
    background: linear-gradient(135deg, rgba(72, 143, 194, 0.2) 0%, rgba(72, 143, 194, 0.05) 100%), var(--card-background-color);
  }

  .card-content.gradient-mode .home .circle {
    background: linear-gradient(135deg, rgba(72, 143, 194, 0.2) 0%, rgba(72, 143, 194, 0.05) 100%), var(--card-background-color);
  }

  /* Bouton reset discret */
  .edit-buttons-container {
    position: absolute;
    bottom: 4px;
    right: 4px;
    z-index: 5;
    display: flex;
    gap: 8px;
  }

  .reset-positions-button {
    padding: 4px;
    background: transparent;
    color: var(--secondary-text-color);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    opacity: 0.3;
  }

  .reset-positions-button:hover {
    background: rgba(255, 100, 100, 0.2);
    color: var(--primary-text-color);
    opacity: 1;
    transform: scale(1.2);
  }

  /* Les bulles sont toujours déplaçables */
  .circle-container {
    cursor: move !important;
  }

  .circle {
    cursor: move !important;
  }
`;
