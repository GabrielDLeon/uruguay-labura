import anepLogo from "@/assets/institutions/anep-logo.webp";
import asseLogo from "@/assets/institutions/asse-logo.webp";
import bhuLogo from "@/assets/institutions/bhu-logo.webp";
import bpsLogo from "@/assets/institutions/bps-logo.webp";
import canelonesLogo from "@/assets/institutions/canelones-logo.webp";
import ministerioLogo from "@/assets/institutions/ministerio-logo.webp";
import oseLogo from "@/assets/institutions/ose-logo.webp";
import ortLogo from "@/assets/institutions/ort-logo.webp";
import sanJoseLogo from "@/assets/institutions/san-jose-logo.webp";
import sorianoLogo from "@/assets/institutions/soriano-logo.webp";
import udelarLogo from "@/assets/institutions/udelar-logo.webp";
import ucuLogo from "@/assets/institutions/ucu-logo.webp";
import utecLogo from "@/assets/institutions/utec-logo.webp";

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
  "universidad catolica del uruguay": "UCU",
  "universidad ort uruguay": "ORT",
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
  ort: "ORT",
  ucu: "UCU",
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
  ort: "Universidad ORT Uruguay",
  ucu: "Universidad Catolica del Uruguay",
  udelar: "Universidad de la Republica",
  ursea: "Unidad Reguladora de Servicios de Energia y Agua",
  ute: "Administracion Nacional de Usinas y Trasmisiones Electricas",
  utec: "Universidad Tecnologica",
};

const organizationLogos: Record<string, string> = {
  "universidad de la republica": udelarLogo.src,
  udelar: udelarLogo.src,
  "universidad tecnologica": utecLogo.src,
  utec: utecLogo.src,
  "banco de prevision social": bpsLogo.src,
  bps: bpsLogo.src,
  "banco hipotecario del uruguay": bhuLogo.src,
  bhu: bhuLogo.src,
  "administracion de las obras sanitarias del estado": oseLogo.src,
  ose: oseLogo.src,
  "universidad ort uruguay": ortLogo.src,
  ort: ortLogo.src,
  "universidad catolica del uruguay": ucuLogo.src,
  ucu: ucuLogo.src,
  "intendencia de canelones": canelonesLogo.src,
  "intendencia de soriano": sorianoLogo.src,
  "intendencia de san jose": sanJoseLogo.src,
  "administracion nacional de educacion publica": anepLogo.src,
  anep: anepLogo.src,
  "administracion de servicios de salud del estado": asseLogo.src,
  asse: asseLogo.src,
  "ministerio de economia y finanzas": ministerioLogo.src,
  mef: ministerioLogo.src,
  "ministerio de vivienda y ordenamiento territorial": ministerioLogo.src,
  mvot: ministerioLogo.src,
  "ministerio de educacion y cultura": ministerioLogo.src,
  mec: ministerioLogo.src,
  "ministerio de transporte y obras publicas": ministerioLogo.src,
  mtop: ministerioLogo.src,
  "ministerio de defensa nacional": ministerioLogo.src,
  mdn: ministerioLogo.src,
  "ministerio de desarrollo social": ministerioLogo.src,
  mides: ministerioLogo.src,
  "ministerio del interior": ministerioLogo.src,
};

export function getOrganizationLogo(organization: string) {
  const normalized = normalizeText(organization);
  return organizationLogos[normalized] ?? null;
}

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
