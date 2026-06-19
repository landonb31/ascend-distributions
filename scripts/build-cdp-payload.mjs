import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const part = process.argv[2];
const viewId = process.argv[3] || "glass-browser-46290068-b022-4109-8985-c3079cf32a87";

if (!part) {
  console.error("Usage: node build-cdp-payload.mjs <part-file.b64> [viewId]");
  process.exit(1);
}

const b64 = readFileSync(join(__dirname, part), "utf8").trim();
const expression = `(() => { const editors = window.monaco?.editor?.getEditors?.(); if (!editors?.length) return {ok:false, reason:'no monaco'}; editors[0].setValue(atob(${JSON.stringify(b64)})); return {ok:true, len: editors[0].getValue().length}; })()`;

writeFileSync(
  join(__dirname, ".cdp-payload.json"),
  JSON.stringify({
    method: "Runtime.evaluate",
    params: { expression, returnByValue: true },
    viewId,
  })
);

console.log("payload ready", expression.length, "chars");
