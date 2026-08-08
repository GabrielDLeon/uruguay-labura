import { createHash } from "node:crypto";
import { glob } from "astro/loaders";
import type { Loader } from "astro/loaders";

/**
 * Injects `data.sections = [{ id, label, html }]` into each entry by splitting
 * the markdown body on `##` headings and pre-rendering every section.
 *
 * Wraps `glob()` for file discovery; presentation (tabs, icons) stays in the
 * consuming `.astro` component.
 *
 * Every entry gets a **composite digest** (sha256 over the file digest, body,
 * frontmatter, and rendered intro/sections). It is stable across builds and
 * differs from the glob file digest, so `scopedStore` still accepts the entry.
 * Consumers can use `entry.digest` as the incremental build `cacheKey`.
 */
export function sectionsLoader(options: Parameters<typeof glob>[0]): Loader {
  const base = glob(options);

  return {
    name: "sections-loader",
    load: async (context) => {
      await base.load(context);

      for (const entry of context.store.values()) {
        if (
          !entry.body ||
          typeof entry.data !== "object" ||
          entry.data === null
        )
          continue;
        const stored = entry.data as Record<string, unknown>;
        // Already split in a previous sync; avoid re-rendering unchanged entries.
        if (Array.isArray(stored.sections) && stored.sections.length > 0)
          continue;

        const { intro, sections } = splitSections(entry.body);
        const fileURL = entry.filePath
          ? new URL(entry.filePath.replace(/^\/?/, ""), context.config.root)
          : undefined;

        const introHtml = intro.trim()
          ? (await context.renderMarkdown(intro, { fileURL })).html
          : undefined;

        const renderedSections: SectionData[] = await Promise.all(
          sections.map(async (section) => {
            const rendered = await context.renderMarkdown(section.content, {
              fileURL,
            });
            return {
              id: slugify(section.label),
              label: section.label,
              html: rendered.html,
            };
          }),
        );

        const data = {
          ...stored,
          ...(introHtml ? { introHtml } : {}),
          sections: renderedSections,
        };

        context.store.set({
          id: entry.id,
          data,
          ...(entry.body ? { body: entry.body } : {}),
          ...(entry.filePath ? { filePath: entry.filePath } : {}),
          digest: compositeDigest({
            fileDigest: entry.digest,
            body: entry.body,
            frontmatter: stored,
            introHtml,
            sections: renderedSections,
          }),
        });
      }
    },
  };
}

export interface SectionData {
  id: string;
  label: string;
  html: string;
}

interface CompositeDigestInput {
  fileDigest?: string | number;
  body?: string;
  frontmatter: Record<string, unknown>;
  introHtml?: string;
  sections: SectionData[];
}

/** Stable, content-derived digest for incremental build `cacheKey`s. */
export function compositeDigest(input: CompositeDigestInput): string {
  const hasher = createHash("sha256");
  if (input.fileDigest) {
    hasher.update(String(input.fileDigest));
    hasher.update("\n");
  }
  if (input.body) {
    hasher.update(input.body);
    hasher.update("\n");
  }
  hasher.update(JSON.stringify(input.frontmatter));
  return `sections:${hasher.digest("hex")}`;
}

function splitSections(body: string): {
  intro: string;
  sections: { label: string; content: string }[];
} {
  const lines = body.split("\n");
  const sections: { label: string; content: string[] }[] = [];
  let current: { label: string; content: string[] } | null = null;
  const intro: string[] = [];

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line);
    if (match && current === null) {
      current = { label: match[1].trim(), content: [] };
    } else if (match) {
      sections.push(current!);
      current = { label: match[1].trim(), content: [] };
    } else if (current) {
      current.content.push(line);
    } else {
      intro.push(line);
    }
  }
  if (current) sections.push(current);

  return {
    intro: intro.join("\n"),
    sections: sections.map((s) => ({
      label: s.label,
      content: s.content.join("\n"),
    })),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
