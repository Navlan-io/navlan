#!/usr/bin/env node
/**
 * Generates public/sitemap.xml by listing static routes
 * plus every city slug from the Supabase localities table.
 *
 * Usage:  node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://xkgsgswxauguhyucauxg.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3Nnc3d4YXVndWh5dWNhdXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzkwNzUsImV4cCI6MjA4ODk1NTA3NX0.lvJfmngwj9b41w5pij_7sKrw7kGVxQWcjMw0d54dadw";
const BASE_URL = "https://navlan.io";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/cities", priority: "0.9", changefreq: "weekly" },
  { path: "/market", priority: "0.9", changefreq: "weekly" },
  { path: "/guides", priority: "0.8", changefreq: "monthly" },
  { path: "/guides/start-here", priority: "0.9", changefreq: "monthly" },
  { path: "/guides/dira-behanacha", priority: "0.9", changefreq: "monthly" },
  { path: "/guides/mortgages", priority: "0.9", changefreq: "monthly" },
  { path: "/resources", priority: "0.7", changefreq: "monthly" },
  { path: "/advisor", priority: "0.8", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/disclaimer", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

function toSlug(name) {
  return name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
}

async function fetchCitySlugs() {
  const url = `${SUPABASE_URL}/rest/v1/localities?select=english_name&entity_type=eq.city&order=english_name`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    console.error("Failed to fetch localities:", res.status, await res.text());
    process.exit(1);
  }
  const rows = await res.json();
  return rows.map((r) => toSlug(r.english_name));
}

function buildSitemap(citySlugs) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const route of STATIC_ROUTES) {
    entries.push(
      `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    );
  }

  for (const slug of citySlugs) {
    entries.push(
      `  <url>
    <loc>${BASE_URL}/city/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}

async function main() {
  console.log("Fetching city slugs from Supabase…");
  const slugs = await fetchCitySlugs();
  console.log(`Found ${slugs.length} cities`);

  const xml = buildSitemap(slugs);
  const outPath = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`Sitemap written to ${outPath}`);
}

main();
