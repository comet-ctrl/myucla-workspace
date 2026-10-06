import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {nativeDetailFixtureHtml} from './workspace-fixture.mjs';
const url='https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx';
const css=await readFile(new URL('../dist/injected.css',import.meta.url),'utf8');
const js=await readFile(new URL('../dist/content.js',import.meta.url),'utf8');
const browser=await chromium.launch({executablePath:process.env.BETTER_MYUCLA_CHROMIUM||undefined});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('**/*',r=>r.request().url()===url?r.fulfill({contentType:'text/html',body:nativeDetailFixtureHtml()}):r.abort());
 await page.goto(url);
 await page.evaluate(()=>{
  document.querySelector('.classPlannerWrapper').insertAdjacentHTML('afterbegin','<div class="classPlanner_Messages" style="height:18px;color:#cc6600">Fictional warning with enough text to wrap on a narrow screen.</div><div class="classPlanner_Messages" style="height:18px;color:#cc0000">A second fictional warning, retained separately.</div>');
  const stored={'plannerLift.layout.v1':{tidy:true},'plannerLift.header.v1':{compact:true}};
  window.chrome={storage:{local:{get:async k=>({[k]:stored[k]}),set:async v=>Object.assign(stored,v),remove:async k=>delete stored[k]},onChanged:{addListener(){},removeListener(){}}}};
  window.nativeColors=[...document.querySelectorAll('tbody.courseItem > tr:first-child .OrderingButtons')].map(parent=>{
   const wrapper=document.createElement('span');parent.prepend(wrapper);
   for(const button of [...parent.querySelectorAll('button')])wrapper.append(button);
   const node=document.createElement('input');node.type='color';node.className='native-color';wrapper.append(node);return {node,parent:wrapper,form:node.form};
  });
  window.submissions=0;document.querySelector('form').addEventListener('submit',e=>{e.preventDefault();submissions++;});
 });
 await page.addStyleTag({content:css});await page.addScriptTag({content:js});await page.waitForSelector('.pl-workspace-plan');
 const first=page.locator('.pl-workspace-plan tbody.courseItem').first();
 for(const appearance of ['light','dark']) for(const width of [2048,1440,960,390]) {
  await page.evaluate(theme=>document.documentElement.setAttribute('data-pl-appearance',theme),appearance);
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(100);
  const geometry=await first.evaluate(card=>{
   const grip=card.querySelector('.pl-grip').getBoundingClientRect(),title=card.querySelector('.pl-code').getBoundingClientRect(),color=card.querySelector('input[type="color"]').getBoundingClientRect();
   return {grip:grip.toJSON(),title:title.toJSON(),color:color.toJSON()};
  });
  assert.ok(geometry.grip.width>0&&geometry.grip.right<=geometry.title.left+1,'grip precedes title');
  assert.ok(geometry.color.width>0&&geometry.color.left>=geometry.title.right-1,'color follows title');
  assert.equal(await first.locator('button.pl-workspace-detail-button').count(),0,'no separate Details button');
  const titleTarget=first.locator('[data-pl-workspace-details]');
  await first.locator('.pl-workspace-course-summary span').first().click();
  assert.equal(await titleTarget.getAttribute('aria-expanded'),'true','clicking course summary opens its details');
  if(width>=960){
   const aligned=await first.locator(':scope > tr:nth-child(3)').evaluate(row=>{
    const content=row.querySelector(':scope > td'),style=getComputedStyle(row),bounds=row.getBoundingClientRect();
    return {content:content.getBoundingClientRect().width,available:bounds.width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)};
   });
   assert.ok(Math.abs(aligned.content-aligned.available)<=1,'details content fills pane width without an independent cap');
  }
  assert.equal(await first.locator(':scope > tr:first-child').evaluate(n=>getComputedStyle(n).boxShadow),'none','selection does not add a duplicate inset line to the first row');
  await titleTarget.click();
  assert.equal(await titleTarget.getAttribute('aria-expanded'),'false','clicking course title again closes its details');
  assert.equal(await first.locator('.OrderingButtons button:visible').count(),0,'nested native arrows stay hidden while tools are closed');
  const notices=await page.locator('.classPlanner_Messages').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
  assert.ok(notices[1].top>=notices[0].bottom-1,'separate warnings never overlap');
  await first.getByRole('button',{name:/Course tools for/}).click();
  assert.ok(await first.getByRole('button',{name:/Move .* to the top/}).isVisible());
  assert.ok(await first.getByRole('button',{name:/Note for/}).isVisible());
  assert.ok(await first.locator('[data-pl-position]').isVisible());
  const arrows=await first.locator('.OrderingButtons button').evaluateAll(nodes=>nodes.map(n=>({rect:n.getBoundingClientRect().toJSON(),card:n.closest('tbody.courseItem').getBoundingClientRect().toJSON(),visible:getComputedStyle(n).display!=='none'})));
  assert.ok(arrows.every(a=>a.visible&&a.rect.height>0),'both nested arrows are available when tools open');
  assert.ok(arrows.every(a=>a.rect.top>=a.card.top&&a.rect.bottom<=a.card.bottom),'open arrows fit completely inside the card');
  assert.equal(await first.locator('.pl-course-more').count(),0);
  await first.getByRole('button',{name:/Note for/}).click();
  assert.ok(await first.locator('[data-pl-tag]').isVisible());
  await first.locator('[data-pl-tag]').fill('Fictional saved note');
  await first.getByRole('button',{name:'Save note',exact:true}).click();
  await first.getByRole('button',{name:/Note for/}).click();
  assert.equal(await first.locator('[data-pl-tag]').inputValue(),'Fictional saved note');
  await first.locator('[data-pl-tag]').fill('Discard this draft');
  await first.getByRole('button',{name:'Cancel',exact:true}).click();
  await first.getByRole('button',{name:/Note for/}).click();
  assert.equal(await first.locator('[data-pl-tag]').inputValue(),'Fictional saved note');
  await first.getByRole('button',{name:/Note for/}).click();
  await first.getByRole('button',{name:/Course tools for/}).click();
  console.log(`Title tools verified at ${width}px in ${appearance}`);
 }
 await page.setViewportSize({width:1440,height:900});
 await page.waitForTimeout(100);
 const order=()=>page.locator('.pl-workspace-plan tbody.courseItem').evaluateAll(cards=>cards.map(c=>c.className.match(/Class\d+/)[0]));
 const initial=await order();
 for(let i=0;i<10;i++) {
  const before=await order();
  const handle=page.locator('.pl-workspace-plan .pl-grip').first();await handle.scrollIntoViewIfNeeded();
  const start=await handle.boundingBox(),second=await page.locator('.pl-workspace-plan tbody.courseItem').nth(1).boundingBox();
  await page.mouse.move(start.x+start.width/2,start.y+start.height/2);await page.mouse.down();
  await page.mouse.move(start.x+start.width/2,start.y+start.height/2+second.height*.8,{steps:10});await page.mouse.up();
  await page.waitForTimeout(250);
  const after=await order();assert.equal(after[0],before[1],'drag actually moves first course below second');
  assert.equal(await page.locator('.pl-drag-active,.pl-drag-shifted').count(),0,'drag styles cleared');
 }
 assert.deepEqual(await order(),initial,'ten adjacent swaps restore initial order');
 assert.equal(await page.locator('.pl-grip').count(),initial.length,'no duplicated handles');
 assert.ok(await page.evaluate(()=>nativeColors.every(({node,parent,form})=>node.isConnected&&node.parentElement===parent&&node.form===form)));
 assert.equal(await page.evaluate(()=>submissions),0,'local dragging sends no native submission');
 await page.evaluate(()=>{
  const notice=document.createElement('div');notice.className='classPlanner_Messages';notice.id='fixture-extra-warning';notice.textContent='A fictional warning added by native redraw.';
  document.querySelector('.classPlannerWrapper').append(notice);
 });
 await page.waitForFunction(()=>document.querySelector('.classPlannerWrapper').style.getPropertyValue('--pl-notice-count')==='3');
 const redrawNotices=await page.locator('.classPlanner_Messages').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
 assert.ok(redrawNotices.every((n,i)=>!i||n.top>=redrawNotices[i-1].bottom-1),'redrawn warnings occupy separate rows');
 await page.locator('#fixture-extra-warning').evaluate(n=>n.remove());
 await page.waitForFunction(()=>document.querySelector('.classPlannerWrapper').style.getPropertyValue('--pl-notice-count')==='2');
 await mkdir(new URL('./shots/',import.meta.url),{recursive:true});
 await page.screenshot({path:new URL('./shots/course-title-tools.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 await page.locator('.pl-workspace-layout-settings > summary').click();
 await page.getByRole('button',{name:'Original layout',exact:true}).click();
 assert.equal(await page.locator('.pl-workspace-plan').count(),0);
 assert.equal(await page.locator('.classPlannerWrapper').evaluate(n=>n.style.getPropertyValue('--pl-notice-count')),'','Original layout removes notice geometry');
 console.log('Repeated dragging, native identity and restoration passed');
} finally {await browser.close();}
