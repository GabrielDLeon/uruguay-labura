import { getCollection } from "astro:content";
import type { APIContext } from "astro";

import { showDrafts } from "@/lib/careers";
import type { CareersIndexPayload } from "@/types/careers";

export const prerender = true;

export async function getStaticPaths() {
  const [institutions, allCareers] = await Promise.all([
    getCollection("institutions"),
    getCollection("careers"),
  ]);

  const institutionsWithCareers = new Set(
    allCareers.map((career) => career.data.institution),
  );

  return institutions
    .filter((institution) => institutionsWithCareers.has(institution.id))
    .map((institution) => ({
      params: { institution: institution.id },
    }));
}

export async function GET({ params }: APIContext) {
  const institution = params.institution ?? "";

  const careers = await getCollection(
    "careers",
    ({ data }) =>
      data.institution === institution &&
      (showDrafts || !data.draft) &&
      data.listable,
  );

  const payload: CareersIndexPayload = {
    institution,
    total: careers.length,
    careers: careers
      .map(({ id, data }) => ({
        id,
        title: data.title,
        degreeType: data.degreeType,
        area: data.area,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "es")),
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
