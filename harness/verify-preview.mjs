/** Verify the distributable preview using fictional data and no live services. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const previewPath = resolve(root, process.argv[2] || 'site/workspace-preview.html');
const previewUrl = pathToFileURL(previewPath).href;
const widths = process.env.BETTER_MYUCLA_PREVIEW_WIDTHS?.split(',').map(Number) || [1440, 1280, 960, 390];
assert.ok(widths.length && widths.every(width => Number.isInteger(width) && width >= 320 && width <= 3840), 'preview widths are bounded whole pixels');
const digest = text => createHash('sha256').update(text).digest('hex');
const manifest = JSON.parse(await readFile(resolve(root, 'dist/manifest.json'), 'utf8'));
const output = resolve(root, `../../outputs/planner-preview-v${manifest.version}`);
const productionCss = await readFile(resolve(root, 'dist/injected.css'), 'utf8');
const productionContent = await readFile(resolve(root, 'dist/content.js'), 'utf8');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.BETTER_MYUCLA_CHROMIUM || undefined });

async function usable(locator, label, minimumHeight = 1) {
  assert.ok(await locator.isVisible(), `${label} is visible`);
  const box = await locator.boundingBox();
  assert.ok(box && box.width >= 1 && box.height >= minimumHeight, `${label} has usable dimensions: ${JSON.stringify(box)}`);
  return box;
}

async function noPageOverflow(page, label) {
  const bounds = await page.evaluate(() => ({ width: innerWidth, body: document.body.scrollWidth, root: document.documentElement.scrollWidth }));
  assert.ok(bounds.body <= bounds.width + 1 && bounds.root <= bounds.width + 1, `${label} has no horizontal document clipping: ${JSON.stringify(bounds)}`);
}

async function snapshotNative(page) {
  await page.evaluate(() => {
    window.previewCheckNative = {
      fields: [...document.querySelectorAll('#aspnetForm input, #aspnetForm select')].filter(node => !node.closest('[data-planner-lift-owned]')),
      resultControls: [...document.querySelectorAll('.ClassSearchList input, .ClassSearchList button, .ClassSearchList select')].map(node => ({ node, parent: node.parentElement })),
      detailRows: [...document.querySelectorAll('tbody.courseItem > tr:nth-child(3)')].map(node => ({ node, parent: node.parentElement })),
      statuses: [...document.querySelectorAll('table.coursetable td:nth-child(3), .ClassSearchList .data_row > .span3')].map(node => ({ node, html: node.innerHTML })),
      calendar: document.querySelector('.classPlanner_CalendarSection'),
      calendarControls: [...document.querySelectorAll('.classPlanner_CalendarSection button,.classPlanner_CalendarSection input')].filter(node => !node.closest('[data-planner-lift-owned]')).map(node => ({ node, parent: node.parentElement, form: node.form })),
      navigation: document.getElementById('fixture-native-navigation')?.outerHTML,
    };
  });
}

async function nativePreserved(page) {
  const checks = await page.evaluate(() => {
    const saved = window.previewCheckNative;
    const form = document.getElementById('aspnetForm');
    return {
      fields: saved.fields.every(node => node.isConnected && node.form === form),
      resultControls: saved.resultControls.every(({ node, parent }) => node.isConnected && node.parentElement === parent),
      detailRows: saved.detailRows.every(({ node, parent }) => node.isConnected && node.parentElement === parent),
      statuses: saved.statuses.every(({ node, html }) => node.isConnected && node.innerHTML === html),
      navigation: document.getElementById('fixture-native-navigation')?.outerHTML === saved.navigation,
      calendar: saved.calendar.isConnected && saved.calendar === document.querySelector('.classPlanner_CalendarSection'),
      calendarControls: saved.calendarControls.every(({ node, parent, form }) => node.isConnected && node.parentElement === parent && node.form === form),
    };
  });
  assert.ok(Object.values(checks).every(Boolean), `native identity/form, detail ancestry, statuses and navigation are preserved: ${JSON.stringify(checks)}`);
}

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    page.setDefaultTimeout(10000);
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url() !== previewUrl) requests.push(request.url()); });
    await page.route('**/*', route => route.request().url() === previewUrl ? route.continue() : route.abort());
    await page.goto(previewUrl);
    await page.waitForSelector('.pl-workspace-deck');
    await page.waitForSelector('html[data-pl-preview-ready="true"]');
    await page.screenshot({ path: resolve(output, `initial-find-${width}.png`) });

    const metadata = JSON.parse(await page.locator('#preview-build-meta').textContent());
    assert.equal(metadata.version, manifest.version, 'preview and extension build versions match');
    assert.equal(metadata.cssSha256, digest(productionCss), 'preview records the current production stylesheet hash');
    assert.equal(metadata.contentSha256, digest(productionContent), 'preview records the verified production script hash');
    // HTML parsing normalizes Windows CRLF to LF; compare every CSS byte after
    // that required parser normalization, while metadata checks the raw file.
    assert.equal(digest(await page.locator('#preview-production-css').textContent()), digest(productionCss.replace(/\r\n?/g, '\n')), 'preview uses the exact production stylesheet after HTML newline normalization');
    assert.equal(await page.locator('.pl-workspace-nav [data-pl-module]').count(), 7, 'all named destinations, including Schedule and Information, are present');
    assert.equal(await page.locator('.pl-workspace-original').count(), 1, 'Original layout is present');
    assert.equal(await page.locator('.pl-workspace-main > section').count(), 5, 'all original main modules are retained');
    await snapshotNative(page);

    const moduleButton = name => page.locator(`.pl-workspace-nav [data-pl-module="${name}"]`);
    const main = page.locator('.pl-workspace-main');
    const calendar = page.locator('.pl-workspace-calendar');
    const checkCalendar = async (information = false) => {
      assert.equal(await calendar.isVisible(), !information && width >= 1100, 'desktop browsing retains Schedule; Information uses the complete workspace and narrow layouts select one group');
      if (width >= 1100 && !information) {
        const center = await usable(main, 'main workspace', 200), cal = await usable(calendar, 'weekly schedule', 200);
        assert.ok(cal.width >= 420 && center.width >= 560 && center.x + center.width <= cal.x + 1 && cal.y + cal.height <= 901, 'desktop groups retain readable widths without overlapping or leaving the viewport');
      }
    };

    await moduleButton('classes').click();
    await checkCalendar();
    await noPageOverflow(page, 'My classes');
    const details = page.locator('[data-pl-workspace-details]').first();
    await details.click();
    assert.equal(await details.getAttribute('aria-expanded'), 'true');
    await usable(page.locator('.pl-workspace-preview'), 'selected class details', 60);
    const detailRow = await usable(page.locator('tbody.pl-workspace-preview-card > tr:nth-child(3)'), 'original detail row', 30);
    assert.ok(detailRow.x >= -1 && detailRow.x + detailRow.width <= width + 1, 'docked details fit the viewport');
    await nativePreserved(page);
    await page.keyboard.press('Escape');
    assert.equal(await details.getAttribute('aria-expanded'), 'false');
    assert.ok(await details.evaluate(node => node === document.activeElement), 'Escape returns focus to the Details trigger');

    await moduleButton('find').click();
    await checkCalendar();
    await usable(page.locator('#ctl00_MainContent_cs_searchBy'), 'native search mode');
    await usable(page.locator('#searchTier0'), 'native search field');
    assert.equal(await page.locator('.pl-browser-index button').count(), 3, 'only the three fictional loaded results are indexed');
    await usable(page.locator('.pl-browser-list'), 'loaded course details', 80);
    const resultButton = page.locator('.pl-browser-index button');
    await resultButton.nth(2).click();
    const selection = page.locator('#container_course_M2 .data_row input').first();
    await selection.check();
    await resultButton.first().click();
    assert.ok(await selection.isChecked(), 'switching result previews preserves the selected original section');
    await usable(page.locator('.pl-browser-selections'), 'selected section reminder');
    await page.locator('.pl-browser-selections > summary').click();
    await page.locator('.pl-browser-selection-actions button').click();
    assert.ok(await selection.isVisible() && await selection.isChecked(), 'the selection reminder reveals the selected section');
    assert.ok(await selection.evaluate(node => node === document.activeElement), 'revealing a selection focuses its native control');
    await selection.uncheck();

    const filter = page.getByRole('searchbox', { name: 'Filter loaded courses', exact: true });
    await filter.fill('Example course B');
    await filter.press('Enter');
    assert.equal(await page.locator('.pl-browser-index button:visible').count(), 1);
    assert.ok(await page.locator('#container_course_M1').isVisible(), 'filtering selects the matching already-loaded preview');
    await filter.fill('');
    await resultButton.first().click();
    await noPageOverflow(page, 'Find classes');
    await page.screenshot({ path: resolve(output, `find-${width}.png`) });

    for (const name of ['optimizer', 'study', 'personal']) {
      await moduleButton(name).click();
      assert.equal(await moduleButton(name).getAttribute('aria-pressed'), 'true');
      await checkCalendar();
      await noPageOverflow(page, name);
    }
    await moduleButton('information').click();
    assert.equal(await moduleButton('information').getAttribute('aria-pressed'), 'true');
    await usable(page.locator('right-sidebar'), 'original information and help');
    await checkCalendar(true);
    await nativePreserved(page);
    await page.keyboard.press('Escape');
    assert.equal(await moduleButton('personal').getAttribute('aria-pressed'), 'true', 'Information Escape restores the prior module');
    await checkCalendar();
    await nativePreserved(page);

    await moduleButton('classes').click();
    if (width >= 1100) {
      const splitter = page.locator('.pl-dock-divider:visible');
      assert.equal(await splitter.count(), 1, 'two dock groups expose one shared divider');
      await splitter.press('Home');
      const before = (await calendar.boundingBox()).width;
      await splitter.press('ArrowLeft');
      assert.ok((await calendar.boundingBox()).width > before, 'keyboard resizing changes the schedule width');
      await splitter.dblclick();
    } else {
      const scheduleToggle = page.locator('.pl-workspace-schedule-toggle');
      await scheduleToggle.click();
      await usable(calendar, 'narrow schedule', 200);
      assert.equal(await page.locator('.pl-workspace-plan').isVisible(), false, 'narrow Schedule conceals the inactive Classes panel while retaining its DOM ancestor');
      await noPageOverflow(page, 'narrow schedule');
      await page.screenshot({ path: resolve(output, `schedule-${width}.png`) });
      await page.keyboard.press('Escape');
      assert.ok(await page.locator('.pl-workspace-plan').isVisible(), 'Schedule Escape restores the active Classes panel');
      assert.ok(await scheduleToggle.evaluate(node => node === document.activeElement), 'Schedule Escape restores toggle focus');
    }

    await nativePreserved(page);
    await page.locator('.pl-workspace-layout-settings > summary').click();
    await page.locator('.pl-workspace-original').click();
    assert.equal(await page.locator('#ctl00_MainContent_classPlanPanel > section').count(), 6, 'Original layout restores all six native sections');
    assert.equal(await page.locator('.pl-browser-index').count(), 0);
    await nativePreserved(page);
    await page.locator('.pl-workspace-return').click();
    await page.waitForSelector('.pl-workspace-deck');
    await moduleButton('find').click();
    await usable(page.locator('.pl-browser-list'), 'restored course preview', 80);
    await nativePreserved(page);

    const nativePlanCount = await page.locator('tbody.courseItem').count();
    await page.locator('#fixture-result-footer button').click();
    assert.match(await page.locator('#preview-feedback').textContent(), /Fictional preview only/, 'account actions report their preview limitation');
    assert.equal(await page.locator('tbody.courseItem').count(), nativePlanCount, 'simulated add action does not mutate the sample plan');
    const planActions = page.locator('.pl-workspace-plan-actions');
    await planActions.locator('summary').click();
    await page.locator('#newPlanMenuEntry').click();
    assert.match(await page.locator('#preview-feedback').textContent(), /Fictional preview only/, 'original plan actions remain discoverable but inert');
    await page.keyboard.press('Escape');

    // Search uses the actual native fields/submitter but only filters invented
    // local data. Exercise a partial result redraw, an empty state and recovery.
    const searchMode = page.locator('#ctl00_MainContent_cs_searchBy');
    const firstField = page.locator('#searchTier0'), secondField = page.locator('#searchTier1');
    await searchMode.selectOption('instructor');
    assert.equal(await firstField.getAttribute('aria-label'), "Instructor's Last Name");
    assert.match(await page.locator('#preview-feedback').textContent(), /locally/);
    await searchMode.selectOption('subject');
    await firstField.fill('Example');
    await secondField.fill('101');
    await page.locator('#ctl00_MainContent_cs_goButton').click();
    await page.waitForFunction(() => document.querySelectorAll('.CourseListEntry').length === 1);
    await usable(page.locator('.pl-browser-list'), 'single-course search result', 80);
    assert.equal(await page.locator('.pl-browser-index').isVisible(), false, 'single-course results use the complete details area');
    assert.match(await page.locator('#preview-feedback').textContent(), /1 sample course shown/);
    await secondField.fill('No matching sample');
    await page.locator('#ctl00_MainContent_cs_goButton').click();
    await usable(page.locator('.preview-empty'), 'empty local search');
    await firstField.fill('');
    await secondField.fill('');
    await page.locator('#ctl00_MainContent_cs_goButton').click();
    await page.waitForFunction(() => document.querySelectorAll('.CourseListEntry').length === 3);
    await usable(page.locator('.pl-browser-list'), 'recovered multiple-course results', 80);
    await page.locator('#fixture-result-footer button').click();
    assert.match(await page.locator('#preview-feedback').textContent(), /Fictional preview only/, 'new result actions remain inert after a native-shaped redraw');
    await page.locator('.pl-browser-body-active .header-Status').click();
    assert.match(await page.locator('#preview-feedback').textContent(), /Sample section information/, 'section help remains usable after result redraw');
    await noPageOverflow(page, 'redrawn local search');
    await page.locator('.pl-workspace-layout-settings > summary').click();
    await page.locator('.pl-workspace-original').click();
    const firstResultHeading = page.locator('#CourseListEntry_M0 .class-title a');
    const firstResultBody = page.locator('#container_course_M0');
    const originallyVisible = await firstResultBody.isVisible();
    await firstResultHeading.click();
    assert.equal(await firstResultBody.isVisible(), !originallyVisible, 'the original result heading expands/collapses its fictional course');
    await firstResultHeading.click();
    assert.equal(await firstResultBody.isVisible(), originallyVisible);
    await page.locator('.pl-workspace-return').click();
    await page.waitForSelector('.pl-workspace-deck');
    assert.equal(page.url(), previewUrl, 'preview remains on its own local page');
    assert.deepEqual(errors, [], 'preview has no script errors');
    assert.deepEqual(requests, [], 'preview makes no external, asset or form requests');
    await page.close();
    console.log(`Preview ${width}px: build metadata, native identity, course/details/selection, all modules, schedule, restoration, local search redraws, inert actions and zero requests passed`);
  }
} finally {
  await browser.close();
}
