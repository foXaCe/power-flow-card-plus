import * as cs from "./languages/cs.json";
import * as en from "./languages/en.json";
import * as de from "./languages/de.json";
import * as dk from "./languages/dk.json";
import * as pt from "./languages/pt-PT.json";
import * as ptBR from "./languages/pt-BR.json";
import * as es from "./languages/es.json";
import * as nl from "./languages/nl.json";
import * as it from "./languages/it.json";
import * as fr from "./languages/fr.json";
import * as ru from "./languages/ru.json";
import * as fi from "./languages/fi.json";
import * as pl from "./languages/pl.json";
import * as sk from "./languages/sk.json";
import * as sv from "./languages/sv.json";
import * as ua from "./languages/ua.json";
import * as hi from "./languages/hi-IN.json";

const languages: Record<string, unknown> = {
  cs,
  en,
  de,
  dk,
  pt,
  pt_BR: ptBR,
  es,
  nl,
  it,
  fr,
  ru,
  fi,
  pl,
  sk,
  sv,
  ua,
  uk: ua,
  hi,
  hi_IN: hi,
};

const defaultLang = "en";

let cachedLang: string | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "selectedLanguage") cachedLang = null;
  });
}

function getCurrentLang(): string {
  if (cachedLang) return cachedLang;
  cachedLang = (localStorage.getItem("selectedLanguage") || "en").replace(/['"]+/g, "").replace("-", "_");
  return cachedLang;
}

function getTranslatedString(key: string, lang: string): string | undefined {
  const root = languages[lang];
  if (!root) return undefined;
  const result = key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), root);
  return typeof result === "string" ? result : undefined;
}

export function setupCustomlocalize(key: string) {
  const lang = getCurrentLang();

  let translated = getTranslatedString(key, lang);
  if (!translated) translated = getTranslatedString(key, defaultLang);
  return translated ?? key.split(".").pop()?.replace(/_/g, " ") ?? key;
}

export default setupCustomlocalize;
