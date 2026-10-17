export interface JobDetailSection {
  heading: string | null;
  body: string;
}

/** Splits the backend detail markdown into `## heading` + body sections. */
export function parseJobDetailSections(markdown: string): JobDetailSection[] {
  const sections: JobDetailSection[] = [];
  let current: JobDetailSection = { heading: null, body: "" };

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      if (current.heading || current.body.trim()) {
        sections.push(current);
      }
      current = { heading: line.slice(3).trim(), body: "" };
      continue;
    }

    current.body += `${current.body ? "\n" : ""}${line}`;
  }

  if (current.heading || current.body.trim()) {
    sections.push(current);
  }

  return sections
    .map((section) => ({ ...section, body: section.body.trim() }))
    .filter((section) => section.heading || section.body);
}
