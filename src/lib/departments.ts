export const departmentToId: Record<string, string> = {
  Montevideo: "UY-MO",
  Maldonado: "UY-MA",
  Salto: "UY-SA",
  Durazno: "UY-DU",
  Rivera: "UY-RV",
  "Río Negro": "UY-RN",
  "Rio Negro": "UY-RN",
  Lavalleja: "UY-LA",
  "San José": "UY-SJ",
  Paysandú: "UY-PA",
  "Cerro Largo": "UY-CL",
  Florida: "UY-FD",
  Colonia: "UY-CO",
  Artigas: "UY-AR",
  Canelones: "UY-CA",
  Flores: "UY-FS",
  Rocha: "UY-RO",
  Soriano: "UY-SO",
  Tacuarembó: "UY-TA",
  "Treinta y Tres": "UY-TT",
}

export function locationsToIds(locations: string[]): string[] {
  const ids: string[] = []
  for (const loc of locations) {
    const id = departmentToId[loc]
    if (id) ids.push(id)
  }
  return [...new Set(ids)]
}
