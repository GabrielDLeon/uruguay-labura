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
  "banco de seguros del estado": "BSE",
  "corporacion nacional para el desarrollo": "CND",
  "instituto nacional de colonizacion": "INC",
  "instituto nacional de evaluacion educativa": "INEEd",
  "instituto uruguayo de meteorologia inumet": "INUMET",
  "instituto uruguayo de meteorologia": "INUMET",
  "intendencia de artigas": "Artigas",
  "intendencia de canelones": "Canelones",
  "intendencia de cerro largo": "Cerro Largo",
  "intendencia de colonia": "Colonia",
  "intendencia de durazno": "Durazno",
  "intendencia de flores": "Flores",
  "intendencia de florida": "Florida",
  "intendencia de lavalleja": "Lavalleja",
  "intendencia de maldonado": "Maldonado",
  "intendencia de montevideo": "Montevideo",
  "intendencia de paysandu": "Paysandú",
  "intendencia de rio negro": "Río Negro",
  "intendencia de rivera": "Rivera",
  "intendencia de rocha": "Rocha",
  "intendencia de salto": "Salto",
  "intendencia de san jose": "San José",
  "intendencia de soriano": "Soriano",
  "intendencia de tacuarembo": "Tacuarembó",
  "intendencia de treinta y tres": "Treinta y Tres",
  "ministerio de ambiente": "MA",
  "ministerio de defensa nacional": "MDN",
  "ministerio de desarrollo social": "MIDES",
  "ministerio de economia y finanzas": "MEF",
  "ministerio de educacion y cultura": "MEC",
  "ministerio de ganaderia agricultura y pesca": "MGAP",
  "ministerio de industria energia y mineria": "MIEM",
  "ministerio de relaciones exteriores": "MRREE",
  "ministerio de salud publica": "MSP",
  "ministerio de trabajo y seguridad social": "MTSS",
  "ministerio de transporte y obras publicas": "MTOP",
  "ministerio de turismo": "MINTUR",
  "ministerio de vivienda y ordenamiento territorial": "MVOT",
  "ministerio del interior": "MI",
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
  bse: "BSE",
  cnd: "CND",
  inc: "INC",
  ineed: "INEEd",
  inumet: "INUMET",
  ma: "MA",
  mdn: "MDN",
  mec: "MEC",
  mef: "MEF",
  mgap: "MGAP",
  mi: "MI",
  mides: "MIDES",
  miem: "MIEM",
  mintur: "MINTUR",
  mrree: "MRREE",
  msp: "MSP",
  mtop: "MTOP",
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
  bse: "Banco de Seguros del Estado",
  cnd: "Corporacion Nacional para el Desarrollo",
  inc: "Instituto Nacional de Colonizacion",
  ineed: "Instituto Nacional de Evaluacion Educativa",
  inumet: "Instituto Uruguayo de Meteorologia",
  "instituto uruguayo de meteorologia inumet":
    "Instituto Uruguayo de Meteorologia - INUMET",
  ma: "Ministerio de Ambiente",
  mdn: "Ministerio de Defensa Nacional",
  mec: "Ministerio de Educacion y Cultura",
  mef: "Ministerio de Economia y Finanzas",
  mgap: "Ministerio de Ganaderia, Agricultura y Pesca",
  mi: "Ministerio del Interior",
  mides: "Ministerio de Desarrollo Social",
  miem: "Ministerio de Industria, Energia y Mineria",
  mintur: "Ministerio de Turismo",
  mrree: "Ministerio de Relaciones Exteriores",
  msp: "Ministerio de Salud Publica",
  mtop: "Ministerio de Transporte y Obras Publicas",
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
  "banco de seguros del estado": bseLogo.src,
  bse: bseLogo.src,
  "banco hipotecario del uruguay": bhuLogo.src,
  bhu: bhuLogo.src,
  "administracion de las obras sanitarias del estado": oseLogo.src,
  ose: oseLogo.src,
  "universidad ort uruguay": ortLogo.src,
  ort: ortLogo.src,
  "universidad catolica del uruguay": ucuLogo.src,
  ucu: ucuLogo.src,
  "intendencia de canelones": canelonesLogo.src,
  canelones: canelonesLogo.src,
  "intendencia de florida": floridaLogo.src,
  florida: floridaLogo.src,
  "intendencia de rio negro": rioNegroLogo.src,
  "rio negro": rioNegroLogo.src,
  "intendencia de rivera": riveraLogo.src,
  rivera: riveraLogo.src,
  "intendencia de rocha": rochaLogo.src,
  rocha: rochaLogo.src,
  "intendencia de soriano": sorianoLogo.src,
  soriano: sorianoLogo.src,
  "intendencia de san jose": sanJoseLogo.src,
  "san jose": sanJoseLogo.src,
  "intendencia de tacuarembo": tacuaremboLogo.src,
  tacuarembo: tacuaremboLogo.src,
  "instituto nacional de colonizacion": incLogo.src,
  inc: incLogo.src,
  "administracion nacional de educacion publica": anepLogo.src,
  anep: anepLogo.src,
  "administracion de servicios de salud del estado": asseLogo.src,
  asse: asseLogo.src,
  "agencia nacional de vivienda": anvLogo.src,
  anv: anvLogo.src,
  "instituto uruguayo de meteorologia": inumetLogo.src,
  "instituto uruguayo de meteorologia inumet": inumetLogo.src,
  inumet: inumetLogo.src,
  "ministerio de ambiente": ministerioLogo.src,
  ma: ministerioLogo.src,
  "ministerio de defensa nacional": ministerioLogo.src,
  mdn: ministerioLogo.src,
  "ministerio de desarrollo social": ministerioLogo.src,
  mides: ministerioLogo.src,
  "ministerio de economia y finanzas": ministerioLogo.src,
  mef: ministerioLogo.src,
  "ministerio de educacion y cultura": ministerioLogo.src,
  mec: ministerioLogo.src,
  "ministerio de ganaderia agricultura y pesca": ministerioLogo.src,
  mgap: ministerioLogo.src,
  "ministerio de industria energia y mineria": ministerioLogo.src,
  miem: ministerioLogo.src,
  "ministerio de relaciones exteriores": ministerioLogo.src,
  mrree: ministerioLogo.src,
  "ministerio de salud publica": ministerioLogo.src,
  msp: ministerioLogo.src,
  "ministerio de trabajo y seguridad social": ministerioLogo.src,
  mtss: ministerioLogo.src,
  "ministerio de transporte y obras publicas": ministerioLogo.src,
  mtop: ministerioLogo.src,
  "ministerio de turismo": ministerioLogo.src,
  mintur: ministerioLogo.src,
  "ministerio de vivienda y ordenamiento territorial": ministerioLogo.src,
  mvot: ministerioLogo.src,
  "ministerio del interior": ministerioLogo.src,
  mi: ministerioLogo.src,
  "presidencia de la republica": ministerioLogo.src,
};

export function getOrganizationLogo(organization: string) {
  const normalized = normalizeText(organization);
  return organizationLogos[normalized] ?? null;
}

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
