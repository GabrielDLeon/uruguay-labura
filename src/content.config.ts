import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const institutionSchema = z.object({
  name: z.string().min(1),
  short: z.string().optional(),
  type: z.enum(["public", "private"]),
  website: z.string().url(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  departments: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  color: z.string().optional(),
});

export type InstitutionEntry = z.infer<typeof institutionSchema>;

const institutionsCollection = defineCollection({
  loader: glob({ base: "./src/content/institutions", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    institutionSchema.extend({
      logo: image().optional(),
    }),
});

export const educacionSchema = z.object({
  title: z.string().min(1),
  institution: z.string().optional(),
  institutionName: z.string().min(1),
  campus: z.string().optional(),
  degreeType: z.enum([
    "maestria",
    "especializacion",
    "ingenieria",
    "doctorado",
    "diplomado",
    "posdoctorado",
    "tecnologo",
    "licenciatura",
    "tecnicatura",
    "otro",
  ]),
  area: z.string().min(1),
  modality: z.enum(["presencial", "virtual", "hibrido"]),
  duration: z.string().min(1),
  credits: z.number().int().nonnegative().optional(),
  cost: z.string().min(1),
  language: z.string().min(1).default("Espanol"),
  website: z.string().url(),
  contactEmail: z.string().email().optional(),
  location: z.string().min(1).optional(),
  accreditation: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  startDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

export type EducacionEntry = z.infer<typeof educacionSchema>;

const educacionCollection = defineCollection({
  loader: glob({ base: "./src/content/educacion", pattern: "**/*.{md,mdx}" }),
  schema: educacionSchema,
});

export const collections = {
  educacion: educacionCollection,
  institutions: institutionsCollection,
};
