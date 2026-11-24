// Reads collected image-search JSON files and emits a typed manifest.
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dir = "/home/z/imgsearch";
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "collect.log");

type Result = { original_url: string; source?: string };
type Resp = { success: boolean; results?: Result[] };

const data: Record<string, string[]> = {};
for (const f of files) {
  const name = f.replace(/\.json$/, "");
  try {
    const parsed = JSON.parse(readFileSync(join(dir, f), "utf8")) as Resp;
    if (parsed.success && Array.isArray(parsed.results)) {
      data[name] = parsed.results
        .map((r) => r.original_url)
        .filter((u): u is string => Boolean(u));
    }
  } catch {
    data[name] = [];
  }
}

const out: string[] = [];
out.push("// Auto-generated image manifest from z-ai image-search results.");
out.push("// Do not edit by hand — re-run `bun run scripts/build-image-manifest.ts`.");
out.push("");
out.push("export const IMG: Record<string, string[]> = {");
for (const [k, v] of Object.entries(data)) {
  out.push(`  ${JSON.stringify(k)}: [`);
  for (const url of v) out.push(`    ${JSON.stringify(url)},`);
  out.push(`  ],`);
}
out.push("};");
out.push("");
out.push("// Curated hero & section images");
out.push("export const HERO_IMAGE = IMG.cafe_interior?.[0] ?? \"\";");
out.push("export const HERO_IMAGE_ALT = IMG.cafe_interior?.[1] ?? \"\";");
out.push("export const STORY_IMAGE = IMG.barista?.[0] ?? \"\";");
out.push("export const STORY_IMAGE_ALT = IMG.beans?.[0] ?? \"\";");
out.push("export const RESERVATION_IMAGE = IMG.cafe_interior?.[2] ?? IMG.cafe_interior?.[0] ?? \"\";");
out.push("export const GALLERY_IMAGES: string[] = [");
out.push("  ...(IMG.cafe_interior ?? []),");
out.push("  ...(IMG.barista ?? []),");
out.push("  ...(IMG.beans ?? []),");
out.push("  ...(IMG.flatlay ?? []),");
out.push("  ...(IMG.beansbag ?? []),");
out.push("  ...(IMG.chocplate ?? []),");
out.push("].filter(Boolean);");
out.push("");

writeFileSync("/home/z/my-project/src/data/images.ts", out.join("\n"));
console.log("Manifest written with", Object.keys(data).length, "categories");
