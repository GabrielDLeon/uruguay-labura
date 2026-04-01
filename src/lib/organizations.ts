const organizationAbbreviations: Record<string, string> = {
  "universidad de la republica": "Udelar",
  "ministerio de relaciones exteriores": "MRREE",
  "ministerio de trabajo y seguridad social": "MTSS",
  "administracion de servicios de salud del estado": "ASSE",
  "administracion nacional de educacion publica": "ANEP",
  "instituto uruguayo de meteorologia": "INUMET",
  "instituto nacional de evaluacion educativa": "INEEd",
  "administracion de las obras sanitarias del estado": "OSE",
  "administracion nacional de combustibles alcohol y portland": "ANCAP",
  "ministerio de industria energia y mineria": "MIEM",
  "ministerio de defensa nacional": "MDN",
  "administracion nacional de telecomunicaciones": "ANTEL",
  "pdu ccee": "PDU CCEE",
  "presidencia de la republica": "Presidencia",
  "universidad tecnologica": "UTEC",
  mrree: "MRREE",
  mtss: "MTSS",
  asse: "ASSE",
  anep: "ANEP",
  utec: "UTEC",
  inumet: "INUMET",
  ineed: "INEEd",
  ose: "OSE",
  ancap: "ANCAP",
  miem: "MIEM",
  mdn: "MDN",
  antel: "ANTEL",
};

const organizationFullNames: Record<string, string> = {
  utec: "Universidad Tecnologica",
  udelar: "Universidad de la Republica",
  inumet: "Instituto Uruguayo de Meteorologia",
  ineed: "Instituto Nacional de Evaluacion Educativa",
  anep: "Administracion Nacional de Educacion Publica",
  asse: "Administracion de Servicios de Salud del Estado",
  ose: "Administracion de las Obras Sanitarias del Estado",
  ancap: "Administracion Nacional de Combustibles, Alcohol y Portland",
  antel: "Administracion Nacional de Telecomunicaciones",
  miem: "Ministerio de Industria, Energia y Mineria",
  mdn: "Ministerio de Defensa Nacional",
  mtss: "Ministerio de Trabajo y Seguridad Social",
  mrree: "Ministerio de Relaciones Exteriores",
};

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getOrganizationAbbreviation(organization: string) {
  const normalized = normalizeText(organization);
  return organizationAbbreviations[normalized] ?? organization;
}

export function getOrganizationFullName(organization: string) {
  const normalized = normalizeText(organization);
  return organizationFullNames[normalized] ?? organization;
}

export function getOrganizationSearchText(organization: string) {
  const abbreviation = getOrganizationAbbreviation(organization);
  const fullName = getOrganizationFullName(organization);
  return `${abbreviation} ${fullName} ${organization}`;
}
