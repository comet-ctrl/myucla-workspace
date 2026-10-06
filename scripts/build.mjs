import { appendFile, cp, mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(resolve(projectRoot, "public"), outputDirectory, { recursive: true });
await cp(resolve(projectRoot, "LICENSE"), resolve(outputDirectory, "LICENSE"));
await cp(resolve(projectRoot, "CREDITS.md"), resolve(outputDirectory, "CREDITS.md"));
// Keep one injected stylesheet and the existing extension resource contract.
for (const stylesheet of ["v019-calendar.css", "dark.css", "workspace-settings.css"]) {
  await appendFile(resolve(outputDirectory, "injected.css"), "\n" + await readFile(resolve(projectRoot, "public", stylesheet), "utf8"));
}

const sharedOptions = {
  bundle: true,
  format: "iife",
  target: "chrome120",
  sourcemap: true,
  legalComments: "none",
  logLevel: "info"
};

await Promise.all([
  build({
    ...sharedOptions,
    entryPoints: [resolve(projectRoot, "src/content/index.ts")],
    outfile: resolve(outputDirectory, "content.js")
  }),
  build({
    ...sharedOptions,
    entryPoints: [resolve(projectRoot, "src/popup/index.ts")],
    outfile: resolve(outputDirectory, "popup.js")
  }),
  build({
    ...sharedOptions,
    entryPoints: [resolve(projectRoot, "src/demo/index.ts")],
    outfile: resolve(outputDirectory, "demo.js")
  }),
  build({
    ...sharedOptions,
    entryPoints: [resolve(projectRoot, "src/page-bridge/index.ts")],
    outfile: resolve(outputDirectory, "page-bridge.js")
  })
]);

console.log(`Built extension in ${outputDirectory}`);
