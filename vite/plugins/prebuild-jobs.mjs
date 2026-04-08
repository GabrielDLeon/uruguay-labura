import { createRequire } from "module";
import { fetchAndProcessJobs } from "../../scripts/prebuild-jobs.mjs";

const require = createRequire(import.meta.url);
const { loadEnv } = require("vite");

export function prebuildJobsPlugin() {
  return {
    name: "prebuild-jobs",
    async buildStart() {
      const env = loadEnv("production", process.cwd(), "");
      const sourceUrl = env.SOURCE_URL;

      if (!sourceUrl) {
        throw new Error("SOURCE_URL not defined in .env");
      }

      await fetchAndProcessJobs(sourceUrl);
      console.log("[prebuild-jobs] Plugin completed successfully");
    },
  };
}
