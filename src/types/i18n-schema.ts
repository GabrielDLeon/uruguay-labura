import { z } from "astro/zod";

export const I18nSchema = z.object({
  "header.title": z.string(),
});
