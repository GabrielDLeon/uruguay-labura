import {
  getOrganizationAbbreviation,
  getOrganizationFullName,
} from "@/lib/organizations";

interface Props {
  organization: string | null;
  subOrganization?: string | null;
}

export default function OrganizationLabel({
  organization,
  subOrganization,
}: Props) {
  if (!organization) {
    return <span>Sin dato</span>;
  }

  const abbreviation = getOrganizationAbbreviation(organization);
  const fullName = getOrganizationFullName(organization);

  return (
    <span className="inline-flex max-w-full items-baseline">
      <span
        className="shrink-0 underline decoration-dotted underline-offset-3"
        data-tooltip={fullName}
        data-side="top"
        data-align="center"
      >
        {abbreviation}
      </span>
      {subOrganization ? (
        <span className="ml-1 min-w-0 truncate" title={subOrganization}>
          {` (${subOrganization})`}
        </span>
      ) : null}
    </span>
  );
}
