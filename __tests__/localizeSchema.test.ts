import { localizeSchema } from "../src/ui-editor/utils/localizeSchema";

describe("localizeSchema", () => {
  const translations: Record<string, string> = {
    "editor.color_value": "Couleur de la valeur",
    "editor.mode": "Mode",
    "editor.custom": "Personnalise",
  };
  const localize = (key: string) => translations[key] ?? key.split(".").pop()?.replace(/_/g, " ") ?? key;

  it("localizes labels and titles using the schema name", () => {
    const schema = [{ name: "color_value", label: "Color of Value", title: "Color of Value" }];

    expect(localizeSchema(schema, localize)).toEqual([{ name: "color_value", label: "Couleur de la valeur", title: "Couleur de la valeur" }]);
  });

  it("localizes nested schemas and string select option values without mutating the source", () => {
    const schema = [
      {
        name: "mode",
        label: "Mode",
        schema: [
          {
            name: "mode",
            selector: {
              select: {
                options: [
                  { value: "custom", label: "Custom" },
                  { value: false, label: "Disabled" },
                ],
              },
            },
          },
        ],
      },
    ];

    const localized = localizeSchema(schema, localize);
    const localizedOptions = localized[0]!.schema[0]!.selector.select.options;
    const sourceOptions = schema[0]!.schema[0]!.selector.select.options;

    expect(localizedOptions[0]!.label).toBe("Personnalise");
    expect(localizedOptions[1]!.label).toBe("Disabled");
    expect(sourceOptions[0]!.label).toBe("Custom");
  });
});
