import { html, svg, TemplateResult } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { IndividualObject } from "../states/raw/individual/getIndividualObject";
import { NewDur, TemplatesObj } from "../type";
import { checkShouldShowDots } from "../utils/checkShouldShowDots";
import { computeIndividualFlowRate } from "../utils/computeFlowRate";
import { showLine } from "../utils/showLine";
import { styleLine } from "../utils/styleLine";
import { checkHasBottomIndividual } from "../utils/computeIndividualPosition";
import { individualSecondarySpan } from "./spans/individualSecondarySpan";

export type IndividualPosition = "left-top" | "left-bottom" | "right-top" | "right-bottom";

export interface IndividualElementProps {
  newDur: NewDur;
  templatesObj: TemplatesObj;
  individualObj?: IndividualObject;
  displayState: string;
  battery?: any;
  individualObjs?: IndividualObject[];
}

type Side = "left" | "right";
type Row = "top" | "bottom";

const SIDE: Record<IndividualPosition, Side> = {
  "left-top": "left",
  "left-bottom": "left",
  "right-top": "right",
  "right-bottom": "right",
};

const ROW: Record<IndividualPosition, Row> = {
  "left-top": "top",
  "left-bottom": "bottom",
  "right-top": "top",
  "right-bottom": "bottom",
};

// Static SVG path for left side variants. Right side path depends on hasBottomRow for right-top.
const LEFT_PATH: Record<"top" | "bottom", string> = {
  top: "M40 -10 v50",
  bottom: "M40 40 v-40",
};

// Direction icons: invertAnimation ? first : second
const ARROW_ICONS: Record<IndividualPosition, { onInvert: string; default: string }> = {
  "left-top": { onInvert: "mdi:arrow-down", default: "mdi:arrow-up" },
  "left-bottom": { onInvert: "mdi:arrow-up", default: "mdi:arrow-down" },
  "right-top": { onInvert: "mdi:arrow-down", default: "mdi:arrow-up" },
  "right-bottom": { onInvert: "mdi:arrow-down", default: "mdi:arrow-up" },
};

// Default duration fallback differs between left and right historically.
const DURATION_FALLBACK: Record<Side, number> = {
  left: 0,
  right: 1.66,
};

// Path id used in SVG (also for mpath xlink:href reference)
const PATH_ID: Record<IndividualPosition, string> = {
  "left-top": "individual-top",
  "left-bottom": "individual-bottom",
  "right-top": "individual-top-right-home",
  "right-bottom": "individual-bottom-right-home",
};

