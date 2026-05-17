type LocalizeFn = (key: string) => string;

const fallbackForName = (name: string): string => name.split(".").pop()?.replace(/_/g, " ") ?? name;

const translatedEditorLabel = (localize: LocalizeFn, name: unknown): string | undefined => {
  if (typeof name !== "string" || name === "") return undefined;
  const fallback = fallbackForName(name);
  const translated = localize(`editor.${name}`);
  return translated.toLowerCase() === fallback.toLowerCase() ? undefined : translated;
};

const translatedOptionLabel = (localize: LocalizeFn, value: unknown): string | undefined =>
  typeof value === "string" ? translatedEditorLabel(localize, value) : undefined;

export const localizeSchema = <T>(schema: T, localize: LocalizeFn): T => {
  if (Array.isArray(schema)) {
    return schema.map((entry) => localizeSchema(entry, localize)) as T;
  }

  if (!schema || typeof schema !== "object") {
    return schema;
  }

  const source = schema as Record<string, unknown>;
  const next: Record<string, unknown> = { ...source };
  const localizedName = translatedEditorLabel(localize, next.name);

  if (localizedName) {
    if (typeof next.label === "string") next.label = localizedName;
    if (typeof next.title === "string") next.title = localizedName;
  }

  if (next.schema) {
    next.schema = localizeSchema(next.schema, localize);
  }

  const selector = next.selector as { select?: { options?: unknown[] } } | undefined;
  if (selector?.select?.options) {
    next.selector = {
      ...selector,
      select: {
        ...selector.select,
        options: selector.select.options.map((option) => {
          if (!option || typeof option !== "object") return option;
          const optionSource = option as Record<string, unknown>;
          const localizedOption = translatedOptionLabel(localize, optionSource.value);
          return localizedOption ? { ...optionSource, label: localizedOption } : option;
        }),
      },
    };
  }

  return next as T;
};
