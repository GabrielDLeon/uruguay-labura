import anepLogo from "@/assets/institutions/anep-logo.webp";
import anvLogo from "@/assets/institutions/anv-logo.webp";
import asseLogo from "@/assets/institutions/asse-logo.webp";
import bhuLogo from "@/assets/institutions/bhu-logo.webp";
import bpsLogo from "@/assets/institutions/bps-logo.webp";
import bseLogo from "@/assets/institutions/bse-logo.webp";
import canelonesLogo from "@/assets/institutions/canelones-logo.webp";
import floridaLogo from "@/assets/institutions/florida-logo.webp";
import incLogo from "@/assets/institutions/inc-logo.webp";
import inumetLogo from "@/assets/institutions/inumet-logo.webp";
import ministerioLogo from "@/assets/institutions/ministerio-logo.webp";
import oseLogo from "@/assets/institutions/ose-logo.webp";
import ortLogo from "@/assets/institutions/ort-logo.webp";
import rioNegroLogo from "@/assets/institutions/rio-negro-logo.webp";
import riveraLogo from "@/assets/institutions/rivera-logo.webp";
import rochaLogo from "@/assets/institutions/rocha-logo.webp";
import sanJoseLogo from "@/assets/institutions/san-jose-logo.webp";
import sorianoLogo from "@/assets/institutions/soriano-logo.webp";
import tacuaremboLogo from "@/assets/institutions/tacuarembo-logo.webp";
import udelarLogo from "@/assets/institutions/udelar-logo.webp";
import ucuLogo from "@/assets/institutions/ucu-logo.webp";
import utecLogo from "@/assets/institutions/utec-logo.webp";

interface Organization {
  name: string;
  short?: string;
  aliases?: string[];
  logo?: string;
}