export const individualElement = (
  position: IndividualPosition,
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  { individualObj, templatesObj, displayState, newDur, battery, individualObjs }: IndividualElementProps
): TemplateResult => {
  if (!individualObj) return html`<div class="spacer"></div>`;

  const indexOfIndividual = config?.entities?.individual?.findIndex((e) => e.entity === individualObj.entity) ?? -1;
  if (indexOfIndividual === -1) return html`<div class="spacer"></div>`;

  const side = SIDE[position];
  const row = ROW[position];

  const duration = newDur.individual[indexOfIndividual] || DURATION_FALLBACK[side];

  // For left-bottom, the original code used `calculate_flow_rate !== false` (default true).
  // For all others it used the raw value. Preserve this exactly.
  const calculateFlowRate =
    position === "left-bottom" ? individualObj.field?.calculate_flow_rate !== false : individualObj?.field?.calculate_flow_rate;

  const showDots = checkShouldShowDots(config) && individualObj.state && individualObj.state >= (individualObj.displayZeroTolerance ?? 0);
  const lineVisible = showLine(config, individualObj.state || 0) && !config.entities.home?.hide;

  const arrowIcon = individualObj.invertAnimation ? ARROW_ICONS[position].onInvert : ARROW_ICONS[position].default;

  const labelHtml = html`<span class="label">${individualObj.name}</span>`;

  const valueSpan =
    individualObj?.field?.display_zero_state !== false || (individualObj.state || 0) > (individualObj.displayZeroTolerance ?? 0)
      ? html` <span class="individual-${row} individual-${position}">
          ${row === "bottom" && side === "left"
            ? // left-bottom: original markup did not have a leading line break/space inside the span
              html`${individualObj?.showDirection ? html`<ha-icon class="small" .icon=${arrowIcon}></ha-icon>` : ""}${displayState} `
            : html` ${individualObj?.showDirection ? html`<ha-icon class="small" .icon=${arrowIcon}></ha-icon>` : ""}${displayState} `}
        </span>`
      : "";

  const iconHtml = individualObj?.icon !== " " ? html` <ha-icon id="individual-${position}-icon" .icon=${individualObj?.icon} />` : null;

  const circleHtml = html`<div
    class="circle"
    @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
      main.openDetails(e, individualObj?.field?.tap_action, individualObj?.entity);
    }}
    @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
      if (e.key === "Enter") {
        main.openDetails(e, individualObj?.field?.tap_action, individualObj?.entity);
      }
    }}
  >
    ${individualSecondarySpan(main.hass, main, config, templatesObj, individualObj, indexOfIndividual, position)} ${iconHtml} ${valueSpan}
  </div>`;

  // SVG / line section depends on side
  let svgSection: TemplateResult | string = "";
  if (side === "left") {
    const pathId = PATH_ID[position];
    const pathD = LEFT_PATH[row];
    const dotsClass = `individual-${row}`;
    if (lineVisible) {
      svgSection = html`
        <svg width="80" height="30">
          <path d="${pathD}" id="${pathId}" class="${styleLine(individualObj?.state || 0, config)}" />
          ${showDots
            ? svg`<circle
                              r="1.75"
                              class="${dotsClass}"
                              vector-effect="non-scaling-stroke"
                            >
                              <animateMotion
                                dur="${computeIndividualFlowRate(calculateFlowRate, duration)}s"
                                repeatCount="indefinite"
                                calcMode="linear"
                                keyPoints=${individualObj.invertAnimation ? "0;1" : "1;0"}
                                keyTimes="0;1"
                              >
                                <mpath xlink:href="#${pathId}" />
                              </animateMotion>
                            </circle>`
            : ""}
        </svg>
      `;
    } else if (row === "bottom") {
      // left-bottom kept an empty svg in the original
      svgSection = html` <svg width="80" height="30"></svg> `;
    } else {
      svgSection = "";
    }
  } else {
    // right side
    const pathId = PATH_ID[position];
    const dotsClass = `individual-${row}`;
    let pathD: string;
    if (position === "right-top") {
      const hasBottomRow = !!battery?.has || checkHasBottomIndividual(individualObjs ?? []);
      pathD = `M${hasBottomRow ? 45 : 47},0 v15 c0,${hasBottomRow ? "30 -10,30 -30,30" : "35 -10,35 -30,35"} h-20`;
    } else {
      pathD = "M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20";
    }

    if (lineVisible) {
      svgSection = html`
        <div class="right-individual-flow-container">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="right-individual-flow">
            <path id="${pathId}" class="${styleLine(individualObj.state || 0, config)}" d="${pathD}" vector-effect="non-scaling-stroke" />
            ${showDots
              ? svg`<circle
                    r="1"
                    class="${dotsClass}"
                    vector-effect="non-scaling-stroke"
                    >

                    <animateMotion
                    dur="${computeIndividualFlowRate(calculateFlowRate, duration)}s"
                    repeatCount="indefinite"
                    calcMode="linear"
                    keyPoints=${individualObj.invertAnimation ? "0;1" : "1;0"}
                    keyTimes="0;1"
                    >
                    <mpath xlink:href="#${pathId}" />
                    </animateMotion>
                    </circle>`
              : ""}
          </svg>
        </div>
      `;
    } else {
      svgSection = "";
    }
  }

  // Compose the container based on row + side ordering
  // left-top:    container "circle-container individual-top"                     -> label, circle, svg
  // left-bottom: container "circle-container individual-bottom bottom"           -> svg, circle, label
  // right-top:   container "circle-container individual-top individual-right individual-right-top"    -> label, circle, svg
  // right-bottom:container "circle-container individual-bottom individual-right individual-right-bottom" -> circle, label, svg

  if (position === "left-top") {
    return html`<div class="circle-container individual-top">${labelHtml} ${circleHtml} ${svgSection}</div>`;
  }

  if (position === "left-bottom") {
    return html`<div class="circle-container individual-bottom bottom">${svgSection} ${circleHtml} ${labelHtml}</div> `;
  }

  if (position === "right-top") {
    return html`<div class="circle-container individual-top individual-right individual-right-top">${labelHtml} ${circleHtml} ${svgSection}</div>`;
  }

  // right-bottom
  return html`<div class="circle-container individual-bottom individual-right individual-right-bottom">
    ${circleHtml} ${labelHtml} ${svgSection}
  </div>`;
};
