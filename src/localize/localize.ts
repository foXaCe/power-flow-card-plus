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

// Minimal structural type — accepts both the vendored project HomeAssistant
// (src/ha/types.ts) and the one shipped by custom-card-helpers without coupling
// localize.ts to either definition.
export interface LocalizeHass {
  locale?: { language?: string };
  language?: string;
}

let cachedLang: string | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "selectedLanguage") cachedLang = null;
  });
}

function normalize(lang: string): string {
  return lang.replace(/['"]+/g, "").replace("-", "_");
}

function getCurrentLang(hass?: LocalizeHass): string {
  // Priority 1: hass.locale.language (canonical HA source)
  if (hass?.locale?.language) {
    return normalize(hass.locale.language);
  }
  // Priority 2: hass.language (legacy HA fallback)
  if (hass?.language) {
    return normalize(hass.language);
  }
  // Priority 3: cached value (filled from localStorage previously)
  if (cachedLang) return cachedLang;
  // Priority 4: localStorage (historical fallback)
  if (typeof localStorage !== "undefined") {
    cachedLang = normalize(localStorage.getItem("selectedLanguage") || "en");
    return cachedLang;
  }
  return defaultLang;
}

function getTranslatedString(key: string, lang: string): string | undefined {
  const root = languages[lang];
  if (!root) return undefined;
  const result = key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), root);
  return typeof result === "string" ? result : undefined;
}

function translate(key: string, lang: string): string {
  let translated = getTranslatedString(key, lang);
  if (!translated) translated = getTranslatedString(key, defaultLang);
  return translated ?? key.split(".").pop()?.replace(/_/g, " ") ?? key;
}

// Overloads:
//   setupCustomlocalize(hass)            -> returns (key) => translated string using hass.locale.language
//   setupCustomlocalize()                -> returns (key) => translated string using localStorage fallback
//   setupCustomlocalize("editor.foo")    -> returns the translated string (legacy / no hass)
export function setupCustomlocalize(hass: LocalizeHass | undefined): (key: string) => string;
export function setupCustomlocalize(): (key: string) => string;
export function setupCustomlocalize(key: string): string;
export function setupCustomlocalize(hassOrKey?: LocalizeHass | string): string | ((key: string) => string) {
  if (typeof hassOrKey === "string") {
    return translate(hassOrKey, getCurrentLang(undefined));
  }
  const hass = hassOrKey;
  return (key: string) => translate(key, getCurrentLang(hass));
}

export default setupCustomlocalize;
