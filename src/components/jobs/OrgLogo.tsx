import {
  getOrganizationAbbreviation,
  getOrganizationLogo,
} from "@/lib/organizations";

interface Props {
  organization: string | null;
}

function fallbackInitials(organization: string | null) {
  const abbreviation = getOrganizationAbbreviation(organization ?? "Sin dato");
  const words = abbreviation.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function OrgLogo({ organization }: Props) {
  const logo = getOrganizationLogo(organization ?? "");
  const label = organization ?? "Sin dato";

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
      {logo ? (
        <img
          src={logo}
          alt={label}
          title={label}
          loading="lazy"
          className="max-h-full max-w-full rounded-md object-contain"
        />
      ) : (
        <span
          title={label}
          aria-label={label}
          className="bg-muted text-muted-foreground inline-flex h-full w-full items-center justify-center text-[11px] font-semibold"
        >
          {fallbackInitials(organization)}
        </span>
      )}
    </span>
  );
}
