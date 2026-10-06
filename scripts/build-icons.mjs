// Source-controlled vector mark; raster icons are generated offline for Chrome.
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const directory = new URL('../public/icons/', import.meta.url);
const svg = await readFile(new URL('workspace.svg', directory), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.BETTER_MYUCLA_CHROMIUM || undefined });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of [16, 32, 48, 128]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100%;height:100%}</style>${svg}`);
    await page.screenshot({ path: new URL(`icon-${size}.png`, directory).pathname.replace(/^\/(\w:)/, '$1'), omitBackground: true });
  }
} finally { await browser.close(); }
