/** Production header-reveal QA. Fictional native header; no live account. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { introductionFixtureHtml } from './workspace-fixture.mjs';
import { nativeLayeredCalendarMarkup } from './calendar-fixture.mjs';

const root = resolve(import.meta.dirname, '..'), output = resolve(root, 'harness/shots/header-reveal');
const css = await readFile(resolve(root, 'dist/injected.css'), 'utf8'), js = await readFile(resolve(root, 'dist/content.js'), 'utf8');
const url = 'https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx';
const headerKey = 'plannerLift.header.v1';
const widths = process.env.BETTER_MYUCLA_HEADER_WIDTHS?.split(',').map(Number) || [2048, 1440, 1280, 390];
const cases = widths.flatMap(width => ['light', 'dark'].map(appearance => ({ width, appearance, shadow: false })));
for (const width of [...new Set([widths[0], widths.at(-1)])]) cases.push({ width, appearance: 'dark', shadow: true });
const frame = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
const reports = [];

function fixture() {
  const doc = new JSDOM(introductionFixtureHtml(12, true, 12)).window.document;
  const calendar = nativeLayeredCalendarMarkup(); doc.getElementById('gridDiv').innerHTML = calendar.html;
  const masthead = doc.querySelector('layout-headerwrap'), nav = doc.getElementById('fixture-native-navigation');
  nav.style.cssText = 'position:relative;height:138px;padding:0 24px;background:#355e8e;color:#fff;box-sizing:border-box;display:block';
  nav.innerHTML = '<div class="fixture-brand">UCLA <span>Example portal</span></div><div class="fixture-native-menu-row"><a id="fixture-native-home" href="#fixture-home">Example home</a><button type="button" id="fixture-native-menu-toggle" aria-expanded="false" aria-controls="fixture-native-menu" onclick="window.fixtureSetMenu(this.getAttribute(\'aria-expanded\')!==\'true\')">Example classes</button><a href="#fixture-services">Example services</a></div><div id="fixture-native-menu" class="fixture-native-menu" role="menu" hidden><button type="button" role="menuitem">Example menu item</button></div>';
  const account = doc.createElement('div'); account.className = 'fixture-account-bar'; account.textContent = 'Example university portal'; masthead.prepend(account);
  doc.querySelector('.classPlannerWrapper').insertAdjacentHTML('afterbegin', '<div class="classPlanner_Messages"><div class="classPlanner_TermReq">Example reminder: review courses for <button type="button" class="link" id="fixture-term-link" onclick="return false">Example future term</button> <button type="button" class="link uit-clickover-bottom text-default" id="fixture-notice-help" aria-label="Example notice help" onclick="return false"><i class="icon-question-sign" style="color:#000" aria-hidden="true">?</i></button></div></div>');
  const safeAction = doc.querySelector('#classPlanHeader button');
  doc.querySelector('.classPlanner_Messages').insertAdjacentHTML('afterbegin', '<div class="classPlanner_Labels" style="color:#b00000">Example active notice</div>');
  safeAction.id = 'fixture-safe-planner-action'; safeAction.setAttribute('onclick', 'window.fixtureHarmlessClicks++');
  const style = doc.createElement('style'); style.textContent = `
    .fixture-account-bar{height:28px;box-sizing:border-box;padding:5px 24px;background:#a9d7e9;color:#234e78;font:12px/18px Arial,sans-serif}
    .fixture-brand{height:96px;padding:16px 0;box-sizing:border-box;font:italic bold 40px/64px Arial,sans-serif}.fixture-brand>span{font:normal 24px/1 Georgia,serif}
    .fixture-native-menu-row{display:flex;align-items:center;justify-content:flex-end;gap:20px;height:42px;font:13px/1.5 Arial,sans-serif}
    .fixture-native-menu-row a,.fixture-native-menu-row button{color:#fff;font:inherit;background:transparent;border:0;padding:8px;white-space:nowrap;text-decoration:none}
    .fixture-native-menu{position:absolute;right:20px;top:134px;z-index:900;padding:12px;background:white;color:#24354a;border:1px solid #7791aa;box-shadow:0 6px 18px #1233}
    .fixture-native-menu[hidden]{display:none}.fixture-native-menu button{padding:10px;background:white;color:#24354a;border:0}
    .label.warning{background:#f7dda0;color:#674806}.classPlanner_Messages button.link{background:transparent;border:0;padding:0;color:#315f94;font:inherit;cursor:pointer}
    .classPlanner_Messages .icon-question-sign{display:inline-block;border:1px solid currentColor;border-radius:50%;width:12px;height:12px;text-align:center;font:600 10px/12px sans-serif}
    @media(max-width:600px){.fixture-brand{font-size:32px}.fixture-brand>span{font-size:18px}.fixture-native-menu-row{gap:0;justify-content:flex-start;font-size:11px}.fixture-native-menu-row a,.fixture-native-menu-row button{padding:7px 5px}}
  ` + calendar.css; doc.head.append(style);
  return doc.documentElement.outerHTML;
}

async function open(browser, width, appearance, shadow) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: appearance, reducedMotion: 'no-preference', hasTouch: true });
  page.setDefaultTimeout(8000);
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.request().url() === url ? route.fulfill({ status: 200, contentType: 'text/html', body: fixture() }) : (requests.push(route.request().url()), route.abort()));
  await page.goto(url);
  await page.evaluate(({ headerKey, appearance, shadow }) => {
    const stored = { 'plannerLift.layout.v1': { tidy: true }, [headerKey]: { compact: true }, 'plannerLift.appearance.v1': appearance }, listeners = [];
    window.fixtureStored = stored; window.fixtureWrites = []; window.fixtureCalls = []; window.fixtureSubmits = []; window.fixtureHarmlessClicks = 0; window.fixturePrintEvents = [];
    for (const name of ['beforeprint', 'afterprint']) addEventListener(name, () => window.fixturePrintEvents.push(name));
    window.chrome = { storage: { local: { get: async key => ({ [key]: structuredClone(stored[key]) }), set: async value => { window.fixtureWrites.push(structuredClone(value)); Object.assign(stored, structuredClone(value)); }, remove: async key => delete stored[key] }, onChanged: { addListener: fn => listeners.push(fn), removeListener: fn => { const index = listeners.indexOf(fn); if (index >= 0) listeners.splice(index, 1); } } } };
    const masthead = document.querySelector('layout-headerwrap'), nav = document.getElementById('fixture-native-navigation');
    if (shadow) {
      const shadowStyle = document.head.lastElementChild.textContent;
      const hostRoot = masthead.attachShadow({ mode: 'open' });
      const rootStyle = document.createElement('style'); rootStyle.textContent = ':host{display:block;height:166px}layout-topbar,header-header{display:block}'; hostRoot.append(rootStyle);
      for (const [tag, child] of [['layout-topbar', masthead.firstElementChild], ['header-header', nav]]) {
        const component = document.createElement(tag); const childRoot = component.attachShadow({ mode: 'open' });
        const style = document.createElement('style'); style.textContent = shadowStyle;
        childRoot.append(style, child); hostRoot.append(component);
      }
    }
    window.fixtureSetMenu = open => { nav.querySelector('#fixture-native-menu-toggle').setAttribute('aria-expanded', String(open)); nav.querySelector('#fixture-native-menu').hidden = !open; };
    window.__doPostBack = (...args) => window.fixtureCalls.push(args);
    document.querySelector('form').addEventListener('submit', event => { event.preventDefault(); window.fixtureSubmits.push(event.submitter?.id || 'implicit'); });
    const shadowRoots = [], controls = [...document.querySelectorAll('input,select,button,a')];
    const visit = element => { if (element.shadowRoot) { shadowRoots.push({ node: element.shadowRoot, html: element.shadowRoot.innerHTML }); controls.push(...element.shadowRoot.querySelectorAll('input,select,button,a')); for (const child of element.shadowRoot.children) visit(child); } for (const child of element.children) visit(child); }; visit(masthead);
    window.fixtureHeader = { node: masthead, nav, roots: shadowRoots, parent: masthead.parentElement, html: masthead.outerHTML, color: getComputedStyle(nav).color, background: getComputedStyle(nav).backgroundColor };
    window.fixtureControls = controls.map(node => ({ node, parent: node.parentElement, form: node.form, handler: node.getAttribute('onclick') }));
  }, { headerKey, appearance, shadow });
  await page.addStyleTag({ content: css }); await page.addScriptTag({ content: js });
  await page.waitForSelector('.pl-workspace-deck');
  await page.waitForFunction(() => document.documentElement.classList.contains('pl-header-compact') && document.getElementById('titleText').getBoundingClientRect().top <= 13);
  await frame(page); return { page, errors, requests };
}

async function reveal(page) {
  const edge = page.locator('.pl-intro-header-edge'), bounds = await edge.boundingBox();
  assert.ok(bounds && bounds.height > 0, 'the compact header has a visible reveal sensor');
  assert.ok(bounds.width <= 132 && Math.abs(bounds.x + bounds.width / 2 - page.viewportSize().width / 2) <= 1, 'only a small centered tab senses pointer entry');
  await page.mouse.move(12, 2); await page.waitForTimeout(160);
  assert.equal(await page.locator('html').evaluate(n=>n.classList.contains('pl-header-revealed')), false, 'crossing the top outside the center does not open the header');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.waitForTimeout(180);
  assert.equal(await page.locator('html').evaluate(n=>n.classList.contains('pl-header-revealed')), false, 'hover shows the arrow without opening native navigation');
  const tab = await edge.boundingBox();
  assert.ok(tab.height >= 30, 'hover drops down the clickable arrow tab');
  await page.mouse.click(tab.x + tab.width / 2, tab.y + tab.height / 2);
  await page.waitForFunction(() => document.documentElement.classList.contains('pl-header-revealed') && scrollY <= 1);
  assert.equal(await edge.getAttribute('aria-expanded'), 'true');
  const header = await page.locator('layout-headerwrap').boundingBox();
  assert.ok(header && header.y >= -1 && header.height >= 166, 'click brings the intact native masthead into view');
}

async function leave(page, width) {
  await page.mouse.move(width - 24, 930);
  if(await page.locator('html').evaluate(n=>n.classList.contains('pl-header-latched'))){
    await page.waitForTimeout(320);
    assert.ok(await page.locator('html').evaluate(n=>n.classList.contains('pl-header-revealed')),'pointer departure does not close a deliberately opened header');
    assert.ok(await page.locator('.pl-intro-header-edge').isVisible(),'the upward close control remains available');
    await page.locator('.pl-intro-header-edge').click();
  }
  await page.waitForFunction(() => !document.documentElement.classList.contains('pl-header-revealed') && document.getElementById('titleText').getBoundingClientRect().top <= 13);
}

async function identity(page) {
  const result = await page.evaluate(() => {
    const header = window.fixtureHeader, nav = header.nav;
    return {
      header: header.node.isConnected && header.node.parentElement === header.parent && header.node.outerHTML === header.html && header.roots.every(root => root.node.innerHTML === root.html),
      colors: getComputedStyle(nav).color === header.color && getComputedStyle(nav).backgroundColor === header.background,
      controls: window.fixtureControls.every(({ node, parent, form, handler }) => node.isConnected && node.form === form && node.getAttribute('onclick') === handler && (node.parentElement === parent || node.id === 'ctl00_MainContent_cs_goButton' && node.parentElement?.matches('.pl-search-submit') && node.parentElement.parentElement === parent)),
      forms: document.querySelectorAll('form').length, calls: window.fixtureCalls, submits: window.fixtureSubmits,
    };
  });
  assert.deepEqual(result, { header: true, colors: true, controls: true, forms: 1, calls: [], submits: [] }, 'reveal and appearance preserve native markup, colors, controls and form association');
}

function alpha(color) { const values = color.match(/[\d.]+/g)?.map(Number) || []; return values[3] ?? 1; }
function contrast(a, b) {
  const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05);
}
async function geometry(page) {
  return page.evaluate(() => ({ scrollY, events: window.fixturePrintEvents, elements: [...document.querySelectorAll('.pl-workspace-nav,.pl-workspace-deck,.pl-workspace-main,#ctl00_MainContent_classPlanPanel')].map(node => ({ class: node.className, id: node.id, bounds: node.getBoundingClientRect().toJSON(), style: node.getAttribute('style') })) }));
}

const browser = await chromium.launch({ executablePath: process.env.BETTER_MYUCLA_CHROMIUM || undefined });
await mkdir(output, { recursive: true });
try {
  for (const { width, appearance, shadow } of cases) {
    const name = `${width}-${appearance}${shadow ? '-shadow' : ''}`;
    if (process.env.BETTER_MYUCLA_HEADER_CASE && process.env.BETTER_MYUCLA_HEADER_CASE !== name) continue;
    const report = { width, appearance, shadow, passed: false }; reports.push(report);
    const { page, errors, requests } = await open(browser, width, appearance, shadow);
    try {
      const originalSaved = await page.evaluate(key => structuredClone(window.fixtureStored[key]), headerKey);
      assert.equal(await page.locator('html').evaluate(node => getComputedStyle(node).scrollbarWidth), 'none', 'only the outer root scrollbar is hidden');
      const nativeList = page.locator('#panelPlan');
      await nativeList.evaluate(node => { node.scrollTop = 100; });
      assert.ok(await nativeList.evaluate(node => node.scrollTop > 0 && ['auto', 'scroll'].includes(getComputedStyle(node).overflowY)), 'native course list retains independent scrolling');
      await reveal(page);
      assert.ok(await nativeList.evaluate(node => node.scrollTop > 0), 'revealing UCLA navigation preserves the local list position');
      await page.mouse.move(width - 24, 400); await page.mouse.wheel(0, 600); await page.waitForTimeout(250);
      assert.ok(await page.evaluate(() => scrollY <= 1), 'wheel cannot leave a fitting explicitly opened header half hidden');
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('pl-header-latched')), 'wheel preserves explicit open state');
      await page.screenshot({ path: resolve(output, `revealed-${name}.png`) });
      await leave(page, width);
      await page.screenshot({ path: resolve(output, `compact-${name}.png`) });
      await reveal(page); await page.keyboard.press('Escape'); await page.waitForTimeout(420);
      report.edgeEscapeStable = await page.locator('html').evaluate(node => !node.classList.contains('pl-header-revealed'));
      await leave(page, width);

      await reveal(page); await page.locator('#fixture-native-home').focus(); await page.mouse.move(width - 24, 930);
      await page.waitForTimeout(420);
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('pl-header-revealed')), 'focus within the native header prevents timed hiding');
      await page.keyboard.press('Escape');
      await leave(page, width);
      assert.equal(await page.locator('.pl-intro-header-toggle').evaluate(node => document.activeElement === node), true, 'Escape returns focus to the planner header control');

      // Menu state, rather than focus alone, must hold the reveal open.
      await reveal(page); await page.locator('#fixture-native-menu-toggle').click();
      const originalMenuStyle=await page.locator('#fixture-native-menu').getAttribute('style');
      for(const height of [104,214,382,560]) {
        await page.locator('#fixture-native-menu').evaluate((node,height)=>{node.style.height=`${height}px`;},height);
        await page.waitForTimeout(120);
        const menuBottom=await page.locator('#fixture-native-menu').evaluate(node=>node.getBoundingClientRect().bottom);
        const bounds=await page.evaluate(()=>({workspace:document.querySelector('.pl-workspace-host').getBoundingClientRect().top,term:document.getElementById('ctl00_MainContent_termSessionChooser').getBoundingClientRect().bottom}));
        assert.ok(bounds.workspace>=Math.max(menuBottom,bounds.term)-1,`workspace clears menu ${height}: ${JSON.stringify({menuBottom,...bounds})}`);
      }
      await page.locator('#fixture-native-menu').evaluate((node,style)=>{if(style===null)node.removeAttribute('style');else node.setAttribute('style',style);},originalMenuStyle);
      await page.locator('.pl-intro-header-toggle').focus(); await page.mouse.move(width - 24, 930); await page.waitForTimeout(420);
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('pl-header-revealed')), 'an open native menu keeps the header visible after focus moves away');
      await page.evaluate(() => window.fixtureSetMenu(false));
      await leave(page, width);

      const touchTarget = await page.locator('.pl-intro-header-edge').boundingBox();
      assert.ok(touchTarget); await page.touchscreen.tap(touchTarget.x + touchTarget.width / 2, touchTarget.y + touchTarget.height / 2);
      await page.waitForFunction(() => document.documentElement.classList.contains('pl-header-revealed') && scrollY <= 1);
      await page.keyboard.press('Escape');
      await leave(page, width);

      // A real primary gesture must not move its native target before click.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await reveal(page);
      const safeBounds = await page.locator('#fixture-safe-planner-action').boundingBox();
      assert.ok(safeBounds); await page.mouse.move(safeBounds.x + safeBounds.width / 2, safeBounds.y + safeBounds.height / 2);
      await page.mouse.down(); await page.waitForTimeout(420);
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('pl-header-revealed')), 'held primary gestures keep the header revealed past its leave delay');
      assert.equal(await page.evaluate(() => window.fixtureHarmlessClicks), 0, 'pointerdown does not activate or replay the native action');
      await page.mouse.move(safeBounds.x + safeBounds.width / 2 + 2, safeBounds.y + safeBounds.height / 2 + 2);
      await page.mouse.up();
      assert.equal(await page.evaluate(() => window.fixtureHarmlessClicks), 1, 'the trusted native click fires exactly once without closing the header');
      await leave(page, width);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.keyboard.press('Tab'); await page.locator('.pl-intro-header-edge').focus();
      await page.waitForTimeout(180);
      const keyboardTarget = await page.locator('.pl-intro-header-edge').boundingBox();
      assert.ok(keyboardTarget && keyboardTarget.height >= 24 && keyboardTarget.width >= 100, 'keyboard focus gives the header control a visible labeled target');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.documentElement.classList.contains('pl-header-revealed') && scrollY <= 1);
      await page.keyboard.press('Escape'); await leave(page, width);
      assert.deepEqual(await page.evaluate(key => window.fixtureStored[key], headerKey), originalSaved, 'hover, focus, menu and temporary click never change the saved compact choice');
      assert.equal(await page.evaluate(key => window.fixtureWrites.filter(write => key in write).length, headerKey), 0, 'temporary header behavior causes no preference writes');
      await identity(page);

      const notice = await page.locator('.classPlanner_Messages').evaluate(node => ({ background: getComputedStyle(node).backgroundColor, color: getComputedStyle(node).color, surface: getComputedStyle(node.parentElement).backgroundColor,
        controls: [...node.querySelectorAll('button.link')].map(button => ({ background: getComputedStyle(button).backgroundColor, color: getComputedStyle(button).color, border: getComputedStyle(button).borderTopWidth, icon: button.querySelector('i') ? getComputedStyle(button.querySelector('i')).color : null })),
      })); report.notice = notice;
      if (appearance === 'dark') {
        for (const [selector, expected] of [['.classPlanner_Labels','rgb(255, 155, 166)'],['.classPlanner_TermReq','rgb(243, 201, 121)'],['.label.warning','rgb(243, 201, 121)'],['.badge.info','rgb(184, 220, 255)']]) {
          const sample=await page.locator(selector).first().evaluate(node=>({color:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}));
          assert.equal(sample.color,expected,`${selector} uses dark semantic colors`);
          assert.ok(contrast(sample.color,alpha(sample.background) ? sample.background : notice.surface)>=4.5,`${selector} contrast`);
        }
        assert.equal(alpha(notice.background), 0, 'dark inline notices do not become a separate colored banner');
        for (const control of notice.controls) {
          assert.equal(alpha(control.background), 0, 'native notice links and help keep a transparent background');
          assert.equal(control.color, 'rgb(153, 204, 255)', 'native inline notice controls use the theme link color');
          assert.ok(contrast(control.color, notice.surface) >= 4.5, 'notice controls keep readable contrast with their actual surface');
          if (control.icon) assert.equal(control.icon, control.color, 'the native black inline help icon adopts the readable link color');
        }
        await page.locator('#fixture-notice-help').hover();
        const hover = await page.locator('#fixture-notice-help').evaluate(node => ({ background: getComputedStyle(node).backgroundColor, color: getComputedStyle(node).color, icon: getComputedStyle(node.querySelector('i')).color }));
        assert.equal(alpha(hover.background), 0); assert.equal(hover.color, 'rgb(153, 204, 255)'); assert.equal(hover.icon, hover.color);
      }

      await page.getByRole('button', { name: 'Show header', exact: true }).click();
      await page.waitForFunction(key => window.fixtureStored[key].compact === false && scrollY <= 1, headerKey);
      assert.equal(await page.locator('.pl-intro-header-edge').isVisible(), true, 'saved expanded view retains the close arrow');
      await page.mouse.move(4,400);await page.mouse.wheel(0,1200);await page.waitForTimeout(250);
      assert.ok(await page.evaluate(()=>scrollY<=1),'left navigation wheel preserves saved expanded view');
      await page.locator('.pl-intro-header-edge').click();
      await page.waitForFunction(key => window.fixtureStored[key].compact === true && document.getElementById('titleText').getBoundingClientRect().top <= 13, headerKey);
      assert.equal(await page.evaluate(key => window.fixtureWrites.filter(write => key in write).length, headerKey), 2, 'only the two explicit persistent toggles write the preference');
      await page.mouse.move(4,400);await page.mouse.wheel(0,2400);await page.waitForTimeout(250);
      assert.ok(await page.evaluate(()=>Math.abs(document.getElementById('titleText').getBoundingClientRect().top-12)<=1),'compact root cannot drift down from sidebar wheel');
      await page.evaluate(()=>document.documentElement.classList.add('pl-has-actionbar'));
      assert.ok(await page.locator('.pl-workspace-host').evaluate(node=>Math.abs(node.getBoundingClientRect().bottom-innerHeight)<=1),'actionbar reserve keeps workspace background to viewport bottom');
      await page.evaluate(()=>document.documentElement.classList.remove('pl-has-actionbar'));

      report.beforePrint = await geometry(page);
      await page.emulateMedia({ media: 'print' }); await frame(page); report.duringPrint = await geometry(page);
      assert.equal(await page.locator('.pl-intro-header-edge').isVisible(), false, 'print hides the header reveal affordance');
      assert.notEqual(await page.locator('html').evaluate(node => getComputedStyle(node).scrollbarWidth), 'none', 'print removes the outer scrollbar override');
      assert.ok(await page.locator('layout-headerwrap').isVisible(), 'print retains native UCLA masthead content');
      assert.ok(await page.locator('.classPlanner_CalendarSection').isVisible(), 'print retains native schedule content');
      await page.emulateMedia({ media: 'screen' }); await frame(page); report.afterPrint = await geometry(page);
      await page.locator('.pl-workspace-layout-settings > summary').click();
      await page.getByRole('button', { name: 'Original layout', exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('.pl-workspace-deck'));
      assert.equal(await page.locator('.pl-intro-header-edge').count(), 0, 'Original layout removes the reveal sensor');
      assert.equal(await page.locator('html').evaluate(node => node.classList.contains('pl-header-compact') || node.classList.contains('pl-header-revealed')), false, 'Original layout removes header presentation state');
      assert.notEqual(await page.locator('html').evaluate(node => getComputedStyle(node).scrollbarWidth), 'none', 'Original layout restores the root scrollbar');
      assert.equal(await page.locator('#fixture-notice-help i').evaluate(node => getComputedStyle(node).color), 'rgb(0, 0, 0)', 'Original layout restores the native inline black icon');
      await identity(page); assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      assert.ok(report.edgeEscapeStable, 'Escape stays compact even while the pointer remains at the top edge');
      report.passed = true; console.log(`PASS ${name}: hover/click reveal, leave/focus/menu/Escape, saved preference, native identity, notices, scrollbar and restoration`);
    } catch (error) {
      report.error = error.message; report.stack = error.stack; report.pageErrors = errors;
      await page.screenshot({ path: resolve(output, `failure-${name}.png`) }); console.error(`FAIL ${name}: ${error.stack || error.message}`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); await writeFile(resolve(output, 'report.json'), JSON.stringify(reports, null, 2)); }
assert.ok(reports.length > 0, 'the requested header fixture must match at least one case');
assert.equal(reports.filter(report => !report.passed).length, 0, 'every header production fixture must pass');
