import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { ConfigEntities } from "../power-flow-card-plus-config";
import { IndividualObject } from "../states/raw/individual/getIndividualObject";
import { IndividualDeviceType } from "../type";
import { convertColorListToHex } from "../utils/convertColor";
import { computeColor } from "./colors";

interface AllDynamicStyles {
  individual: IndividualObject[];
  entities: ConfigEntities;
  [key: string]: any;
}

const INDIVIDUAL_COLORS = ["#d0cc5b", "#964cb5", "#b54c9d", "#5bd0cc"];
const INDIVIDUAL_FIELD_NAMES: string[] = ["left-top", "left-bottom", "right-top", "right-bottom"];

export const allDynamicStyles = (
  main: PowerFlowCardPlus,
  {
    grid,
    solar,
    entities,
    individual,
    battery,
    homeSources,
    homeLargestSource,
    nonFossil,
    display_zero_lines_transparency,
    display_zero_lines_grey_color,
    isCardWideEnough,
  }: AllDynamicStyles
) => {
  // Grid
  main.style.setProperty(
    "--icon-grid-color",
    grid.color.icon_type === "consumption"
      ? "var(--energy-grid-consumption-color)"
      : grid.color.icon_type === "production"
        ? "var(--energy-grid-return-color)"
        : grid.color.icon_type === true
          ? (grid.state.fromGrid ?? 0) > (grid.state.toGrid ?? 0)
            ? "var(--energy-grid-consumption-color)"
            : "var(--energy-grid-return-color)"
          : "var(--primary-text-color)"
  );

  main.style.setProperty(
    "--circle-grid-color",
    grid.color.circle_type === "consumption"
      ? "var(--energy-grid-consumption-color)"
      : grid.color.circle_type === "production"
        ? "var(--energy-grid-return-color)"
        : grid.color.circle_type === true
          ? (grid.state.fromGrid ?? 0) > (grid.state.toGrid ?? 0)
            ? "var(--energy-grid-consumption-color)"
            : "var(--energy-grid-return-color)"
          : "var(--energy-grid-consumption-color)"
  );

  if (grid.color.fromGrid !== undefined) {
    const gridFromGrid = typeof grid.color.fromGrid === "object" ? convertColorListToHex(grid.color.fromGrid) : grid.color.fromGrid;
    main.style.setProperty("--energy-grid-consumption-color", gridFromGrid || "#a280db");
  }

  if (grid.color.toGrid !== undefined) {
    const gridToGrid = typeof grid.color.toGrid === "object" ? convertColorListToHex(grid.color.toGrid) : grid.color.toGrid;
    main.style.setProperty("--energy-grid-return-color", gridToGrid || "#a280db");
  }

  main.style.setProperty(
    "--secondary-text-grid-color",
    grid.secondary.color.type === "consumption"
      ? "var(--energy-grid-consumption-color)"
      : grid.secondary.color.type === "production"
        ? "var(--energy-grid-return-color)"
        : grid.secondary.color.type === true
          ? (grid.state.fromGrid ?? 0) >= (grid.state.toGrid ?? 0)
            ? "var(--energy-grid-consumption-color)"
            : "var(--energy-grid-return-color)"
          : "var(--primary-text-color)"
  );

  if (entities.grid?.color_value === false) {
    main.style.setProperty("--text-grid-consumption-color", "var(--primary-text-color)");
    main.style.setProperty("--text-grid-return-color", "var(--primary-text-color)");
  } else {
    main.style.setProperty("--text-grid-consumption-color", "var(--energy-grid-consumption-color)");
    main.style.setProperty("--text-grid-return-color", "var(--energy-grid-return-color)");
  }

  // Solar
  main.style.setProperty("--text-solar-color", entities.solar?.color_value ? "var(--energy-solar-color)" : "var(--primary-text-color)");

  main.style.setProperty(
    "--secondary-text-solar-color",
    entities.solar?.secondary_info?.color_value ? "var(--energy-solar-color)" : "var(--primary-text-color)"
  );

  if (entities.solar?.color !== undefined) {
    let solarColor = entities.solar?.color;
    if (typeof solarColor === "object") solarColor = convertColorListToHex(solarColor);
    main.style.setProperty("--energy-solar-color", solarColor || "#ff9800");
  }
  main.style.setProperty("--icon-solar-color", entities.solar?.color_icon ? "var(--energy-solar-color)" : "var(--primary-text-color)");

  // Battery
  if (battery.color.fromBattery !== undefined) {
    const batteryFromBattery =
      typeof battery.color.fromBattery === "object" ? convertColorListToHex(battery.color.fromBattery) : battery.color.fromBattery;
    main.style.setProperty("--energy-battery-out-color", batteryFromBattery || "#4db6ac");
  }
  if (battery.color.toBattery !== undefined) {
    const batteryToBattery = typeof battery.color.toBattery === "object" ? convertColorListToHex(battery.color.toBattery) : battery.color.toBattery;
    main.style.setProperty("--energy-battery-in-color", batteryToBattery || "#a280db");
  }
  battery.color.icon_type = entities.battery?.color_icon;
  main.style.setProperty(
    "--icon-battery-color",
    battery.color.icon_type === "consumption"
      ? "var(--energy-battery-in-color)"
      : battery.color.icon_type === "production"
        ? "var(--energy-battery-out-color)"
        : battery.color.icon_type === true
          ? battery.state.fromBattery >= battery.state.toBattery
            ? "var(--energy-battery-out-color)"
            : "var(--energy-battery-in-color)"
          : "var(--primary-text-color)"
  );
  const batteryStateOfChargeColorType = entities.battery?.color_state_of_charge_value;
  main.style.setProperty(
    "--text-battery-state-of-charge-color",
    batteryStateOfChargeColorType === "consumption"
      ? "var(--energy-battery-in-color)"
      : batteryStateOfChargeColorType === "production"
        ? "var(--energy-battery-out-color)"
        : batteryStateOfChargeColorType === true
          ? battery.state.fromBattery >= battery.state.toBattery
            ? "var(--energy-battery-out-color)"
            : "var(--energy-battery-in-color)"
          : "var(--primary-text-color)"
  );
  main.style.setProperty(
    "--circle-battery-color",
    battery.color.circle_type === "consumption"
      ? "var(--energy-battery-in-color)"
      : battery.color.circle_type === "production"
        ? "var(--energy-battery-out-color)"
        : battery.color.circle_type === true
          ? battery.state.fromBattery >= battery.state.toBattery
            ? "var(--energy-battery-out-color)"
            : "var(--energy-battery-in-color)"
          : "var(--energy-battery-in-color)"
  );
  if (entities.battery?.color_value === false) {
    main.style.setProperty("--text-battery-in-color", "var(--primary-text-color)");
    main.style.setProperty("--text-battery-out-color", "var(--primary-text-color)");
  } else {
    main.style.setProperty("--text-battery-in-color", "var(--energy-battery-in-color)");
    main.style.setProperty("--text-battery-out-color", "var(--energy-battery-out-color)");
  }

  // Non-fossil
  if (nonFossil.color !== undefined) {
    const nonFossilColor = typeof nonFossil.color === "object" ? convertColorListToHex(nonFossil.color) : nonFossil.color;
    main.style.setProperty("--non-fossil-color", nonFossilColor || "var(--energy-non-fossil-color)");
  }
  main.style.setProperty(
    "--icon-non-fossil-color",
    entities.fossil_fuel_percentage?.color_icon ? "var(--non-fossil-color)" : "var(--primary-text-color)"
  );
  main.style.setProperty(
    "--text-non-fossil-color",
    entities.fossil_fuel_percentage?.color_value ? "var(--non-fossil-color)" : "var(--primary-text-color)"
  );
  main.style.setProperty(
    "--secondary-text-non-fossil-color",
    entities.fossil_fuel_percentage?.secondary_info?.color_value ? "var(--non-fossil-color)" : "var(--primary-text-color)"
  );

  // Home
  main.style.setProperty(
    "--secondary-text-home-color",
    entities.home?.secondary_info?.color_value ? "var(--text-home-color)" : "var(--primary-text-color)"
  );
  main.style.setProperty("--icon-home-color", computeColor(entities.home?.color_icon, homeSources, homeLargestSource));
  main.style.setProperty("--text-home-color", computeColor(entities.home?.color_value, homeSources, homeLargestSource));

  // --home-circle-animation
  if (entities.home?.circle_animation === false) main.style.setProperty("--home-circle-animation", "none");

  //   Battery-Grid line
  main.style.setProperty(
    "--battery-grid-line",
    (grid.state.toBattery || 0) > 0 ? "var(--energy-grid-consumption-color)" : "var(--energy-grid-return-color)"
  );

  // Transparencies
  main.style.setProperty("--transparency-unused-lines", String(display_zero_lines_transparency ?? 0));

  if (display_zero_lines_grey_color !== undefined) {
    let greyColor = display_zero_lines_grey_color;
    if (typeof greyColor === "object") greyColor = convertColorListToHex(greyColor);
    main.style.setProperty("--greyed-out--line-color", greyColor);
  }

  if (solar.has) {
    if (battery.has) {
      // has solar, battery and grid
      main.style.setProperty("--lines-svg-not-flat-line-height", "106%");
      main.style.setProperty("--lines-svg-not-flat-line-top", "-3%");
      main.style.setProperty("--lines-svg-flat-width", isCardWideEnough ? "calc(100% - 160px)" : "calc(100% - 160px)");
      main.style.setProperty("--lines-svg-flat-left", "0");
      main.style.setProperty("--lines-svg-not-flat-left", "0");
    } else {
      // has solar but no battery
      main.style.setProperty("--lines-svg-not-flat-line-top", "-2%");
      main.style.setProperty("--lines-svg-flat-width", isCardWideEnough ? "calc(100% - 154px)" : "calc(100% - 157px)");
      main.style.setProperty("--lines-svg-not-flat-width", isCardWideEnough ? "calc(103% - 172px)" : "calc(103% - 169px)");
      main.style.setProperty("--lines-svg-not-flat-left", "3px");
      main.style.setProperty("--lines-svg-flat-left", "-3px");
    }
  }

  if (individual?.some((ind) => ind.has)) {
    const getStylesForIndividual = (field: IndividualDeviceType, index: number) => {
      const fieldName = INDIVIDUAL_FIELD_NAMES?.[index] || "left-top";

      let individualColor = field?.color;
      if (typeof individualColor === "object") individualColor = convertColorListToHex(individualColor);
      main.style.setProperty(`--individual-${fieldName}-color`, individualColor || INDIVIDUAL_COLORS[index] || "#d0cc5b");

      main.style.setProperty(
        `--icon-individual-${fieldName}-color`,
        field?.color_icon !== false ? `var(--individual-${fieldName}-color)` : `var(--primary-text-color)`
      );
      main.style.setProperty(
        `--text-individual-${fieldName}-color`,
        field?.color_value ? `var(--individual-${fieldName}-color)` : `var(--primary-text-color)`
      );
      main.style.setProperty(
        `--secondary-text-individual-${fieldName}-color`,
        field?.secondary_info?.color_value ? `var(--individual-${fieldName}-color)` : `var(--primary-text-color)`
      );
    };

    let individualIndex = 0;
    individual.forEach((ind, index) => {
      if (!ind.has) return;
      const entry = entities?.individual?.[index];
      if (!entry) return;
      getStylesForIndividual(entry, individualIndex);
      individualIndex++;
    });
  }
};
