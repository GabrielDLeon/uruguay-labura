import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { I18nSchema } from "./types/i18n-schema";

const PATH = "src/content";

const localesColecction = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: `${PATH}/i18n` }),
  schema: I18nSchema,
});

const pageCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: `${PATH}/pages` }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  pages: pageCollection,
  locales: localesColecction,
};
