import { createRequire } from "module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fetchAndProcessJobs } from "../../scripts/prebuild-jobs.mjs";

const require = createRequire(import.meta.url);
const { loadEnv } = require("vite");

export function prebuildJobsPlugin() {
  return {
    name: "prebuild-jobs",
    async buildStart() {
      const env = loadEnv("production", process.cwd(), "");
      const sourceUrl = env.SOURCE_URL;

      const outputPath = path.join(process.cwd(), "src/data/jobs.generated.json");
      const datasetExists = existsSync(outputPath);

      if (!sourceUrl) {
        if (datasetExists) {
          console.log("[prebuild-jobs] No SOURCE_URL, using existing dataset");
          return;
        }
        throw new Error("SOURCE_URL not defined in .env and no existing dataset found");
      }

      await fetchAndProcessJobs(sourceUrl);
      console.log("[prebuild-jobs] Plugin completed successfully");
    },
  };
}
