#!/usr/bin/env node
/**
 * Pre-renders all routes to static HTML using Playwright.
 * Run after `vite build` to generate crawlable HTML for each page.
 *
 * Usage: node scripts/prerender.mjs
 */

import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../dist");

const SUPABASE_URL = "https://xkgsgswxauguhyucauxg.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3Nnc3d4YXVndWh5dWNhdXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzkwNzUsImV4cCI6MjA4ODk1NTA3NX0.lvJfmngwj9b41w5pij_7sKrw7kGVxQWcjMw0d54dadw";

const STATIC_ROUTES = [
  "/",
  "/market",
  "/guides",
  "/guides/start-here",
  "/guides/dira-behanacha",
  "/resources",
  "/advisor",
  "/about",
  "/disclaimer",
  "/privacy",
  "/terms",
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

/**
 * Simple static file server for the dist directory.
 * Serves index.html for any path that doesn't match a file (SPA fallback).
 */
function startServer(port) {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === "/" ? "index.html" : req.url);
      const ext = filePath.match(/\.[^.]+$/)?.[0] || "";

      // SPA fallback: if file doesn't exist or has no extension, serve index.html
      let contentType = mimeTypes[ext] || "application/octet-stream";
      if (!existsSync(filePath) || !ext) {
        filePath = join(DIST_DIR, "index.html");
        contentType = "text/html";
      }

      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch {
        // Fallback to index.html
        const content = readFileSync(join(DIST_DIR, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      }
    });

    server.listen(port, () => {
      resolvePromise(server);
    });
  });
}

async function prerender() {
  console.log("Fetching city slugs from Supabase…");
  const citySlugs = await fetchCitySlugs();
  console.log(`Found ${citySlugs.length} cities`);

  const allRoutes = [
    ...STATIC_ROUTES,
    ...citySlugs.map((slug) => `/city/${slug}`),
  ];

  console.log(`Pre-rendering ${allRoutes.length} routes…`);

  const PORT = 4173;
  const server = await startServer(PORT);
  const browser = await chromium.launch();
  const context = await browser.newContext();

  let rendered = 0;
  let failed = 0;

  // Process routes in batches to avoid overwhelming the browser
  const BATCH_SIZE = 5;
  for (let i = 0; i < allRoutes.length; i += BATCH_SIZE) {
    const batch = allRoutes.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (route) => {
        const page = await context.newPage();
        try {
          await page.goto(`http://localhost:${PORT}${route}`, {
            waitUntil: "networkidle",
            timeout: 30000,
          });

          // Wait for React to render content into #root
          await page.waitForFunction(
            () => {
              const root = document.getElementById("root");
              return root && root.children.length > 0;
            },
            { timeout: 15000 }
          );

          // Small extra wait for async data to load
          await page.waitForTimeout(1500);

          const html = await page.content();

          // Determine output path
          let outPath;
          if (route === "/") {
            outPath = join(DIST_DIR, "index.html");
          } else {
            outPath = join(DIST_DIR, route, "index.html");
          }

          // Create directory if needed
          const outDir = dirname(outPath);
          if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
          }

          writeFileSync(outPath, html, "utf-8");
          rendered++;
          process.stdout.write(
            `\r  Rendered ${rendered}/${allRoutes.length} routes`
          );
        } catch (err) {
          failed++;
          console.error(`\n  Failed to render ${route}: ${err.message}`);
        } finally {
          await page.close();
        }
      })
    );
  }

  console.log(
    `\nPre-rendering complete: ${rendered} succeeded, ${failed} failed`
  );

  await browser.close();
  server.close();

  if (failed > 0) {
    process.exit(1);
  }
}

prerender();
