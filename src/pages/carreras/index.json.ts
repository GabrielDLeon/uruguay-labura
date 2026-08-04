import { getCollection } from "astro:content";
import type { APIContext } from "astro";

import { showDrafts } from "@/lib/educacion";
import type { EducationCareersPayload } from "@/types/careers";

export const prerender = true;

export async function GET({}: APIContext) {
  const [careers, institutions] = await Promise.all([
    getCollection("educacion", ({ data }) => (showDrafts || !data.draft) && data.listable),
    getCollection("institutions"),
  ]);

  const instMap = new Map(institutions.map((i) => [i.id, i.data]));

  const payload: EducationCareersPayload = {
    total: careers.length,
    careers: careers
      .map(({ id, data }) => {
        const instId = data.institution;
        const instData = instId ? instMap.get(instId) : undefined;
        return {
          id,
          title: data.title,
          area: data.area,
          degreeType: data.degreeType,
          modality: data.modality,
          duration: data.duration,
          cost: data.cost,
          institutionName: data.institutionName,
          institution:
            instId && instData
              ? {
                  id: instId,
                  name: instData.name,
                  short: instData.short,
                  logo: instData.logo?.src,
                }
              : null,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title, "es")),
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
