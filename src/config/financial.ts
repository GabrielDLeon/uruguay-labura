/**
 * BPC (Base de Prestaciones y Contribuciones), valor vigente por decreto anual.
 * Es la unidad estable para montos de becas: el contenido escribe "N BPC" y
 * nunca hardcodea pesos. Al cambiar el decreto, actualizar `value` y `year`
 * aquí (y revisar src/content/ con el script de verificación anual).
 */
export const BPC = {
  value: 6864,
  year: 2026,
  source: "https://www.impo.com.uy/bases/decretos/11-2026",
} as const;

export const solidarityFundRates = {
  short: {
    gradual: { range: "5 a 9 años", amount: 3432 },
    full: { range: "+10 años", amount: 6864 },
  },
  long: {
    gradual: { range: "5 a 9 años", amount: 6864 },
    full: { range: "+10 años", amount: 13728 },
  },
  additional: { range: "+5 años", amount: 5720 },
};

export const SOLIDARITY_INSTITUTIONS = ["udelar", "utec", "utu"];
