import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const educacionSchema = z.object({
  title: z.string().min(1),
  institution: z.string().min(1),
  degreeType: z.enum([
    "maestria",
    "especializacion",
    "doctorado",
    "diplomado",
    "posdoctorado",
    "otro",
  ]),
  area: z.string().min(1),
  modality: z.enum(["presencial", "virtual", "hibrido"]),
  duration: z.string().min(1),
  credits: z.number().int().nonnegative().optional(),
  requirements: z.array(z.string().min(1)),
  cost: z.string().min(1),
  language: z.string().min(1).default("Espanol"),
  website: z.string().url(),
  contactEmail: z.string().email().optional(),
  location: z.string().min(1).optional(),
  accreditation: z.string().min(1).optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
});

export type EducacionEntry = z.infer<typeof educacionSchema>;

const educacionCollection = defineCollection({
  loader: glob({ base: "./src/content/educacion", pattern: "**/*.md" }),
  schema: educacionSchema,
});

export const collections = {
  educacion: educacionCollection,
};
