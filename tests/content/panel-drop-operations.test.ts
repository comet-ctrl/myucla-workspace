// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { PanelLayoutController, type PanelDropOperation, type PanelDropTarget, type PanelRegistration } from "../../src/content/panel-layout";

describe("explicit panel drop operations", () => {
  let layout: PanelLayoutController, host: HTMLElement, panel: HTMLElement, handle: HTMLButtonElement;
  let changed: Mock<NonNullable<ConstructorParameters<typeof PanelLayoutController>[2]>>;
  let activate: Mock<() => void>;
  let frames: Map<number, FrameRequestCallback>, nextFrame: number;
  const rect = (left: number, top: number, width: number, height: number) => ({left, top, width, height, right:left+width, bottom:top+height, x:left, y:top, toJSON() {}});
  const paint = () => { const pending=[...frames.values()]; frames.clear(); pending.forEach(callback=>callback(0)); };
  const pointer = (node: EventTarget, type: string, x: number, y: number, render = true) => {
    const event=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y});
    Object.defineProperties(event,{pointerId:{value:1},isPrimary:{value:true}}); node.dispatchEvent(event); if(render)paint();
  };
  const target = (operation: PanelDropOperation, left: number, width: number, previewLeft=left, previewWidth=width): PanelDropTarget => ({
    operation, hit:{left,top:40,width,height:600}, preview:{left:previewLeft,top:40,width:previewWidth,height:600}
  });
  const register = (targets: PanelDropTarget[], extra: Partial<PanelRegistration> = {}) => {
    layout.addPanel({id:"find",label:"Find classes",element:panel,handle,defaultDock:"main",getDropTargets:()=>targets,onActivate:activate,...extra});
  };
  const dragTo = (x: number, y=200) => { pointer(handle,"pointerdown",100,80); pointer(document,"pointermove",x,y); };
  const preview = () => document.querySelector<HTMLElement>(".pl-panel-drop-preview");
  const placements = () => changed.mock.calls.filter(call=>call[2]==="placement");

  beforeEach(() => {
    frames=new Map(); nextFrame=0;
    vi.spyOn(window,"requestAnimationFrame").mockImplementation(callback=>{const id=++nextFrame;frames.set(id,callback);return id;});
    vi.spyOn(window,"cancelAnimationFrame").mockImplementation(id=>{frames.delete(id);});
    document.body.innerHTML='<form><div id="host"><section><button type="button">Find classes</button><input name="native-choice"></section></div></form>';
    host=document.getElementById("host")!;panel=host.querySelector("section")!;handle=panel.querySelector("button")!;
    host.getBoundingClientRect=()=>rect(20,40,980,600);panel.getBoundingClientRect=()=>rect(20,40,600,500);
    Object.defineProperty(window,"innerWidth",{value:1024,configurable:true});Object.defineProperty(window,"innerHeight",{value:768,configurable:true});
    changed=vi.fn();activate=vi.fn();layout=new PanelLayoutController(document,host,changed);
  });
  afterEach(()=>{layout.restore();vi.restoreAllMocks();});

  it.each([
    {x:500,operation:{kind:"merge",dock:"main",index:2},left:20,width:980},
    {x:40,operation:{kind:"split",dock:"left"},left:20,width:440}
  ] as const)("previews and commits $operation.kind with the same captured destination", ({x,operation,left,width}) => {
    // The split edge deliberately overlaps the merge body, as it does in the workspace.
    register([target({kind:"merge",dock:"main",index:2},20,980,20,980),target({kind:"split",dock:"left"},20,56,20,440)]);
    const input=panel.querySelector("input")!,parent=input.parentElement,form=input.form;input.value="fictional choice";
    dragTo(x);
    expect(preview()?.dataset.plDropOperation).toBe(operation.kind);expect(preview()?.dataset.plDockTarget).toBe(operation.dock);
    expect(preview()?.textContent).toBe(operation.kind==="split"?"Split left":"Group tabs");
    expect(preview()?.style.left).toBe(`${left}px`);expect(preview()?.style.width).toBe(`${width}px`);
    pointer(document,"pointerup",x,200);
    expect(placements()).toEqual([["find",operation.dock,"placement",operation]]);
    expect(input.parentElement).toBe(parent);expect(input.form).toBe(form);expect(input.value).toBe("fictional choice");
    expect(panel.parentElement).toBe(host);expect(preview()).toBeNull();expect(layout.isInteracting()).toBe(false);
  });

  it("retains separate insertion destinations within the same dock", () => {
    register([target({kind:"merge",dock:"right",index:0},600,120,600,380),target({kind:"merge",dock:"right",index:3},720,260,600,380)]);
    dragTo(650);pointer(document,"pointermove",850,200);pointer(document,"pointerup",850,200);
    expect(placements()).toEqual([["find","right","placement",{kind:"merge",dock:"right",index:3}]]);
  });

  it("releases a split preview immediately when the pointer returns to the tab strip", () => {
    const split=target({kind:"split",dock:"left"},20,120,20,440);
    split.hit.top=80;split.hit.height=560;
    const strip=target({kind:"merge",dock:"main",index:0},20,980);strip.hit.height=40;
    register([split,strip]);dragTo(40,200);
    expect(preview()?.textContent).toBe("Split left");
    pointer(document,"pointermove",40,79);
    expect(preview()?.textContent).toBe("Group tabs");
    pointer(document,"pointerup",40,79);
    expect(placements()).toEqual([["find","main","placement",{kind:"merge",dock:"main",index:0}]]);
  });

  it("copies target operations and preview bounds before activation changes the workspace", () => {
    const destination=target({kind:"merge",dock:"right",index:1},600,380,600,380),readTargets=vi.fn(()=>[destination]);
    activate.mockImplementation(()=>{destination.operation.index=4;destination.operation.dock="left";destination.preview.width=100;destination.hit.left=0;});
    register([],{getDropTargets:readTargets});dragTo(850);
    expect(preview()?.dataset.plDockTarget).toBe("right");expect(preview()?.style.width).toBe("380px");
    pointer(document,"pointerup",850,200);
    expect(placements()).toEqual([["find","right","placement",{kind:"merge",dock:"right",index:1}]]);
    expect(readTargets).toHaveBeenCalledOnce();
  });

  it("uses the release target when it arrives before the next animation frame", () => {
    register([target({kind:"merge",dock:"main",index:0},20,980),target({kind:"split",dock:"right"},944,56,560,440)]);
    dragTo(500);expect(preview()?.dataset.plDropOperation).toBe("merge");
    pointer(document,"pointermove",970,200,false);pointer(document,"pointerup",970,200,false);
    expect(placements()).toEqual([["find","right","placement",{kind:"split",dock:"right"}]]);
    const committed=layout.snapshot();paint();expect(layout.snapshot()).toEqual(committed);expect(frames.size).toBe(0);
  });

  it("restores committed geometry and visibility when the exact captured operation is rejected on release", () => {
    let allowed=true;const canDrop=vi.fn(()=>allowed),operation:PanelDropOperation={kind:"split",dock:"left"};
    register([target(operation,20,100,20,440)],{canDrop});
    layout.floatPanel("find",{left:150,top:100,width:420,height:320});layout.hidePanel("find");
    const before=layout.snapshot(),styles=panel.style.cssText;changed.mockClear();
    dragTo(40);expect(preview()?.dataset.plDropOperation).toBe("split");allowed=false;
    pointer(document,"pointerup",40,200);
    expect(canDrop).toHaveBeenLastCalledWith(operation);expect(layout.snapshot()).toEqual(before);expect(panel.style.cssText).toBe(styles);
    expect(placements()).toEqual([]);expect(changed).toHaveBeenLastCalledWith("find","floating","geometry");
    expect(preview()).toBeNull();expect(layout.isInteracting()).toBe(false);expect(frames.size).toBe(0);
  });

  it.each(["Escape","pointercancel","blur"])("cancels %s without committing either hovered operation", cancel => {
    register([target({kind:"merge",dock:"main",index:1},20,980),target({kind:"split",dock:"left"},20,56,20,440)]);
    const before=layout.snapshot(),styles=panel.style.cssText;
    dragTo(500);pointer(document,"pointermove",40,200);expect(preview()?.dataset.plDropOperation).toBe("split");
    pointer(document,"pointermove",50,230,false);
    if(cancel==="Escape")document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true}));
    else if(cancel==="pointercancel")pointer(document,"pointercancel",50,230,false);
    else window.dispatchEvent(new Event("blur"));
    paint();pointer(document,"pointerup",50,230);
    expect(layout.snapshot()).toEqual(before);expect(panel.style.cssText).toBe(styles);expect(placements()).toEqual([]);
    expect(preview()).toBeNull();expect(layout.isInteracting()).toBe(false);expect(frames.size).toBe(0);
  });

  it("rejects a programmatic dock before activation when canDrop disallows it", () => {
    const canDrop=vi.fn(()=>false);register([],{canDrop});const before=layout.snapshot();
    layout.dockPanel("find","left",true,{kind:"split",dock:"left"});
    expect(canDrop).toHaveBeenCalledExactlyOnceWith({kind:"split",dock:"left"});expect(activate).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();expect(layout.snapshot()).toEqual(before);
  });

  it("does not advertise explicit targets outside a panel's allowed docks", () => {
    register([target({kind:"split",dock:"left"},20,400)],{allowedDocks:["main"]});
    dragTo(200);expect(preview()).toBeNull();pointer(document,"pointerup",200,200);
    expect(layout.getPlacement("find")).toBe("floating");expect(panel.querySelector<HTMLButtonElement>(".pl-panel-resize")?.hidden).toBe(false);
    expect(placements()).toEqual([["find","floating","placement"]]);
  });
});
