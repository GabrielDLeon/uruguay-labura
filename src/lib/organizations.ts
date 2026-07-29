const organizationAbbreviations: Record<string, string> = {
  "administracion de las obras sanitarias del estado": "OSE",
  "administracion de los ferrocarriles del estado": "AFE",
  "administracion de servicios de salud del estado": "ASSE",
  "administracion nacional de combustibles alcohol y portland": "ANCAP",
  "administracion nacional de educacion publica": "ANEP",
  "administracion nacional de telecomunicaciones": "ANTEL",
  "administracion nacional de usinas y trasmisiones electricas": "UTE",
  "agencia nacional de vivienda": "ANV",
  "banco de la republica oriental del uruguay": "BROU",
  "corporacion nacional para el desarrollo": "CND",
  "instituto nacional de colonizacion": "INC",
  "instituto nacional de evaluacion educativa": "INEEd",
  "instituto uruguayo de meteorologia": "INUMET",
  "ministerio de defensa nacional": "MDN",
  "ministerio de economia y finanzas": "MEF",
  "ministerio de industria energia y mineria": "MIEM",
  "ministerio de relaciones exteriores": "MRREE",
  "ministerio de trabajo y seguridad social": "MTSS",
  "ministerio de vivienda y ordenamiento territorial": "MVOT",
  "pdu ccee": "PDU CCEE",
  "presidencia de la republica": "Presidencia",
  "unidad reguladora de servicios de energia y agua": "URSEA",
  "universidad de la republica": "Udelar",
  "universidad tecnologica": "UTEC",
  afe: "AFE",
  ancap: "ANCAP",
  anep: "ANEP",
  antel: "ANTEL",
  anv: "ANV",
  asse: "ASSE",
  brou: "BROU",
  cnd: "CND",
  inc: "INC",
  ineed: "INEEd",
  inumet: "INUMET",
  mdn: "MDN",
  mef: "MEF",
  miem: "MIEM",
  mrree: "MRREE",
  mtss: "MTSS",
  mvot: "MVOT",
  ose: "OSE",
  ursea: "URSEA",
  ute: "UTE",
  utec: "UTEC",
};

const organizationFullNames: Record<string, string> = {
  afe: "Administracion de los Ferrocarriles del Estado",
  ancap: "Administracion Nacional de Combustibles, Alcohol y Portland",
  anep: "Administracion Nacional de Educacion Publica",
  antel: "Administracion Nacional de Telecomunicaciones",
  anv: "Agencia Nacional de Vivienda",
  asse: "Administracion de Servicios de Salud del Estado",
  brou: "Banco de la Republica Oriental del Uruguay",
  cnd: "Corporacion Nacional para el Desarrollo",
  inc: "Instituto Nacional de Colonizacion",
  ineed: "Instituto Nacional de Evaluacion Educativa",
  inumet: "Instituto Uruguayo de Meteorologia",
  mdn: "Ministerio de Defensa Nacional",
  mef: "Ministerio de Economia y Finanzas",
  miem: "Ministerio de Industria, Energia y Mineria",
  mrree: "Ministerio de Relaciones Exteriores",
  mtss: "Ministerio de Trabajo y Seguridad Social",
  mvot: "Ministerio de Vivienda y Ordenamiento Territorial",
  ose: "Administracion de las Obras Sanitarias del Estado",
  udelar: "Universidad de la Republica",
  ursea: "Unidad Reguladora de Servicios de Energia y Agua",
  ute: "Administracion Nacional de Usinas y Trasmisiones Electricas",
  utec: "Universidad Tecnologica",
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
