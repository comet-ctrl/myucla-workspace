/** Exercises extension course actions against fictional pages and a local-only server stand-in. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { introductionFixtureHtml } from './workspace-fixture.mjs';

const root=resolve(import.meta.dirname,'..'),out=resolve(root,'../../outputs/course-controls-audit');
const js=await readFile(resolve(root,'dist/content.js'),'utf8'),css=await readFile(resolve(root,process.env.BETTER_MYUCLA_QA_CSS||'dist/injected.css'),'utf8');
const url='https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx',base=introductionFixtureHtml(6,true);
const baselineDoc=new JSDOM(base).window.document;
const initialOrder=[...baselineDoc.querySelectorAll('#panelPlan #div_landing > table > tbody.courseItem')].map(node=>[...node.classList].find(value=>/^Class\d+$/.test(value)).slice(5));
const browser=await chromium.launch({executablePath:process.env.BETTER_MYUCLA_CHROMIUM||undefined});
const report=[];await mkdir(out,{recursive:true});
const cases=process.env.BETTER_MYUCLA_CONTROL_WIDTHS?.split(',').map(Number).map(width=>({width,height:900}))||[{width:2048,height:900},{width:1440,height:900},{width:1280,height:900},{width:390,height:900},{width:1440,height:650}];

try {
 for(const viewport of cases){
  const page=await browser.newPage({viewport}),errors=[],outgoing=[],moves=[],dialogs=[],feedback=[];
  let serverOrder=[...initialOrder],mainLoads=0,frameLoads=0,holdFrame=false,releaseFrame=null,confirmChoice=false,foreignFrame=false;
  const stored={'plannerLift.layout.v1':{tidy:true},'plannerLift.header.v1':{compact:true}};
  page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',async dialog=>{dialogs.push({type:dialog.type(),message:dialog.message()});await (confirmChoice||dialog.type()==='beforeunload'?dialog.accept():dialog.dismiss());});
  await page.exposeBinding('fixtureStorageGet',(_,key)=>({[key]:stored[key]}));
  await page.exposeBinding('fixtureStorageSet',(_,values)=>Object.assign(stored,values));
  await page.exposeBinding('fixtureStorageRemove',(_,key)=>{delete stored[key];});
  await page.exposeBinding('fixtureRecordMove',({frame},order)=>{assert.notEqual(frame,page.mainFrame(),'only explicit Save invokes native ordering');serverOrder=order;moves.push([...order]);});
  await page.addInitScript(()=>{
   window.chrome={storage:{local:{get:key=>window.fixtureStorageGet(key),set:values=>window.fixtureStorageSet(values),remove:key=>window.fixtureStorageRemove(key)},onChanged:{addListener:()=>{},removeListener:()=>{}}}};
   window.$=selector=>document.querySelectorAll(selector);
   window.courseListAction=(_panel,_tracker,_command,command)=>{
    const match=/^(moveupClass|movedownClass)\|(\d+)!0$/.exec(command);if(!match)throw Error('Unexpected fictional ordering action');
    const table=document.querySelector('#panelPlan #div_landing > table'),rows=[...table.querySelectorAll(':scope > tbody.courseItem')];
    const row=rows.find(node=>node.classList.contains('Class'+match[2])),index=rows.indexOf(row),next=index+(match[1]==='moveupClass'?-1:1);
    if(!row||next<0||next>=rows.length)throw Error('Invalid fictional adjacent move');
    rows.splice(index,1);rows.splice(next,0,row);rows.forEach((node,i)=>{table.append(node);node.querySelector('.moveupClass').style.visibility=i?'visible':'hidden';node.querySelector('.movedownClass').style.visibility=i===rows.length-1?'hidden':'visible';});
    void window.fixtureRecordMove(rows.map(node=>[...node.classList].find(value=>/^Class\d+$/.test(value)).slice(5)));
   };
  });
  await page.route('**/*',async route=>{
   if(route.request().url()!==url){outgoing.push(route.request().url());return route.abort();}
   const main=route.request().frame()===page.mainFrame();if(main)mainLoads++;else{frameLoads++;if(holdFrame)await new Promise(resolve=>{releaseFrame=resolve;});}
   const doc=new JSDOM(base).window.document,table=doc.querySelector('#panelPlan #div_landing > table');
   if(!main&&foreignFrame)doc.getElementById('ctl00_MainContent_planIDField').value='999999999999';
   // The introduction fixture models only the desktop native sidebar. Supply
   // its mobile stacking counterpart for Original-layout checks; production
   // CSS and the enhanced workspace receive no additional layout rules.
   const nativeResponsive=doc.createElement('style');nativeResponsive.textContent='@media(max-width:799px){html:not(.pl-workspace-page) main-content,html:not(.pl-workspace-page) right-sidebar{display:block;float:none;width:100%;height:auto}html:not(.pl-workspace-page) right-sidebar{margin-top:20px}html:not(.pl-workspace-page) #layoutContentArea{padding:24px 12px}}';doc.head.append(nativeResponsive);
   serverOrder.forEach((id,i)=>{const node=table.querySelector('tbody.Class'+id);table.append(node);node.querySelector('.moveupClass').style.visibility=i?'visible':'hidden';node.querySelector('.movedownClass').style.visibility=i===serverOrder.length-1?'hidden':'visible';});
   if(main){const style=doc.createElement('style');style.textContent=css;doc.head.append(style);const script=doc.createElement('script');script.textContent=js;doc.body.append(script);}
   await route.fulfill({status:200,contentType:'text/html',body:doc.documentElement.outerHTML});
  });
  const ready=()=>page.waitForSelector('.pl-workspace-deck');
  const order=()=>page.locator('#panelPlan #div_landing > table > tbody.courseItem').evaluateAll(rows=>rows.map(node=>[...node.classList].find(value=>/^Class\d+$/.test(value)).slice(5)));
  const course=id=>page.locator('#panelPlan tbody.Class'+id);
  const actions=async id=>{const button=course(id).locator('[data-pl-workspace-actions]');await button.scrollIntoViewIfNeeded();if(await button.getAttribute('aria-expanded')!=='true')await button.click();};
  const more=async id=>{await actions(id);};
  const undo=async()=>{await page.locator('[data-pl-action="discard"]').click();assert.deepEqual(await order(),serverOrder);};
  await page.goto(url);await ready();
  assert.deepEqual(await order(),initialOrder);
  await page.evaluate(()=>{
   window.fixtureResultClicks={help:0,footer:0,selected:0};
   document.querySelectorAll('.ClassSearchList .header-row button,.ClassSearchList .header-row a').forEach(node=>node.addEventListener('click',event=>{event.preventDefault();window.fixtureResultClicks.help++;}));
   document.querySelector('#fixture-result-footer button').addEventListener('click',event=>{event.preventDefault();window.fixtureResultClicks.footer++;window.fixtureResultClicks.selected=document.querySelectorAll('.ClassSearchList input:checked').length;});
  });
  await page.locator('.pl-workspace-nav [data-pl-module="find"]').click();
  const help=page.locator('.pl-browser-body-active .header-row button,.pl-browser-body-active .header-row a');
  assert.equal(await help.count(),4);
  for(const item of await help.all()){await item.scrollIntoViewIfNeeded();await item.click();}
  const choice=page.locator('.pl-browser-body-active .data_row input').first();await choice.check();
  await page.locator('#fixture-result-footer button').click();
  assert.deepEqual(await page.evaluate(()=>window.fixtureResultClicks),{help:4,footer:1,selected:1},'native help and result actions receive exactly one original event with selected sections intact');
  await choice.uncheck();await page.locator('.pl-workspace-nav [data-pl-module="classes"]').click();
  const filter=page.locator('[data-pl-search]');await filter.fill('Example course C');assert.equal(await page.locator('#panelPlan tbody.courseItem:visible').count(),1);await filter.fill('');

  // Native MyUCLA is untouched until the explicit Save button.
  await actions(initialOrder[1]);await course(initialOrder[1]).locator('[data-pl-position]').selectOption('0');
  assert.equal((await order())[0],initialOrder[1]);assert.equal(frameLoads,0);assert.equal(moves.length,0);await undo();
  await more(initialOrder[5]);await course(initialOrder[5]).locator('[data-pl-action="top"]').click();
  assert.equal((await order())[0],initialOrder[5]);
  const show=page.locator('[data-pl-action="jump-show"]');if(await show.isVisible()){await show.click();feedback.push('Show me');}
  const oneUndo=page.locator('[data-pl-action="jump-undo"]');if(await oneUndo.isVisible()){await oneUndo.click();assert.deepEqual(await order(),initialOrder);feedback.push('Undo move');}else await undo();
  // Show me dismisses its chip, so exercise the independent one-move Undo on
  // a second move rather than pretending both controls shared one click path.
  await more(initialOrder[5]);await course(initialOrder[5]).locator('[data-pl-action="top"]').click();
  await oneUndo.click();assert.deepEqual(await order(),initialOrder);feedback.push('Undo move');
  await actions(initialOrder[1]);const grip=course(initialOrder[1]).locator('[data-pl-action="drag"]');await grip.focus();await page.keyboard.press('Alt+ArrowUp');
  assert.equal((await order())[0],initialOrder[1]);await undo();

  await actions(initialOrder[1]);await grip.scrollIntoViewIfNeeded();
  const gripBox=await grip.boundingBox(),targetBox=await course(initialOrder[0]).boundingBox();
  await page.mouse.move(gripBox.x+gripBox.width/2,gripBox.y+gripBox.height/2);await page.mouse.down();
  await page.mouse.move(gripBox.x+gripBox.width/2,Math.max(40,targetBox.y+targetBox.height/4),{steps:12});await page.mouse.up();
  assert.equal((await order())[0],initialOrder[1],'pointer drag moves the native course locally');await undo();

  // Notes are local, capped and restored by the actual storage path.
  await more(initialOrder[0]);await course(initialOrder[0]).locator('[data-pl-action="tag"]').click();
  let note=course(initialOrder[0]).locator('[data-pl-tag]');await note.pressSequentially('ABCDEFGHIJKLMNOPQRSTUVWXYZ');assert.equal((await note.inputValue()).length,24,'typing honors the native note length limit');await note.fill('Fictional reminder');await course(initialOrder[0]).getByRole('button',{name:'Save note',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-pl-tag]').value==='Fictional reminder');
  await page.reload();await ready();await more(initialOrder[0]);await course(initialOrder[0]).locator('[data-pl-action="tag"]').click();
  note=course(initialOrder[0]).locator('[data-pl-tag]');assert.equal(await note.inputValue(),'Fictional reminder');
  await page.locator('[data-pl-action="menu"]').click();await page.locator('[data-pl-action="clear-all-annotations"]').click();
  assert.equal(await note.inputValue(),'Fictional reminder','cancelled deletion retains notes');
  confirmChoice=true;await page.locator('[data-pl-action="menu"]').click();await page.locator('[data-pl-action="clear-all-annotations"]').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-pl-tag]')].every(node=>node.value===''));confirmChoice=false;

  // Recovery offers do not apply themselves or invoke native moves.
  await actions(initialOrder[2]);await course(initialOrder[2]).locator('[data-pl-position]').selectOption('0');
  await page.waitForFunction(()=>!!window.__plannerLiftController);
  await page.waitForTimeout(80);await page.reload();await ready();
  await page.waitForSelector('[data-pl-draft]:not([hidden])');assert.deepEqual(await order(),serverOrder);
  await page.locator('[data-pl-action="restore-draft"]').click();assert.equal((await order())[0],initialOrder[2]);assert.equal(moves.length,0);await undo();
  await actions(initialOrder[1]);await course(initialOrder[1]).locator('[data-pl-position]').selectOption('0');
  await page.waitForTimeout(80);await page.reload();await ready();await page.waitForSelector('[data-pl-draft]:not([hidden])');
  await page.locator('[data-pl-action="drop-draft"]').click();assert.deepEqual(await order(),serverOrder);assert.equal(await page.locator('[data-pl-draft]').isVisible(),false);

  // Save runs original adjacent-move handlers only inside the intercepted
  // fictional frame, then performs the real coordinator's final reload.
  await actions(initialOrder[1]);await course(initialOrder[1]).locator('[data-pl-position]').selectOption('0');
  const desired=await order(),loadsBefore=mainLoads;await page.locator('[data-pl-action="save"]').click();
  await page.waitForFunction(()=>!document.querySelector('#planner-lift-sync-frame')&&!!document.querySelector('.pl-workspace-deck'));
  await page.waitForURL(url);await page.waitForTimeout(500);await ready();
  assert.ok(mainLoads>loadsBefore,'successful Save reloads the native fictional page');assert.deepEqual(serverOrder,desired);assert.deepEqual(await order(),desired);assert.ok(moves.length>=1);
  const completed=moves.length;
  await actions(initialOrder[2]);await course(initialOrder[2]).locator('[data-pl-position]').selectOption('0');
  holdFrame=true;const stopLoads=mainLoads;await page.locator('[data-pl-action="save"]').click();
  await page.waitForSelector('#planner-lift-sync-frame',{state:'attached'});await page.locator('[data-pl-action="cancel"]').click();
  for(let attempt=0;!releaseFrame&&attempt<20;attempt++)await new Promise(resolve=>setTimeout(resolve,20));
  assert.ok(releaseFrame,'fictional pending sync frame reached the route');releaseFrame();holdFrame=false;
  await page.waitForTimeout(650);await ready();assert.ok(mainLoads>stopLoads);assert.equal(moves.length,completed,'Stop before frame readiness prevents every native move');assert.deepEqual(await order(),serverOrder);
  // A fresh background load can resolve to another plan. The production
  // guard must stop without writing and retain an accessible Reload action.
  await actions(initialOrder[2]);await course(initialOrder[2]).locator('[data-pl-position]').selectOption('0');
  const unsaved=await order();foreignFrame=true;await page.locator('[data-pl-action="save"]').click();
  const reload=page.locator('[data-pl-action="reload"]');await reload.waitFor({state:'visible'});
  assert.match(await page.locator('[data-pl-status]').innerText(),/different plan/);assert.deepEqual(await order(),unsaved);assert.equal(moves.length,completed,'foreign plan guard prevents every native move');
  foreignFrame=false;const failedLoads=mainLoads;await Promise.all([page.waitForEvent('load'),reload.click()]);await ready();
  assert.ok(mainLoads>failedLoads,'Reload page invokes a real fictional main navigation');assert.deepEqual(await order(),serverOrder);
  await page.locator('[data-pl-action="drop-draft"]').click();assert.equal(await page.locator('[data-pl-draft]').isVisible(),false);
  await page.locator('.pl-workspace-layout-settings > summary').click();
  await page.locator('.pl-workspace-original').click();
  for(let index=0;index<2;index++){
   const toggle=page.locator('[data-pl-action="toggle-all"]'),willExpand=await toggle.innerText()==='Expand all';await toggle.click();
   assert.equal(await page.locator('#panelPlan tbody.courseItem.pl-course-collapsed').count(),willExpand?0:initialOrder.length,'Original layout collapse/expand all affects every native course');
  }
  const first=course(serverOrder[0]),singleToggle=first.locator('[data-pl-action="toggle-course"]'),wasExpanded=await singleToggle.getAttribute('aria-expanded')==='true';await singleToggle.click();
  assert.equal(await singleToggle.getAttribute('aria-expanded'),String(!wasExpanded));await singleToggle.click();
  const returnButton=page.locator('.pl-workspace-return');await returnButton.scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(out,`original-controls-${viewport.width}x${viewport.height}.png`)});
  const returnGeometry=await returnButton.evaluate(node=>{const box=node.getBoundingClientRect();return{button:box.toJSON(),hit:document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)?.tagName};});
  await writeFile(resolve(out,`original-geometry-${viewport.width}x${viewport.height}.json`),JSON.stringify(returnGeometry,null,2));
  await returnButton.click();await ready();assert.deepEqual(await order(),serverOrder);
  await page.screenshot({path:resolve(out,`controls-${viewport.width}x${viewport.height}.png`)});
  assert.equal(frameLoads,3);assert.deepEqual(outgoing,[]);assert.deepEqual(errors,[]);
  report.push({viewport,passed:['four native result help actions','native selected-result action','plan filter','position select','Move to top',...feedback,'Undo all','keyboard drag','pointer drag','note length and persistence','cancel/confirm delete notes','restore/discard recovery','explicit Save native frame handlers/reload','Stop pending save','foreign-plan Save guard and error Reload page','Original layout collapse/expand all and one course','return to workspace'],nativeMoves:moves.length,fictionalSyncFrames:frameLoads,unexpectedRequests:outgoing,errors});
  await page.close();console.log(`Course controls passed ${viewport.width}x${viewport.height}`);
 }
}finally{await browser.close();}
await writeFile(resolve(out,'verified-controls.json'),JSON.stringify(report,null,2));
