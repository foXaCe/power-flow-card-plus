import memoizeOne from "memoize-one";

export const customPositionsSchema = memoizeOne((localize) => [
  {
    name: "custom_positions",
    type: "grid",
    column_min_width: "200px",
    schema: [
      {
        name: "solar",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.solar_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.solar_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
      {
        name: "grid",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.grid_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.grid_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
      {
        name: "home",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.home_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.home_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
      {
        name: "battery",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.battery_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.battery_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
      {
        name: "daily_cost",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.daily_cost_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.daily_cost_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
      {
        name: "daily_export",
        type: "grid",
        column_min_width: "200px",
        schema: [
          {
            name: "top",
            label: localize("editor.daily_export_top"),
            selector: { number: { mode: "box", step: 1 } },
          },
          {
            name: "left",
            label: localize("editor.daily_export_left"),
            selector: { number: { mode: "box", step: 1 } },
          },
        ],
      },
    ],
  },
]);
