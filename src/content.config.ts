import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const campusSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  address: z.string().optional(),
});

export type Campus = z.infer<typeof campusSchema>;

const institutionSchema = z.object({
  name: z.string().min(1),
  short: z.string().optional(),
  type: z.enum(["public", "private"]),
  website: z.url(),
  contactEmail: z.email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  departments: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  color: z.string().optional(),
  campuses: z.array(campusSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type InstitutionEntry = z.infer<typeof institutionSchema>;

const institutionsCollection = defineCollection({
  loader: glob({
    base: "./src/content/institutions",
    pattern: "**/*.md",
  }),
  schema: ({ image }) =>
    institutionSchema.extend({
      logo: image().optional(),
    }),
});

export const careerSchema = z.object({
  title: z.string().min(1),
  short: z.string().optional(),
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
    "carrera",
    "ciclo",
    "otro",
  ]),
  area: z.string().min(1),
  modality: z.enum(["presencial", "virtual", "hibrido"]),
  shift: z.enum(["day", "night", "both"]),
  weeklyHours: z.string().min(1),
  duration: z.string().min(1).optional(),
  credits: z.number().int().nonnegative().optional(),
  cost: z.string().min(1),
  language: z.string().min(1).default("Espanol"),
  website: z.url(),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.url(),
      }),
    )
    .default([]),
  contactEmail: z.union([z.email(), z.array(z.email())]).optional(),
  location: z.string().min(1).optional(),
  accreditation: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  startDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  similar: z.array(z.string()).default([]),
  listable: z.boolean().default(true),
  searchable: z.boolean().default(true),
  draft: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CareerEntry = z.infer<typeof careerSchema>;

const careersCollection = defineCollection({
  loader: glob({ base: "./src/content/careers", pattern: "**/*.md" }),
  schema: careerSchema,
});

const scholarshipSchema = z.object({
  title: z.string().min(1),
  short: z.string().optional(),
  type: z.string().min(1),
  institution: z.string().min(1),
  description: z.string().min(1).optional(),
  website: z.url(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ScholarshipEntry = z.infer<typeof scholarshipSchema>;

const scholarshipsCollection = defineCollection({
  loader: glob({
    base: "./src/content/scholarships",
    pattern: "**/*.md",
  }),
  schema: scholarshipSchema,
});

export const collections = {
  careers: careersCollection,
  institutions: institutionsCollection,
  scholarships: scholarshipsCollection,
};
