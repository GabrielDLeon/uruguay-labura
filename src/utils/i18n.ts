import { getCollection } from "astro:content";

const defaultLocale = "en";
const data = await getCollection("locales");

const locales = data.reduce(
  (acc, item) => {
    acc[item.id] = item.data;
    return acc;
  },
  {} as Record<string, any>,
);

export function useTranslations(lang: string | undefined = defaultLocale) {
  return function t(key: keyof (typeof locales)[typeof defaultLocale]) {
    return locales[lang][key] || locales[defaultLocale][key];
  };
}
