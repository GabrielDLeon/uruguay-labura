import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { createHash } from "node:crypto";

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
    .map((institution) => {
      const careers = allCareers.filter(
        (career) =>
          career.data.institution === institution.id &&
          (showDrafts || !career.data.draft) &&
          career.data.listable,
      );
      // The JSON payload depends on both the institution entry and the careers
      // it lists, so the cacheKey folds both digests together.
      const hasher = createHash("sha256");
      hasher.update(String(institution.digest ?? institution.data.updatedAt ?? institution.id));
      for (const career of careers.sort((a, b) => a.id.localeCompare(b.id))) {
        hasher.update("\n");
        hasher.update(String(career.digest ?? career.data.updatedAt ?? career.id));
      }

      return {
        params: { institution: institution.id },
        cacheKey: `institution:${hasher.digest("hex")}`,
      };
    });
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
        sources: data.sources,
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
