import memoizeOne from "memoize-one";

export const customPositionsSchema = memoizeOne((localize) => [
  {
    name: "custom_positions",
    type: "grid",
    column_min_width: "200px",
    schema: [
      {
        name: "solar",
        type: "expandable",
        title: localize("editor.solar"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
      {
        name: "grid",
        type: "expandable",
        title: localize("editor.grid"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
      {
        name: "home",
        type: "expandable",
        title: localize("editor.home"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
      {
        name: "battery",
        type: "expandable",
        title: localize("editor.battery"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
      {
        name: "daily_cost",
        type: "expandable",
        title: localize("editor.daily_cost_title"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
      {
        name: "daily_export",
        type: "expandable",
        title: localize("editor.daily_export_title"),
        schema: [
          {
            type: "grid",
            column_min_width: "200px",
            schema: [
              {
                name: "top",
                label: localize("editor.position_top"),
                selector: { number: { mode: "box", step: 1 } },
              },
              {
                name: "left",
                label: localize("editor.position_left"),
                selector: { number: { mode: "box", step: 1 } },
              },
            ],
          },
        ],
      },
    ],
  },
]);