const ORGANIZATIONS: Organization[] = [
  {
    name: "Administración de las Obras Sanitarias del Estado",
    short: "OSE",
    logo: oseLogo.src,
  },
  { name: "Administración de los Ferrocarriles del Estado", short: "AFE" },
  {
    name: "Administración de Servicios de Salud del Estado",
    short: "ASSE",
    logo: asseLogo.src,
  },
  {
    name: "Administración Nacional de Combustibles, Alcohol y Portland",
    short: "ANCAP",
  },
  {
    name: "Administración Nacional de Educación Pública",
    short: "ANEP",
    logo: anepLogo.src,
  },
  { name: "Administración Nacional de Telecomunicaciones", short: "ANTEL" },
  {
    name: "Administración Nacional de Usinas y Trasmisiones Eléctricas",
    short: "UTE",
  },
  { name: "Agencia Nacional de Vivienda", short: "ANV", logo: anvLogo.src },
  { name: "Banco de la República Oriental del Uruguay", short: "BROU" },
  { name: "Banco de Previsión Social", short: "BPS", logo: bpsLogo.src },
  { name: "Banco de Seguros del Estado", short: "BSE", logo: bseLogo.src },
  { name: "Banco Hipotecario del Uruguay", short: "BHU", logo: bhuLogo.src },
  { name: "Corporación Nacional para el Desarrollo", short: "CND" },
  {
    name: "Instituto Nacional de Colonización",
    short: "INC",
    logo: incLogo.src,
  },
  { name: "Instituto Nacional de Evaluación Educativa", short: "INEEd" },
  {
    name: "Instituto Uruguayo de Meteorología",
    short: "INUMET",
    aliases: ["Instituto Uruguayo de Meteorología - INUMET"],
    logo: inumetLogo.src,
  },
  { name: "Intendencia de Artigas", short: "Artigas" },
  {
    name: "Intendencia de Canelones",
    short: "Canelones",
    logo: canelonesLogo.src,
  },
  { name: "Intendencia de Cerro Largo", short: "Cerro Largo" },
  { name: "Intendencia de Colonia", short: "Colonia" },
  { name: "Intendencia de Durazno", short: "Durazno" },
  { name: "Intendencia de Flores", short: "Flores" },
  { name: "Intendencia de Florida", short: "Florida", logo: floridaLogo.src },
  { name: "Intendencia de Lavalleja", short: "Lavalleja" },
  { name: "Intendencia de Maldonado", short: "Maldonado" },
  { name: "Intendencia de Montevideo", short: "Montevideo" },
  { name: "Intendencia de Paysandú", short: "Paysandú" },
  {
    name: "Intendencia de Río Negro",
    short: "Río Negro",
    logo: rioNegroLogo.src,
  },
  { name: "Intendencia de Rivera", short: "Rivera", logo: riveraLogo.src },
  { name: "Intendencia de Rocha", short: "Rocha", logo: rochaLogo.src },
  { name: "Intendencia de Salto", short: "Salto" },
  {
    name: "Intendencia de San José",
    short: "San José",
    logo: sanJoseLogo.src,
  },
  { name: "Intendencia de Soriano", short: "Soriano", logo: sorianoLogo.src },
  {
    name: "Intendencia de Tacuarembó",
    short: "Tacuarembó",
    logo: tacuaremboLogo.src,
  },
  { name: "Intendencia de Treinta y Tres", short: "Treinta y Tres" },
  { name: "Ministerio de Ambiente", short: "MA", logo: ministerioLogo.src },
  {
    name: "Ministerio de Defensa Nacional",
    short: "MDN",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Desarrollo Social",
    short: "MIDES",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Economía y Finanzas",
    short: "MEF",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Educación y Cultura",
    short: "MEC",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Ganadería, Agricultura y Pesca",
    short: "MGAP",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Industria, Energía y Minería",
    short: "MIEM",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Relaciones Exteriores",
    short: "MRREE",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Salud Pública",
    short: "MSP",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Trabajo y Seguridad Social",
    short: "MTSS",
    logo: ministerioLogo.src,
  },
  {
    name: "Ministerio de Transporte y Obras Públicas",
    short: "MTOP",
    logo: ministerioLogo.src,
  },
  { name: "Ministerio de Turismo", short: "MINTUR", logo: ministerioLogo.src },
  {
    name: "Ministerio de Vivienda y Ordenamiento Territorial",
    short: "MVOT",
    logo: ministerioLogo.src,
  },
  { name: "Ministerio del Interior", short: "MI", logo: ministerioLogo.src },
  { name: "PDU CCEE" },
  {
    name: "Presidencia de la República",
    short: "Presidencia",
    logo: ministerioLogo.src,
  },
  {
    name: "Unidad Reguladora de Servicios de Energía y Agua",
    short: "URSEA",
  },
  { name: "Universidad Católica del Uruguay", short: "UCU", logo: ucuLogo.src },
  {
    name: "Universidad de la República",
    short: "Udelar",
    logo: udelarLogo.src,
  },
  { name: "Universidad ORT Uruguay", short: "ORT", logo: ortLogo.src },
  { name: "Universidad Tecnológica", short: "UTEC", logo: utecLogo.src },
];

/**
 * Normaliza un texto para comparar organismos sin depender de mayúsculas,
 * tildes, signos ni caracteres invisibles (la fuente los incluye).
 */
export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\p{Cf}/gu, "")
    .normalize("NFD")
    .replace(/\p{Default_Ignorable_Code_Point}/gu, "")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const organizationsByKey = new Map<string, Organization>();

for (const organization of ORGANIZATIONS) {
  const keys = new Set([
    organization.name,
    organization.short,
    ...(organization.aliases ?? []),
  ]);

  for (const key of keys) {
    if (key) {
      organizationsByKey.set(normalizeText(key), organization);
    }
  }
}

function findOrganization(organization: string) {
  return organizationsByKey.get(normalizeText(organization));
}

export function getOrganizationAbbreviation(organization: string) {
  const match = findOrganization(organization);
  return match?.short ?? match?.name ?? organization;
}

export function getOrganizationFullName(organization: string) {
  return findOrganization(organization)?.name ?? organization;
}

export function getOrganizationLogo(organization: string) {
  return findOrganization(organization)?.logo;
}

export function getOrganizationSearchText(organization: string) {
  const abbreviation = getOrganizationAbbreviation(organization);
  const fullName = getOrganizationFullName(organization);
  return `${abbreviation} ${fullName} ${organization}`;
}
