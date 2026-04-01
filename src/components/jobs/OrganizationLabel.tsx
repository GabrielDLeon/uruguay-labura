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
    <span>
      <span
        className="underline decoration-dotted underline-offset-3"
        data-tooltip={fullName}
        data-side="top"
        data-align="center"
      >
        {abbreviation}
      </span>
      {subOrganization ? ` (${subOrganization})` : ""}
    </span>
  );
}
