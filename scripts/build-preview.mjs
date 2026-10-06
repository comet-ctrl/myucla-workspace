/** Build a self-contained visual playground from production presentation code. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { introductionFixtureHtml } from '../harness/workspace-fixture.mjs';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(resolve(root, 'dist/manifest.json'), 'utf8'));
const packageInfo = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
assert.equal(manifest.version, packageInfo.version, 'Build the current extension before generating its preview.');
const css = await readFile(resolve(root, 'dist/injected.css'), 'utf8');
const expectedCss = (await Promise.all(['injected.css', 'v019-calendar.css', 'dark.css', 'workspace-settings.css'].map(name => readFile(resolve(root, 'public', name), 'utf8')))).join('\n');
assert.equal(css, expectedCss, 'The production stylesheet is stale; run npm run build first.');
const stylesheetHash = createHash('sha256').update(css).digest('hex');
const contentHash = createHash('sha256').update(await readFile(resolve(root, 'dist/content.js'))).digest('hex');
const sourceMap = JSON.parse(await readFile(resolve(root, 'dist/content.js.map'), 'utf8'));
const builtSources = new Map(sourceMap.sources.map((name, index) => [resolve(root, 'dist', name), sourceMap.sourcesContent[index]]));
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const bundle = await build({
  entryPoints: [resolve(root, 'src/preview/index.ts')], bundle: true, write: false,
  format: 'iife', target: 'chrome120', minify: false, legalComments: 'none', metafile: true,
});
// Prevent a fresh source checkout from silently previewing a stale installed
// build. Every shared runtime module must match its production source map.
for (const input of Object.keys(bundle.metafile.inputs)) {
  const path = resolve(root, input);
  if (path === resolve(root, 'src/preview/index.ts')) continue;
  assert.ok(builtSources.has(path), `Preview dependency is absent from the production build: ${input}`);
  assert.equal(await readFile(path, 'utf8'), builtSources.get(path), `Production JavaScript is stale for ${input}; run npm run build first.`);
}
const dom = new JSDOM(introductionFixtureHtml(6, true));
const doc = dom.window.document;
doc.documentElement.dataset.plFictionalPreview = 'true';
doc.title = `MyUCLA Workspace · v${manifest.version} fictional preview`;

// No existing native scripts, inline handlers or navigation targets are shipped.
doc.querySelectorAll('script,link,iframe,object,embed,base').forEach(node => node.remove());
doc.querySelectorAll('*').forEach(node => {
  [...node.attributes].filter(attribute => /^on/i.test(attribute.name)).forEach(attribute => node.removeAttribute(attribute.name));
});
doc.querySelectorAll('a').forEach(link => { link.setAttribute('href', '#'); link.removeAttribute('target'); });
const form = doc.getElementById('aspnetForm');
// Production ClassSearchPresentation validates this string. CSP and an early
// capture handler independently block submission; no live adapter is bundled.
form.action = 'https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx';
form.setAttribute('autocomplete', 'off');
const csp = doc.createElement('meta');
csp.httpEquiv = 'Content-Security-Policy';
csp.content = "default-src 'none'; script-src 'nonce-pl-fictional-preview'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'";
doc.head.prepend(csp);
for (const [name, content] of Object.entries({
  'viewport': 'width=device-width, initial-scale=1',
  'planner-build-version': manifest.version,
  'planner-source-revision': revision,
  'planner-production-css-sha256': stylesheetHash,
  'planner-production-content-sha256': contentHash,
  'description': 'Interactive fictional preview using the MyUCLA Workspace production presentation code. No account connection or network requests.',
})) {
  const meta = doc.createElement('meta'); meta.name = name; meta.content = content; doc.head.append(meta);
}

const labels = {
  renamePlan: 'Rename', newPlanMenuEntry: 'New plan', savePlanAsMenuEntry: 'Save a copy',
  deletePlanMenuEntry: 'Delete', loadMenuEntry: 'Load plan', printPlanMenuEntry: 'Print', aboutMenuEntry: 'About',
};
Object.entries(labels).forEach(([id, label]) => { doc.getElementById(id).textContent = label; });
doc.querySelector('.classPlanner_PlanNameContent').textContent = 'Sample plan';
doc.getElementById('page_title_text').textContent = 'Explore the planner workspace with fictional courses. All original destinations remain accessible. This preview cannot read or change an account.';
doc.getElementById('fixture-result-footer').firstElementChild.textContent = 'Add selected to plan';
doc.querySelector('#classPlanHeader button').textContent = 'Plan information';
const term = doc.getElementById('ctl00_MainContent_termSessionChooser_TermChooser');
term.insertAdjacentHTML('beforeend', '<option value="27W">Winter 2027</option><option value="27S">Spring 2027</option>');

const notice = doc.createElement('aside');
notice.id = 'preview-notice';
notice.setAttribute('aria-label', 'Fictional preview information');
notice.innerHTML = `<span>Fictional preview · v${manifest.version}</span><button type="button" id="preview-about">What works here?</button>`;
doc.body.prepend(notice);
const feedback = doc.createElement('div');
feedback.id = 'preview-feedback'; feedback.role = 'status'; feedback.hidden = true;
doc.body.append(feedback);

const productionStyle = doc.createElement('style');
productionStyle.id = 'preview-production-css'; productionStyle.textContent = css;
doc.head.append(productionStyle);
const metadata = doc.createElement('script');
metadata.id = 'preview-build-meta'; metadata.type = 'application/json';
metadata.textContent = JSON.stringify({ version: manifest.version, cssSha256: stylesheetHash, contentSha256: contentHash, sourceRevision: revision });
doc.head.append(metadata);
const previewStyle = doc.createElement('style');
previewStyle.textContent = `
  #preview-notice { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:center; box-sizing:border-box; padding:5px 12px; border-bottom:1px solid #dbe3ec; background:#f8fafc; color:#526174; font:11px/1.5 system-ui,sans-serif; }
  #preview-notice button { padding:0; border:0; background:none; color:#24528f; font:inherit; text-decoration:underline; cursor:pointer; }
  #preview-feedback { position:fixed; bottom:48px; left:50%; transform:translateX(-50%); z-index:2147483601; width:max-content; max-width:min(520px,calc(100vw - 32px)); padding:12px 16px; border:1px solid #cbd5e1; border-radius:9px; background:#fff; box-shadow:0 4px 20px #0002; color:#334155; font:13px/1.5 system-ui,sans-serif; }
  #preview-feedback[hidden] { display:none; }
  .preview-empty { padding:24px; font:14px/1.6 system-ui,sans-serif; }
  [data-preview-calendar-category][hidden] { display:none !important; }
  /* The fictional native host models the desktop sidebar. Keep its original
     layout readable on phones too; production workspace styling is untouched. */
  @media (max-width:799px) {
    html:not(.pl-workspace-page) #layoutContentArea { padding:24px 12px; }
    html:not(.pl-workspace-page) layout-columnwrapper { display:block; }
    html:not(.pl-workspace-page) main-content,
    html:not(.pl-workspace-page) right-sidebar { float:none; display:block; width:100%; height:auto; }
    html:not(.pl-workspace-page) right-sidebar { margin-top:20px; }
  }
  @media print { #preview-notice, #preview-feedback { display:none !important; } }
`;
doc.head.append(previewStyle);
// Keep generated markup reviewable without normalizing the exact CSS payload.
const textNodes = doc.createTreeWalker(doc.body, dom.window.NodeFilter.SHOW_TEXT);
while (textNodes.nextNode()) {
  const node = textNodes.currentNode;
  if (!node.parentElement?.closest('pre,textarea,script,style')) node.nodeValue = node.nodeValue.replace(/(?<=\n)[\t ]+(?=\r?\n)/g, '');
}
const script = doc.createElement('script');
script.setAttribute('nonce', 'pl-fictional-preview');
script.textContent = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
doc.body.append(script);
const html = dom.serialize();
assert.ok(Buffer.byteLength(html) < 1_000_000, 'The standalone preview should remain below 1 MB.');
const output = resolve(root, 'site/workspace-preview.html');
await mkdir(resolve(root, 'site'), { recursive: true });
await writeFile(output, html);
console.log(`Built fictional preview v${manifest.version}: ${output} (${Buffer.byteLength(html)} bytes)`);
console.log(`Production CSS SHA-256: ${stylesheetHash}`);
