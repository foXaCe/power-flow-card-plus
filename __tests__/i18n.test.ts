// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from "@jest/globals";

import en from "../src/localize/languages/en.json";

import cs from "../src/localize/languages/cs.json";
import de from "../src/localize/languages/de.json";
import dk from "../src/localize/languages/dk.json";
import es from "../src/localize/languages/es.json";
import fi from "../src/localize/languages/fi.json";
import fr from "../src/localize/languages/fr.json";
import it from "../src/localize/languages/it.json";
import nl from "../src/localize/languages/nl.json";
import pl from "../src/localize/languages/pl.json";
import ptBR from "../src/localize/languages/pt-BR.json";
import pt from "../src/localize/languages/pt-PT.json";
import ru from "../src/localize/languages/ru.json";
import sk from "../src/localize/languages/sk.json";
import sv from "../src/localize/languages/sv.json";
import ua from "../src/localize/languages/ua.json";
import hi from "../src/localize/languages/hi-IN.json";

function getAllKeys(obj: { [key: string]: any }): string[] {
  let keys: string[] = [];

  Object.keys(obj).forEach((key) => {
    keys.push(key);
    if (typeof obj[key] === "object") {
      const nestedKeys = getAllKeys(obj[key]);
      keys = keys.concat(nestedKeys.map((nestedKey) => `${key}.${nestedKey}`));
    }
  });

  return keys;
}

describe("Language files", () => {
  const enKeys = getAllKeys(en).sort();

  const languages: Record<string, { [key: string]: any }> = {
    cs,
    de,
    dk,
    es,
    fi,
    fr,
    it,
    nl,
    pl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    ru,
    sk,
    sv,
    ua,
    "hi-IN": hi,
  };

  test.each(Object.entries(languages))("%s.json should have the same properties as en.json", (_lang, data) => {
    expect(getAllKeys(data).sort()).toEqual(enKeys);
  });
});
