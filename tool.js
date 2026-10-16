/*!
 * Nodes & Paths — tool.js  (ES module)
 *
 * An interactive node/path infographic tool: nodes, lines, poster artboards, text blocks,
 * animation and PNG/SVG export. Runs inside a Shadow DOM, so it never touches the host page's CSS.
 *
 *   import { mount } from 'https://cdn.jsdelivr.net/gh/<user>/<repo>@<tag>/tool.js';
 *   const tool = mount(document.getElementById('app'), { ui: 'none' });   // hide the tool's own UI
 *   tool.params();                 // list of controls to build in the host's panel
 *   tool.set('lineWidth', 6);      // change a parameter
 *   tool.on('change', e => {});    // parameter / graph edits
 *
 * Options: ui 'full' | 'dock' | 'none' (default 'full'), theme 'auto' | 'light' | 'dark',
 *          preset 'poster' | 'poster-v1' | 'autumn' | 'constellation' | 'tree' | 'routes' | 'blank',
 *          autosave (localStorage, default false), storageKey, loadFonts (default true),
 *          onDownload({filename,data}), onChange(e), onReady(api).
 */
const FONT_URL='https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,400&family=Special+Gothic+Condensed+One&family=Roboto+Condensed:wght@700&display=swap';
const CSS = `:host{
  display:block; position:relative; height:100%; min-height:420px;
  /* panel: light = paper */
  --bg:#e7dfca; --panel:#efe8d5; --ink:#2b1d16; --mute:#6d5a48; --rule:#cdbf9f; --field:#f8f3e5;
  --accent:#2f5fb8; --accent-ink:#f8f3e5; --focus:#2f5fb8;
  /* type */
  --f-serif:"Averia Serif Libre",Georgia,"Times New Roman",serif;
  --f-cond:"Special Gothic Condensed One","Arial Narrow","Helvetica Neue Condensed",Arial,sans-serif;
  --f-bold:Arial,"Helvetica Neue",Helvetica,sans-serif;
  /* stage artwork: deep brown in both themes */
  --st-bg:#33231a; --st-ink:#efe6d2; --st-mute:#b9a58f; --st-btn:#46332a; --st-rule:#6a5143; --st-on:#dbe055; --st-on-ink:#2b1d16; --st-label:#eba7b8; --st-clear:rgba(51,35,26,0);
  box-sizing:border-box;
}
@media (prefers-color-scheme:dark){
  :host(:not([data-theme="light"])){--bg:#150e0a;--panel:#1e1410;--ink:#efe6d2;--mute:#ad9a84;--rule:#3d2d23;--field:#2b1d16;--accent:#dbe055;--accent-ink:#2b1d16;--focus:#dbe055}
}
:host([data-theme="dark"]){--bg:#150e0a;--panel:#1e1410;--ink:#efe6d2;--mute:#ad9a84;--rule:#3d2d23;--field:#2b1d16;--accent:#dbe055;--accent-ink:#2b1d16;--focus:#dbe055}
*,*::before,*::after{box-sizing:inherit}
.root{position:relative;height:100%;margin:0;overflow:hidden;container-type:inline-size;background:var(--bg);color:var(--ink);font:400 15px/1.35 var(--f-cond);letter-spacing:.01em;font-synthesis:none}
.app{display:grid;grid-template-columns:minmax(0,1fr) 410px;grid-template-rows:minmax(0,1fr);height:100%}

/* stage */
.stage{position:relative;height:100%;background:var(--st-bg);min-width:0;overflow:hidden}
#svg{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;user-select:none;-webkit-user-select:none}
#svg text{font-family:var(--f-serif);font-weight:400;fill:var(--st-label)}
.tip{position:absolute;z-index:3;pointer-events:none;display:flex;flex-direction:column;gap:1px;background:#efe6d2;color:#2b1d16;padding:7px 10px;border-radius:4px;font-size:13px;line-height:1.35;white-space:nowrap}
.tip[hidden]{display:none}
.tip b{font:700 12px var(--f-bold)}
.tip i{font:400 13px var(--f-serif);font-style:normal}
.cap{position:absolute;top:18px;left:20px;z-index:1;max-width:min(34%,380px);pointer-events:none}
.cap h2{margin:0;font:700 clamp(26px,3.4vw,44px)/1 var(--f-serif);color:var(--st-label);letter-spacing:-.01em}
.cap p{margin:8px 0 0;font:400 17px/1.25 var(--f-cond);color:var(--st-mute)}
.legend{display:flex;flex-direction:column;gap:6px;margin-top:16px;font:400 17px/1.1 var(--f-cond);color:var(--st-ink)}
.legend b{font:400 15px var(--f-cond);color:var(--st-mute);margin-bottom:2px}
.legend span{display:flex;align-items:center;gap:9px}
.legend i{display:inline-block;width:24px;height:5px;border-radius:3px}
.dock{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;gap:8px;padding:36px 16px 12px;color:var(--st-ink);background:linear-gradient(to top,var(--st-bg) 58%,var(--st-clear));pointer-events:none}
.dock .seg,.dock .dbtn,.dock select,.dock label,.dock input{pointer-events:auto}
.dock-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center}
.seg{display:inline-flex;border:1px solid var(--st-rule);border-radius:4px;overflow:hidden;background:var(--st-btn)}
.seg button{background:var(--st-btn);color:var(--st-ink);border:0;border-radius:0;padding:7px 12px}
.seg button+button{border-left:1px solid var(--st-rule)}
.dbtn{background:var(--st-btn);color:var(--st-ink);border:1px solid var(--st-rule);border-radius:4px;padding:7px 12px}
.dbtn:hover{border-color:var(--st-mute)}
.seg button[aria-pressed=true],.dbtn[aria-pressed=true]{background:var(--st-on);color:var(--st-on-ink)}
.seg button:disabled{opacity:.4;cursor:default}
.dlab{display:flex;align-items:center;gap:6px;font-size:15px;color:var(--st-mute)}
.dock select{width:auto;background:var(--st-btn);color:var(--st-ink);border:1px solid var(--st-rule);border-radius:4px;padding:5px 8px}
#scrub{flex:1;min-width:140px;max-width:420px;accent-color:var(--st-on)}
.dhint{margin:0;text-align:center;font-size:15px;color:var(--st-mute);min-height:1.4em}

/* panel */
.panel{background:var(--panel);border-left:1px solid var(--rule);padding:22px 22px 44px;min-width:0;overflow:auto;height:100%}
h1{font:700 32px/1.05 var(--f-serif);margin:0 0 6px;letter-spacing:-.01em}
.sub{margin:0 0 20px;color:var(--mute);font-size:16px}
details{border-top:1px solid var(--rule);padding:14px 0}
summary{font:400 23px/1.1 var(--f-cond);cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";color:var(--mute);font-size:22px}
details[open]>summary::after{content:"–"}
details[open]>summary{margin-bottom:12px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.field{display:flex;flex-direction:column;gap:4px;min-width:0}
.field>span,.lab{color:var(--mute);font-size:14px}
.mt{margin-top:14px}
.check{display:flex;align-items:center;gap:8px;cursor:pointer}
.check input{accent-color:var(--accent);width:16px;height:16px;margin:0}
input[type=number],input[type=text],select,textarea{width:100%;font:inherit;color:var(--ink);background:var(--field);border:1px solid var(--rule);border-radius:4px;padding:6px 8px;min-width:0}
input[type=number],input[type=text]{font:400 14px var(--f-serif)}
textarea{resize:vertical;min-height:52px;font:400 14px var(--f-serif)}
input[type=range]{width:100%;accent-color:var(--accent);margin:4px 0}
input[type=color]{cursor:pointer}
button{font:700 12px var(--f-bold);letter-spacing:.01em;color:var(--ink);background:var(--field);border:1px solid var(--rule);border-radius:4px;padding:7px 11px;cursor:pointer}
button:hover{border-color:var(--mute)}
button.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.inline{display:flex;gap:8px;margin-top:6px}
.inline select{flex:1}
.chips{display:flex;gap:8px;margin:6px 0 0}
.chip{width:28px;height:28px;border-radius:50%;padding:0;border:2px solid transparent;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
.chip[aria-pressed=true]{border-color:var(--ink);outline:2px solid var(--panel);outline-offset:-4px}
.shapes{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
.shp{width:40px;height:34px;padding:0;display:flex;align-items:center;justify-content:center}
.shp[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.irow{display:flex;flex-direction:column;margin-bottom:10px}
.irow b{font:700 13px var(--f-bold)}
.mute{color:var(--mute);font-size:14px}
output{color:var(--ink);font-family:var(--f-serif)}
.nrow{display:grid;grid-template-columns:24px 28px repeat(4,minmax(0,1fr)) 24px;gap:6px;align-items:center;margin-bottom:6px;padding:3px;border-radius:6px}
.nrow.sel{background:color-mix(in srgb,var(--accent) 18%,transparent)}
.nrow.head{color:var(--mute);font-size:14px;margin-bottom:2px;padding-top:0;padding-bottom:0}
.nrow input[type=number]{padding:4px 5px;font-size:13px}
.nrow input[type=color]{width:28px;height:28px;padding:0;border:none;border-radius:50%;background:none}
.nrow input[type=color]::-webkit-color-swatch-wrapper{padding:0}
.nrow input[type=color]::-webkit-color-swatch{border:1px solid rgba(0,0,0,.3);border-radius:50%}
.nrow input[type=color]::-moz-color-swatch{border:1px solid rgba(0,0,0,.3);border-radius:50%}
.idx,.del{padding:0;height:24px;width:24px;font-size:11px;border-radius:50%}
.idx{color:var(--mute)}
.del{border-color:transparent;background:transparent;color:var(--mute);font-size:15px}
.del:hover{color:var(--ink)}
.hint{color:var(--mute);font-size:14px;margin:8px 0 0}
.tabs{display:flex;gap:0;margin:0 -22px 6px;padding:0 14px;border-bottom:1px solid var(--rule);position:sticky;top:0;background:var(--panel);z-index:6}
.tabs button{border:0;border-bottom:2px solid transparent;border-radius:0;background:none;padding:11px 10px 9px;font-size:12px;color:var(--mute)}
.tabs button:hover{color:var(--ink)}
.tabs button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--accent)}
.bitem{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;text-align:left;margin-bottom:5px;font:400 15px var(--f-cond);letter-spacing:.01em}
.bitem i{font:400 12px var(--f-cond);color:var(--mute);font-style:normal}
.bitem.sel{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,var(--field))}
.stoprow{display:grid;grid-template-columns:34px 1fr 28px;gap:8px;align-items:center;margin-bottom:6px}
.stoprow input[type=color]{width:34px;height:30px;padding:0;border:1px solid var(--rule);border-radius:4px;background:none}
.subcheck{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0 4px}
.overlay{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.78);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px}
.overlay[hidden]{display:none}
.overlay img{max-width:min(92vw,720px);max-height:78vh;border-radius:6px}
.overlay textarea{width:min(92vw,720px);height:50vh}
.overlay p{color:#ddd;margin:0;text-align:center}

@container (max-width:860px){
  .app{grid-template-columns:1fr;grid-template-rows:minmax(300px,62%) minmax(0,1fr)}
  .stage{height:100%}
  .panel{border-left:none;border-top:1px solid var(--rule)}
}
/* ui modes: full = canvas + dock + panel, dock = canvas + dock, none = canvas only (the host platform supplies the controls) */
.root[data-ui="none"] .panel,.root[data-ui="none"] .dock,.root[data-ui="dock"] .panel{display:none}
.root[data-ui="none"] .app,.root[data-ui="dock"] .app{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr)}`;
const TEMPLATE = `<div class="root" data-ui="full">
<div class="app">
  <div class="stage" id="stage">
    <svg id="svg" role="img" aria-label="Node and path visualization on a grid"></svg>
    <div class="tip" id="tip" hidden></div>
    <div class="cap" id="cap" hidden><h2 id="capT"></h2><p id="capS"></p><div class="legend" id="capL"></div></div>
    <div class="dock" id="dock">
      <div class="dock-row">
        <div class="seg" role="group" aria-label="Tool">
          <button type="button" data-tool="move" aria-pressed="true">Move</button>
          <button type="button" data-tool="add" aria-pressed="false">Point</button>
          <button type="button" data-tool="draw" aria-pressed="false">Draw</button>
          <button type="button" data-tool="link" aria-pressed="false">Link</button>
          <button type="button" data-tool="delete" aria-pressed="false">Delete</button>
        </div>
        <div class="seg">
          <button type="button" id="undo" disabled>Undo</button>
          <button type="button" id="redo" disabled>Redo</button>
        </div>
      </div>
      <div class="dock-row">
        <label class="dlab">Step
          <select id="snap" aria-label="Grid snapping step">
            <option value="1">grid</option>
            <option value="0.5">half</option>
            <option value="0.25">quarter</option>
            <option value="0">free</option>
          </select>
        </label>
        <button type="button" id="tChain" class="dbtn" aria-pressed="true" title="A new point attaches to the selected one, forming a chain">Chain</button>
        <button type="button" id="tBranch" class="dbtn" aria-pressed="false" title="Drag a node together with its whole branch (or hold Shift)">Move branch</button>
      </div>
      <div class="dock-row">
        <button type="button" id="play" class="dbtn">Pause</button>
        <input id="scrub" type="range" min="0" max="1000" value="0" aria-label="Animation position">
      </div>
      <p id="hint" class="dhint" aria-live="polite"></p>
    </div>
  </div>

  <aside class="panel">
    <h1>Nodes &amp; Paths</h1>
    <p class="sub">Every node is a data point: position, value, colour, shape. Lines show what connects to what.</p>
    <nav class="tabs" role="tablist" aria-label="Panel sections">
      <button type="button" data-tabbtn="graph" aria-selected="true">Graph</button>
      <button type="button" data-tabbtn="look" aria-selected="false">Look</button>
      <button type="button" data-tabbtn="poster" aria-selected="false">Poster</button>
      <button type="button" data-tabbtn="motion" aria-selected="false">Motion</button>
      <button type="button" data-tabbtn="export" aria-selected="false">Export</button>
    </nav>

    <details open data-tab="look">
      <summary>Style</summary>
      <div class="lab">Presets</div>
      <div class="btns">
        <button type="button" data-look="dots">Dots</button>
        <button type="button" data-look="squares">Squares</button>
        <button type="button" data-look="geo">Geometry</button>
        <button type="button" data-look="outline">Outlines</button>
        <button type="button" data-look="waves">Waves</button>
        <button type="button" data-look="dashed">Dashed</button>
        <button type="button" data-look="leaves">Leaves</button>
      </div>
      <div class="lab mt">Palette colours (change any to recolour matching nodes)</div>
      <div class="chips" id="palEd"></div>
      <div class="grid2 mt">
        <label class="field"><span>Palette</span>
          <select id="theme"><option value="autumn">Autumn</option><option value="poster">Poster</option><option value="night">Night sky</option><option value="sunset">Sunset post</option><option value="dusk">Dusk post</option></select>
        </label>
        <label class="field"><span>Node shapes</span>
          <select id="shapeMode">
            <option value="mixed">Per node (mixed)</option>
            <optgroup label="One shape for all">
              <option value="circle">Circles only</option>
              <option value="square">Squares only</option>
              <option value="ring">Rings only</option>
              <option value="triangle">Triangles only</option>
              <option value="diamond">Diamonds only</option>
              <option value="hexagon">Hexagons only</option>
              <option value="star">Stars only</option>
              <option value="cross">Crosses only</option>
              <option value="half">Half-circles only</option>
              <option value="leaf">Leaves only</option>
              <option value="bird">Birds only</option>
            </optgroup>
            <optgroup label="By rule">
              <option value="depth">Varies by depth</option>
              <option value="value">Varies by value</option>
            </optgroup>
          </select>
        </label>
        <label class="field"><span>Fill</span>
          <select id="fillMode"><option value="solid">Solid</option><option value="outline">Outline only</option><option value="duo">Translucent</option><option value="gradient">Gradient</option></select>
        </label>
        <label class="field"><span>Gradient end colour</span><input id="gradEnd" type="color" value="#ffffff" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"></label>
        <label class="field"><span>Gradient angle</span><input id="gradAngle" type="range" min="0" max="360" step="5" value="180"></label>
        <label class="field"><span>Lines</span>
          <select id="edge">
            <option value="curve">Smooth</option>
            <option value="straight">Straight</option>
            <option value="step">Stepped</option>
            <option value="wave">Wavy</option>
            <option value="zigzag">Zigzag</option>
            <option value="arc">Arcs</option>
          </select>
        </label>
        <label class="field"><span>Stroke</span>
          <select id="dash"><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="even">Even dashes</option><option value="dotted">Dotted</option></select>
        </label>
        <label class="field"><span>Line colour</span>
          <select id="lineColor"><option value="theme">Theme</option><option value="node">Follow nodes</option><option value="custom">Custom colour</option></select>
        </label>
        <label class="field"><span>Custom line colour</span><input id="lineHex" type="color" value="#383838" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"></label>
        <label class="check"><input id="arrows" type="checkbox"> Arrowheads on lines</label>
        <label class="field"><span>Arrow size</span><input id="arrowSize" type="range" min="0.5" max="3" step="0.1" value="1"></label>
        <label class="field"><span>Line width</span><input id="lw" type="range" min="1" max="8" step="0.5" value="3"></label>
        <label class="field"><span>Wave and zigzag amplitude</span><input id="amp" type="range" min="0.05" max="0.45" step="0.01" value="0.16"></label>
      </div>
    </details>

    <details open data-tab="motion">
      <summary>Animation</summary>
      <div class="grid2">
        <label class="field"><span>Type</span>
          <select id="anim">
            <option value="draw">Draw path</option>
            <option value="pulse">Pulse</option>
            <option value="drift">Drift and flowing waves</option>
            <option value="fall">Leaf fall</option>
            <option value="none">None</option>
          </select>
        </label>
        <label class="field"><span>Speed</span><input id="speed" type="range" min="0.25" max="3" step="0.05" value="1"></label>
      </div>
      <div class="btns">
        <button id="replay" class="primary" type="button">Replay</button>
        <label class="check"><input id="loop" type="checkbox" checked> Loop</label>
        <label class="check"><input id="pAnim" type="checkbox" checked> Animate poster text</label>
      </div>
    </details>

    <details open data-tab="look">
      <summary>Canvas</summary>
      <div class="grid2">
        <label class="field"><span>Grid</span>
          <select id="gridMode"><option value="dots">Dots</option><option value="lines">Lines</option><option value="none">None</option></select>
        </label>
        <div></div>
        <label class="field"><span>Layout columns</span><input id="cols" type="number" min="3" max="12" value="9"></label>
        <label class="field"><span>Layout rows</span><input id="rows" type="number" min="3" max="12" value="6"></label>
        <label class="field" style="grid-column:1/-1"><span>Caption title</span><input id="capTin" type="text" maxlength="40" placeholder="e.g. Autumn 2026"></label>
        <label class="field" style="grid-column:1/-1"><span>Caption text</span><input id="capSin" type="text" maxlength="120" placeholder="What does the data mean?"></label>
        <label class="field"><span>Value unit</span><input id="unit" type="text" maxlength="6" placeholder="e.g. °"></label>
        <label class="field"><span>Label colour</span><div style="display:flex;gap:6px"><input id="labelColor" type="color" value="#212121" style="flex:1;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"><button type="button" id="labelColorAuto">Auto</button></div></label>
        <label class="field"><span>Canvas background</span><div style="display:flex;gap:6px"><input id="stageBg" type="color" value="#1f1d1c" style="flex:1;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"><button type="button" id="stageBgAuto">Auto</button></div></label>
        <label class="field"><span>Label position</span>
          <select id="labelPos"><option value="br">Below right</option><option value="r">Right</option><option value="b">Below</option><option value="t">Above</option><option value="c">Inside the node</option></select>
        </label>
        <label class="field"><span>New node size</span><input id="newSize" type="range" min="0.2" max="1.6" step="0.05" value="1"></label>
        <label class="field"><span>Label size</span><input id="lblSize" type="range" min="0.6" max="2.4" step="0.1" value="1"></label>
        <label class="check"><input id="capOn" type="checkbox" checked> Show caption</label>
        <label class="check"><input id="line" type="checkbox" checked> Lines</label>
        <label class="check"><input id="lineOver" type="checkbox"> Lines above nodes</label>
        <label class="check"><input id="labels" type="checkbox" checked> Labels</label>
        <label class="check"><input id="size" type="checkbox"> Size by value</label>
        <label class="check"><input id="focus" type="checkbox" checked> Highlight branch</label>
      </div>
      <p class="hint">The grid fills the whole canvas. Layout columns and rows set the area used by auto layouts, the generator and number series.</p>
    </details>

    <details open data-tab="poster">
      <summary>Text</summary>
      <div id="blockList"></div>
      <div class="btns">
        <button type="button" id="bAdd" class="primary">Add text</button>
        <button type="button" id="bDup">Duplicate</button>
        <button type="button" id="bDel">Delete</button>
      </div>
      <p class="hint">Click a text on the poster to select it and drag it; double-click to edit the words. Or pick it in this list and type exact X and Y below. Use the arrow keys for 1 px steps (Shift = 10 px).</p>
    </details>

    <details open data-tab="poster">
      <summary>Selected text</summary>
      <div id="binsp"></div>
    </details>

    <details open data-tab="poster">
      <summary>Format and background</summary>
      <label class="field"><span>Format</span>
        <select id="frame">
          <option value="full">Full canvas (free workspace)</option>
          <option value="p45">Poster 4:5 · 1080 × 1350</option>
          <option value="p11">Square 1:1 · 1080 × 1080</option>
          <option value="p916">Story 9:16 · 1080 × 1920</option>
          <option value="p169">Wide 16:9 · 1920 × 1080</option>
        </select>
      </label>
      <p class="hint">Text blocks, background and export of a fixed artboard work in the poster formats.</p>
      <div class="btns"><button type="button" id="bBlank">Start a blank poster</button></div>
      <div class="grid2 mt">
        <label class="field"><span>Background</span>
          <select id="bgType"><option value="gradient">Gradient</option><option value="solid">Solid colour</option><option value="none">None</option></select>
        </label>
        <label class="field"><span>Gradient angle: <output id="bgAngleOut">180</output>°</span><input id="bgAngle" type="range" min="0" max="360" step="5" value="180"></label>
      </div>
      <div class="lab mt">Colour stops</div>
      <div id="bgStops"></div>
      <div class="btns"><button type="button" id="bgAdd">Add colour stop</button></div>
      <div class="lab mt">Background presets</div>
      <div class="btns">
        <button type="button" data-bgp="sunset">Sunset</button>
        <button type="button" data-bgp="sky">Sky</button>
        <button type="button" data-bgp="night">Night</button>
        <button type="button" data-bgp="paper">Paper</button>
        <button type="button" data-bgp="mint">Mint</button>
        <button type="button" data-bgp="mono">Grey</button>
      </div>
      <div class="lab mt">Poster grid (shape is chosen in Look → Canvas)</div>
      <div class="grid2">
        <label class="field"><span>Grid colour</span><input id="pgColor" type="color" value="#9a9a9a" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"></label>
        <label class="field"><span>Line thickness</span><input id="pgW" type="range" min="0.5" max="8" step="0.5" value="2"></label>
        <label class="field"><span>Cell size, px</span><input id="pgSize" type="number" min="20" max="400" step="1" value="108"></label>
      </div>
    </details>

    <details open data-tab="export">
      <summary>Save and export</summary>
      <div class="grid2">
        <label class="field"><span>PNG size</span>
          <select id="exScale"><option value="1">1× (artboard pixels)</option><option value="2" selected>2× (sharper)</option></select>
        </label>
        <div></div>
      </div>
      <div class="btns">
        <button type="button" id="exPng" class="primary">Save PNG</button>
        <button type="button" id="exSvg">Save SVG</button>
      </div>
      <p class="hint">PNG keeps your fonts. SVG keeps text editable but needs the fonts installed where you open it.</p>
      <div class="lab mt">Project</div>
      <div class="btns">
        <button type="button" id="exJson">Save project (.json)</button>
        <button type="button" id="exLoad">Open project…</button>
        <button type="button" id="exPaste">Paste project</button>
        <button type="button" id="exReset">Reset to example</button>
      </div>
      <input id="exFile" type="file" accept=".json,application/json" hidden>
      <p class="hint" id="exMsg" aria-live="polite">Your work is also saved in this browser automatically.</p>
    </details>

    <details open data-tab="graph">
      <summary>Selected node</summary>
      <div id="insp"></div>
    </details>

    <details open data-tab="graph">
      <summary>Nodes</summary>
      <div class="lab">Colour for new and selected nodes</div>
      <div class="chips" id="chips"></div>
      <div class="nrow head mt"><span></span><span></span><span>x</span><span>y</span><span>val.</span><span>link</span><span></span></div>
      <div id="list"></div>
      <div class="btns"><button id="add" type="button">Add node</button></div>
      <p class="hint">“Link” is the number of the node this one attaches to; empty means the start of a branch. Coordinates can be typed by hand, fractions included.</p>
    </details>

    <details open data-tab="graph">
      <summary>Composition</summary>
      <div class="lab">Auto layout</div>
      <div class="btns">
        <button type="button" data-layout="tree">Tree</button>
        <button type="button" data-layout="radial">Radial</button>
        <button type="button" data-layout="value">By value</button>
        <button type="button" data-layout="spiral">Spiral</button>
      </div>
      <div class="lab mt">Transform</div>
      <div class="btns">
        <button type="button" id="jitter">Jitter</button>
        <button type="button" id="flipH">Mirror horizontal</button>
        <button type="button" id="flipV">Mirror vertical</button>
      </div>
      <div class="lab mt">Colour by</div>
      <div class="inline">
        <select id="recolorMode" aria-label="Colouring rule">
          <option value="value">value</option>
          <option value="depth">tree depth</option>
          <option value="branch">branch</option>
        </select>
        <button type="button" id="recolor">Apply</button>
      </div>
      <div class="lab mt">Generator</div>
      <div class="grid2">
        <label class="field"><span>Seed</span><input id="seed" type="number" min="1" max="99999" value="7"></label>
        <label class="field"><span>Nodes: <output id="countOut">14</output></span><input id="count" type="range" min="5" max="40" value="14"></label>
        <label class="field"><span>Branching</span><input id="branchy" type="range" min="0" max="1" step="0.05" value="0.55"></label>
        <div></div>
      </div>
      <div class="btns">
        <button type="button" id="gen" class="primary">Generate</button>
        <button type="button" id="newSeed">New seed</button>
        <button type="button" id="clearAll">Clear canvas</button>
      </div>
    </details>

    <details data-tab="graph">
      <summary>Data</summary>
      <label class="field"><span>Number series (comma-separated) → nodes by height</span>
        <textarea id="series" rows="2">4, 9, 6, 14, 11, 17, 8, 12</textarea>
      </label>
      <div class="btns">
        <button id="build" type="button">Build series</button>
      </div>
      <div class="lab mt">Ready-made compositions</div>
      <div class="btns">
        <button id="pPoster" type="button">Bird migration poster</button>
        <button id="pPosterV1" type="button">Poster v1 (grid)</button>
        <button id="pAutumn" type="button">Autumn tree</button>
        <button id="pMigr" type="button">Eagle routes</button>
        <button id="pConst" type="button">Constellation</button>
        <button id="pRef" type="button">Classic tree</button>
      </div>
    </details>

  </aside>
</div>

<div class="overlay" id="overlay" hidden role="dialog" aria-modal="true" aria-label="Export preview">
  <p id="ovMsg"></p>
  <div id="ovBody"></div>
  <button type="button" id="ovClose" class="primary">Close</button>
</div>

</div>`;

function ensureFonts(){
  if(typeof document==='undefined'||document.querySelector('link[data-np-fonts]')) return;
  const l=document.createElement('link'); l.rel='stylesheet'; l.href=FONT_URL; l.setAttribute('data-np-fonts','1');
  document.head.appendChild(l);
}

export const version='1.0.0';

export function mount(container, options = {}) {
  const opts=Object.assign({ui:'full',theme:'auto',preset:'poster',autosave:false,storageKey:'nodes-paths-project-v1',loadFonts:true,onDownload:null,onChange:null,onReady:null,fontCss:''},options);
  if(opts.ui===false) opts.ui='none'; else if(opts.ui===true) opts.ui='full';
  if(opts.persist===true) opts.autosave=true; else if(opts.persist===false) opts.autosave=false;
  if(!container) throw new Error('mount(container): container element is required');
  if(opts.loadFonts) ensureFonts();
  let alive=true; const cleanups=[]; const listeners={};
  function emit(type,data){ (listeners[type]||[]).slice().forEach(f=>{ try{ f(data); }catch(_){} }); }
  const host=document.createElement('div'); host.style.cssText='display:block;width:100%;height:100%';
  if(opts.theme==='light'||opts.theme==='dark') host.setAttribute('data-theme',opts.theme);
  const root=host.attachShadow({mode:'open'});
  const styleEl=document.createElement('style'); styleEl.textContent=CSS; root.appendChild(styleEl);
  const holder=document.createElement('div'); holder.innerHTML=TEMPLATE;
  while(holder.firstChild) root.appendChild(holder.firstChild);
  container.appendChild(host);
  const rootEl=root.querySelector('.root'); rootEl.dataset.ui=opts.ui;
  let CELL = 50;
  /* deep palette taken from the poster references */
  const THEMES = {
    poster:{pal:['#e2512b','#2f6bc2','#eba7b8','#dbe055','#8a6be8','#efe6d2'],line:'#dbe055',gridLine:'#5b4638',gridDot:'#76604f',ring:'#efe6d2',bg:'#33231a',label:'#eba7b8',btn:'#46332a',rule:'#6a5143',on:'#dbe055',ramp:[1,4,2,0,3]},
    autumn:{pal:['#d9632b','#e3a82b','#a8322e','#6f8a3d','#84507a','#f0e4c8'],line:'#d6ad74',gridLine:'#4a3225',gridDot:'#6e4f3a',ring:'#f0e4c8',bg:'#2a1a12',label:'#e8c48a',btn:'#42291d',rule:'#6b4a37',on:'#e3a82b',ramp:[4,2,0,1,3]},
    night:{pal:['#7fe063','#a290f2','#7a35e8','#c9785f','#f08f8b','#f2cf4a'],line:'#9fb4d0',gridLine:'#24344a',gridDot:'#3a4e69',ring:'#e6f0ff',bg:'#14202f',label:'#cfe0f5',btn:'#213249',rule:'#3a4f6b',on:'#7fe063',ink:'#e6f0ff',mute:'#8fa3bf',ramp:[1,2,4,5,0]},
    sunset:{pal:['#ebea4e','#212121','#ff8f44','#94b3c3','#df291c','#f3f14d'],line:'#383838',gridLine:'#9a9a9a',gridDot:'#9a9a9a',ring:'#212121',bg:'#1f1d1c',label:'#212121',btn:'#2e2c2b',rule:'#4a4745',on:'#f3f14d',ink:'#f0eeea',mute:'#a09b95',ramp:[3,2,0,4,1],
      art:{ink:'#212121',tag:'#f3f14d',stops:[[0,'#ff8f44'],[.17788,'#94b3c3'],[.74225,'#94b3c3'],[1,'#ff8f44']],gx:105.4,gy:23.27,gw:108.69,gh:108.61,gridW:3.14}},
    dusk:{pal:['#704417','#383838','#ebea4e','#94b3c3','#e99760','#f3f14d'],line:'#383838',gridLine:'#9a9a9a',gridDot:'#9a9a9a',ring:'#212121',bg:'#1f1d1c',label:'#212121',btn:'#2e2c2b',rule:'#4a4745',on:'#f3f14d',ink:'#f0eeea',mute:'#a09b95',ramp:[3,4,2,0,1],
      art:{ink:'#212121',tag:'#f3f14d',stops:[[0,'#ff8f44'],[.17788,'#94b3c3'],[.74225,'#94b3c3'],[1,'#ff8f44']],gx:105.4,gy:23.27,gw:108.69,gh:108.61,gridW:3.14}}
  };
  let PAL=THEMES.autumn.pal, LINE=THEMES.autumn.line, GRID_LINE=THEMES.autumn.gridLine, GRID_DOT=THEMES.autumn.gridDot, RING=THEMES.autumn.ring;
  const SHAPES = ['circle','square','ring','half','leaf','bird','triangle','diamond','hexagon','star','cross','none'];
  const SHAPE_NAMES = {circle:'Circle',square:'Square',ring:'Ring',half:'Half-circle',leaf:'Leaf',bird:'Bird',triangle:'Triangle',diamond:'Diamond',hexagon:'Hexagon',star:'Star',cross:'Cross',none:'Joint (hidden)'};
  const GEO_DEPTH = ['circle','triangle','square','diamond','hexagon','star'];
  const GEO_VALUE = ['circle','square','diamond','triangle','star'];
  const $ = id => root.getElementById(id);
  const svg=$('svg'), list=$('list'), tip=$('tip'), stage=$('stage'), hintEl=$('hint'), insp=$('insp'), scrub=$('scrub'), dock=$('dock');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function defBg(){ return {type:'gradient',angle:180,stops:[{p:0,c:'#ff8f44'},{p:.17788,c:'#94b3c3'},{p:.74225,c:'#94b3c3'},{p:1,c:'#ff8f44'}]}; }
  function defPgrid(){ return {cw:108.65,ch:108.65,ox:0,oy:0,w:2,color:'#9a9a9a'}; }
  const S = {
    cols:9, rows:6, gridMode:'dots', edge:'curve', dash:'solid', waveAmp:.16, lineOver:false, line:true, labels:true, sizeByValue:false,
    shapeMode:'mixed', fillMode:'solid', snap:1, chain:true,
    lineW:3, anim: reduce?'none':'draw', speed:1, loop:true, paused:false, focus:true,
    tool:'move', branchDrag:false, nodes:[], sel:null, hover:null, brush:PAL[0], nextId:1,
    frame:'full', artW:1080, artH:1350, bg:defBg(), pgrid:defPgrid(), blocks:[], selBlock:null, nextBlock:1, bdrag:null, newSize:1, lineHex:'#383838', arrows:false, arrowSize:1, labelPos:'br', gradEnd:'#ffffff', gradAngle:180, labelColor:null, stageBg:null, gridCol:null, animText:true, theme:'autumn', unit:'', lineColor:'theme', lblScale:1, legend:[], legendT:'', capOn:true, capT:'', capS:'', seed:7, count:14, branchy:.55, bounds:null, px:{w:0,h:0,dock:0}, drag:null, link:null, paint:null, ghost:null, prog:0, tl:10, dt:.016
  };
  let animT = 0, last = performance.now(), scrubbing = false;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const f2=v=>Math.round(v*100)/100;
  const esc=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const hsh=id=>((id*2654435761)>>>0)%100;
  const sm=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
  const byId=id=>S.nodes.find(n=>n.id===id)||null;
  const idxOf=n=>S.nodes.indexOf(n)+1;
  const scrubbable=()=>S.anim==='draw'||S.anim==='fall';
  const snapV=v=>S.snap>0?f2(Math.round(v/S.snap)*S.snap):f2(v);
  const bnd=()=>S.bounds||{x0:-2,x1:S.cols+2,y0:-2,y1:S.rows+2};

  function mk(x,y,v,color,p,shape,size,from){
    const n={id:S.nextId++,x:x,y:y,dx:from?from.dx:x,dy:from?from.dy:y,px:x,py:y,v:v,color:color,p:p||null,shape:shape||'circle',size:size||1,a:1,name:'',fl:0};
    S.nodes.push(n); return n;
  }
  function rng(seed){
    let a=seed>>>0;
    return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
  }

  /* ---------- history ---------- */
  let hist=[], hi=-1;
  function snapshot(){
    return JSON.stringify({n:S.nodes.map(n=>({id:n.id,x:n.x,y:n.y,v:n.v,color:n.color,p:n.p,shape:n.shape,size:n.size,name:n.name})),nid:S.nextId,c:S.cols,r:S.rows,t:S.theme,f:S.frame,aw:S.artW,ah:S.artH,bg:S.bg,pg:S.pgrid,b:S.blocks});
  }
  function updateUR(){ $('undo').disabled = hi<=0; $('redo').disabled = hi>=hist.length-1; }
  function commit(){
    const s=snapshot();
    if (hist[hi]===s){ updateUR(); return; }
    hist=hist.slice(0,hi+1); hist.push(s);
    if (hist.length>80) hist.shift();
    hi=hist.length-1; updateUR();
    emit('change',{source:'edit'});
  }
  function restore(s){
    const o=JSON.parse(s), old={};
    S.nodes.forEach(n=>{old[n.id]=n;});
    S.nodes=o.n.map(d=>{
      const q=old[d.id];
      d.dx=q?q.dx:d.x; d.dy=q?q.dy:d.y; d.px=d.dx; d.py=d.dy; d.a=q?q.a:1; d.fl=0; d.name=d.name||'';
      return d;
    });
    S.nextId=o.nid; S.cols=o.c; S.rows=o.r; if(o.t&&o.t!==S.theme) applyTheme(o.t,false);
    if(o.f&&o.f!==S.frame){ S.frame=o.f; syncFrame(); }
    if(o.aw){ S.artW=o.aw; S.artH=o.ah; }
    if(o.bg) S.bg=o.bg;
    if(o.pg) S.pgrid=o.pg;
    if(o.b){ S.blocks=o.b; S.nextBlock=S.blocks.reduce((m,b)=>Math.max(m,b.id+1),1); if(S.selBlock&&!byBlock(S.selBlock)) S.selBlock=null; }
    if (S.sel && !byId(S.sel)) S.sel=null;
    if (S.hover && !byId(S.hover)) S.hover=null;
    syncSettings(); buildList(); renderInspector();
  }
  function undo(){ if(hi>0){hi--;restore(hist[hi]);updateUR();} }
  function redo(){ if(hi<hist.length-1){hi++;restore(hist[hi]);updateUR();} }

  /* ---------- presets & looks ---------- */
  function hexA(h,a){ const n=parseInt(h.slice(1),16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
  function applyStage(){ const T=THEMES[S.theme], sb=S.stageBg||T.bg, st=host.style; st.setProperty('--st-bg',sb); st.setProperty('--st-clear',hexA(sb,0)); }
  function applyTheme(name,remap){
    const T=THEMES[name]; if(!T) return;
    const old=PAL;
    PAL=T.pal; LINE=T.line; GRID_LINE=T.gridLine; GRID_DOT=T.gridDot; RING=T.ring; S.theme=name;
    const st=host.style;
    applyStage(); st.setProperty('--st-label',T.label);
    st.setProperty('--st-ink',T.ink||'#efe6d2'); st.setProperty('--st-mute',T.mute||'#b9a58f'); st.setProperty('--st-btn',T.btn); st.setProperty('--st-rule',T.rule); st.setProperty('--st-on',T.on);
    if(remap){
      S.nodes.forEach(n=>{const i=old.indexOf(n.color); if(i>=0) n.color=PAL[i];});
      const bi=old.indexOf(S.brush); S.brush=PAL[bi>=0?bi:0];
    } else S.brush=PAL[0];
    buildChips();
    $('theme').value=name;
    buildList();
    syncCaption();
  }
  function syncCaption(){
    $('cap').hidden=S.frame==='post'||!(S.capOn&&(S.capT||S.capS||S.legend.length));
    $('capT').textContent=S.capT; $('capS').textContent=S.capS;
    $('capL').innerHTML=S.legend.length?(S.legendT?'<b>'+esc(S.legendT)+'</b>':'')+S.legend.map(l=>'<span><i style="background:'+PAL[l.c]+'"></i>'+esc(l.t)+'</span>').join(''):'';
  }
  // [x, y, value, colourIndex, parentIndex(1-based), shape, name]
  const CONST = [
    [0,3,21,5,0,'circle'],[2,3,8,1,1,'square'],[3,2,14,0,2,'circle'],[3,4,5,3,2,'half'],
    [5,2,11,2,3,'ring'],[4,0,17,1,3,'circle'],[6,0,9,0,6,'square'],[6,4,12,2,4,'circle'],
    [7,3,null,3,8,'ring'],[9,2,19,4,9,'circle'],[7,1,6,3,5,'circle'],[8,5,3,1,8,'half'],
    [1,5,7,0,1,'ring'],[2,1,10,2,2,'square']
  ];
  const REF = [
    [2,0,11,0,0],[2,2,9,2,1],[3,2,14,2,2],[5,1,null,3,3],[6,2,3,2,4],[8,1,null,3,5],
    [1,3,null,3,2],[2,4,13,1,7],[3,4,null,1,8],[4,4,15,0,9],[2,5,null,4,8],[3,6,7,0,11],
    [2,7,17,3,12],[4,6,2,3,12],[5,5,4,0,14],[7,5,16,1,15],[6,7,8,5,15]
  ];
  const LOOKS = {
    dots:    {shapeMode:'circle',  fillMode:'solid',   edge:'curve',    dash:'solid',  lineW:3,   gridMode:'dots',  lineOver:false},
    squares: {shapeMode:'square',  fillMode:'solid',   edge:'step',     dash:'solid',  lineW:3,   gridMode:'lines', lineOver:false},
    geo:     {shapeMode:'depth',   fillMode:'solid',   edge:'straight', dash:'solid',  lineW:2.5, gridMode:'dots',  lineOver:true},
    outline: {shapeMode:'mixed',   fillMode:'outline', edge:'arc',      dash:'solid',  lineW:2,   gridMode:'none',  lineOver:false},
    waves:   {shapeMode:'circle',  fillMode:'duo',     edge:'wave',     dash:'solid',  lineW:2.5, gridMode:'none',  lineOver:false, waveAmp:.2},
    dashed:  {shapeMode:'ring',    fillMode:'solid',   edge:'straight', dash:'dashed', lineW:2.5, gridMode:'lines', lineOver:false},
    leaves:  {shapeMode:'leaf',    fillMode:'solid',   edge:'curve',    dash:'solid',  lineW:2.5, gridMode:'dots',  lineOver:false, theme:'autumn'}
  };
  function applyLook(name){
    const L=Object.assign({},LOOKS[name]), th=L.theme; delete L.theme;
    Object.assign(S,L);
    if(th&&th!==S.theme) applyTheme(th,true);
    syncSettings(); renderInspector();
  }
  function loadList(rows,cols,rws,view){
    S.nodes=[]; S.nextId=1; S.sel=null; S.hover=null; S.cols=cols; S.rows=rws;
    S.lineColor='theme'; S.lblScale=1; S.legend=[]; S.legendT=''; S.frame='full'; S.snap=1;
    S.artW=1080; S.artH=1350; S.bg=defBg(); S.pgrid=defPgrid(); S.blocks=[]; S.selBlock=null; S.newSize=1; S.arrows=false; S.arrowSize=1; S.labelPos='br'; S.lineHex='#383838'; S.gradEnd='#ffffff'; S.gradAngle=180; S.labelColor=null; S.stageBg=null; S.gridCol=null;
    const v=Object.assign({},view), th=v.theme, bl=v.blocks; delete v.theme; delete v.blocks;
    Object.assign(S,v); syncFrame();
    S.bg=JSON.parse(JSON.stringify(S.bg)); S.pgrid=Object.assign({},S.pgrid);
    if(bl) bl.forEach(q=>mkBlock(JSON.parse(JSON.stringify(q))));
    if(th) applyTheme(th,false);
    rows.forEach(r=>{ const n=mk(r[0],r[1],r[2],PAL[r[3]],r[4]||null,r[5]||'circle',r[7]||1); if(r[6]) n.name=r[6]; });
    afterLoad();
  }
  function loadConst(){ loadList(CONST,9,6,{theme:'poster',gridMode:'dots',edge:'curve',dash:'solid',lineOver:false,lineW:3,shapeMode:'mixed',fillMode:'solid',unit:'',capOn:true,capT:'Constellation',capS:'Fourteen points drifting across a grid.'}); }
  function loadRef(){ loadList(REF,7,7,{theme:'poster',gridMode:'lines',edge:'straight',dash:'solid',lineOver:true,lineW:3,shapeMode:'mixed',fillMode:'solid',unit:'',capOn:true,capT:'Classic tree',capS:'A branching path on a square grid.'}); }
  const AUTUMN = [
    [0,1,17,3,0,'leaf','Equinox'],[2,1,15,3,1,'leaf'],[3,2,13,1,2,'leaf'],[5,2,12,1,3,'leaf','Leaf peak'],
    [6,3,9,0,4,'leaf'],[8,3,8,0,5,'leaf','Clocks back'],[9,4,5,2,6,'leaf'],[11,4,3,4,7,'leaf'],
    [3,0,18,3,2,'leaf','Warm spell'],[5,4,10,0,3,'leaf','Rain'],[6,5,7,2,10,'leaf','Fog'],[8,5,4,2,11,'leaf'],
    [9,6,1,4,12,'leaf','First frost'],[7,1,11,1,4,'leaf'],[9,2,9,0,14,'leaf']
  ];
  const MIGRATION = [
    {c:3,pts:[[8.45,0.5,"Breeding grounds",null,null,null],[8.45,1.5,null,null,null,null],[10.15,2.5,null,null,null,null],[11.0,3.5,null,null,null,null],[10.15,4.5,null,null,null,null],[10.57,5.5,null,null,null,null],[11.0,6.5,null,null,null,null],[12.7,7.5,"Black Sea",null,null,null],[13.55,8.5,null,null,null,null],[13.55,10,"Levant",1,null,null]]},
    {c:2,pts:[[9.72,3.5,null,null,null,null],[9.72,5,"Ukraine",null,null,null],[11.42,5.25,null,null,null,null],[10.15,6.5,null,null,null,null],[11.0,7,null,null,null,null],[11.85,7.5,null,null,null,null],[12.7,8.5,null,null,null,null],[13.55,9,null,null,null,null],[12.7,10.5,null,null,null,null],[11.85,11,null,null,null,null],[12.7,12,null,null,null,null],[12.7,13.5,null,null,null,null],[12.7,14,null,null,null,null],[12.7,15,"Sudan",1,12,null],[11.0,16,"South Sudan",1,12,null],[11.85,13,"Egypt",1,10,1]]},
    {c:4,pts:[[8.88,3.5,null,null,null,null],[8.88,4.75,null,null,null,null],[9.72,5.5,null,null,null,null],[9.3,6.5,null,null,null,null],[9.72,7.5,"Aegean",1,null,null]]},
    {c:5,pts:[[8.45,6,null,null,null,null],[7.6,6.75,null,null,null,null],[8.02,7.5,"Greece",1,null,null]]},
    {c:0,pts:[[9.3,1,null,null,null,null],[9.3,2.5,null,null,null,null],[6.75,3,null,null,null,null],[6.75,4.5,null,null,null,null],[4.2,5,null,null,null,null],[2.5,5.5,"Western Europe",1,null,null]]}
  ];
  // [id, centre x px, centre y px, parent id, shape]  (from the Figma frame 1080 x 1350)
  const POSTER_NODES = [
    [1,544,157,0],[2,545,235,1],[3,758,344,2],[4,686,457,3,'none'],[5,688,559,4],[6,867,672,5],[7,980,806,6],[8,980,889,7],
    [9,651,194,0],[10,648,297,9],[11,432,346,10],[12,432,455,11],[13,215,481,12],[14,106,554,13],
    [15,651,346,0],[16,651,476,15],[17,799,455,16],[18,762,559,17],[19,900,672,18],[20,980,672,19],[21,797,889,20],[22,867,969,21],[23,867,1208,22],[24,762,1105,22],
    [25,544,346,0],[26,544,452,25],[27,611,557,26],[28,566,664,27],[29,611,770,28],
    [30,541,558,0],[31,471,612,30],[32,487.5,672,31],
    [33,867,889,0]
  ];
  function loadPosterV(ver){
    const K=108.65, v2=ver===2;
    const rows=POSTER_NODES.map(q=>[+(q[1]/K).toFixed(4),+(q[2]/K).toFixed(4),null,0,q[3],q[4]||'circle','',q[4]==='none'?.3:.5524]);
    const ink='#212121', sans={font:'sans',fs:30,lh:.8,upper:true,color:ink};
    const lab=(t,x,y)=>Object.assign({},sans,{text:t,x:x,y:y,anim:'type',cps:24,sync:true});
    const rc={font:'cond',bold:true,fs:26.62,lh:1.172,ls:-1.06,upper:true,color:ink};
    const blocks=[
      v2?{role:'title',text:'Bird\nMigration\nMap',x:515.34,y:197,fs:382.011,font:'serif',color:'#e99760',align:'middle',ls:-34.38,ls2:-38.2,lh:.76,it:1,layer:'back',anim:'rise',delay:.45,stagger:.3,locked:false}
        :{role:'title',text:'Bird\nMigration\nMap',x:14,y:765,fs:185.565,font:'serif',color:ink,align:'start',ls:-16.7,ls2:-16.7,lh:.76,it:1,layer:'front',anim:'rise',delay:.45,stagger:.3,locked:false},
      Object.assign({},sans,{role:'subtitle',text:v2?'Greater spotted\neagles tracked by\nsatellite\ntransmitters':'Greater spotted eagles\ntracked by satellite\ntransmitters',x:v2?26:18,y:v2?870:81,anim:'wipe',delay:.1,cps:90}),
      Object.assign({},rc,{role:'footer',text:'This infographic tool can be used to visualize customer journeys,\ndependency or process trees, organizational structures, project maps, and\nroutes or logistics.',x:26,y:1234,anim:'wipe',delay:.8,cps:170}),
      lab('Breeding\nGrounds',648,101), lab('Greece',409,720), lab('Aegean Sea',595,812), lab('Ukraine',750,410),
      lab('Western\nEurope',v2?117:73,v2?398:422), lab('Black\nSea',907,574), lab('Middle\nEast',907,939),
      Object.assign({},rc,{role:'tag',text:'Data that exists',x:18,y:13,anim:'slide',delay:0,box:{fill:'#f3f14d',l:18,t:13,r:18,b:8.8,minW:434}})
    ];
    loadList(rows,1080/K,1350/K,{theme:v2?'dusk':'sunset',frame:'post',snap:0,gridMode:v2?'none':'lines',edge:'straight',dash:v2?'solid':'even',lineOver:true,lineW:v2?5:7,shapeMode:'mixed',fillMode:'solid',unit:'',
      capOn:false,anim:reduce?'none':'draw',newSize:.5524,
      pgrid:v2?defPgrid():{cw:108.69,ch:108.61,ox:105.4,oy:23.27,w:3.14,color:'#9a9a9a'},
      blocks:blocks});
  }
  function newBlank(){
    const K=108.65;
    loadList([],1080/K,1350/K,{theme:'dusk',frame:'post',snap:.5,gridMode:'lines',edge:'straight',dash:'solid',lineOver:false,lineW:4,arrows:true,shapeMode:'mixed',fillMode:'solid',unit:'',
      capOn:false,anim:'draw',newSize:.5524,
      bg:{type:'solid',angle:180,stops:[{p:0,c:'#efe8d5'}]},
      pgrid:{cw:108.65,ch:108.65,ox:0,oy:0,w:1.5,color:'#d9cfb4'},
      blocks:[
        {role:'title',text:'Your title',x:60,y:70,fs:110,font:'serif',lh:.95,anim:'rise',delay:.2,color:'#2b1d16'},
        {role:'subtitle',text:'Click any text to move it. Edit it in the Poster tab.',x:60,y:200,fs:30,font:'sans',lh:1.2,anim:'fade',delay:.5,color:'#6d5a48'}
      ]});
    setTab('graph'); flash('Pick the Point tool and click the poster to place your first node.');
  }
  function loadPoster(){ loadPosterV(2); }
  function loadPosterV1(){ loadPosterV(1); }
  function loadMigration(){
    const rows=[];
    MIGRATION.forEach(Rt=>{
      const base=rows.length;
      Rt.pts.forEach((q,i)=>{
        const from=q[4]!=null?q[4]:i-1;
        rows.push([q[0],q[1],null,q[5]!=null?q[5]:Rt.c,from>=0?base+from+1:0,q[3]?'bird':'circle',q[2]||'',q[3]?1.15:(i===0?.45:.3)]);
      });
    });
    loadList(rows,15,17,{theme:'night',gridMode:'dots',edge:'straight',dash:'solid',lineOver:false,lineW:4,shapeMode:'mixed',fillMode:'solid',unit:'',
      lineColor:'node',lblScale:2,capOn:true,capT:'Autumn flight',
      capS:'Greater spotted eagles crossing Ukraine on their way south. Redrawn from a satellite-tracking map; positions are approximate.',
      legendT:'Wintering area',
      legend:[{c:0,t:'Western Europe'},{c:5,t:'Greece'},{c:4,t:'Aegean coast'},{c:3,t:'Levant'},{c:1,t:'Egypt'},{c:2,t:'Sudan and South Sudan'}],
      anim:reduce?'none':'draw'});
  }
  function loadAutumn(){
    loadList(AUTUMN,11,6,{theme:'autumn',gridMode:'dots',edge:'curve',dash:'solid',lineOver:false,lineW:2.5,shapeMode:'mixed',fillMode:'solid',unit:'°',
      capOn:true,capT:'Autumn 2026',capS:'Sample temperatures along the season. Each leaf turns from green to plum as the value drops.',anim:reduce?'none':'fall'});
  }
  function afterLoad(){ syncSettings(); buildList(); renderInspector(); animT=0; commit(); }
  function clearAll(){
    S.nodes=[]; S.sel=null; S.hover=null; S.nextId=1;
    buildList(); renderInspector(); commit(); hideTip();
    flash(S.frame==='post'?'Nodes cleared. The texts stay: remove or edit them in the Poster tab.':'The canvas is empty. Use Point or Draw to place nodes by hand.');
  }

  /* ---------- generator ---------- */
  function generate(){
    const rnd=rng(S.seed), R=(a,b)=>a+Math.floor(rnd()*(b-a+1));
    S.nodes=[]; S.nextId=1; S.sel=null; S.hover=null;
    const occ=new Set(), key=(x,y)=>x+','+y;
    const colorPool=[0,0,1,1,2,3,3,4,5];
    const shapePool=S.theme==='autumn'?['leaf','leaf','leaf','leaf','circle','ring']:['circle','circle','circle','square','ring','half','triangle','diamond','hexagon','star'];
    const add=(x,y,p)=>{
      occ.add(key(x,y));
      return mk(x,y, rnd()<.75?R(1,24):null, PAL[colorPool[R(0,colorPool.length-1)]], p, shapePool[R(0,shapePool.length-1)], 1);
    };
    add(R(0,Math.min(2,S.cols)),R(1,Math.max(1,S.rows-1)),null);
    for (let i=1;i<S.count;i++){
      for (let t=0;t<50;t++){
        const par = rnd()<S.branchy ? S.nodes[R(0,S.nodes.length-1)] : S.nodes[S.nodes.length-1];
        const x=par.x+R(-1,2), y=par.y+R(-2,2);
        if ((x===par.x&&y===par.y)||x<0||y<0||x>S.cols||y>S.rows||occ.has(key(x,y))) continue;
        add(x,y,par.id); break;
      }
    }
    afterLoad();
  }
  function fromSeries(){
    const nums=$('series').value.split(/[\s,;]+/).map(parseFloat).filter(v=>!isNaN(v)).slice(0,40);
    if (nums.length<2) return;
    const mn=Math.min(...nums), mx=Math.max(...nums);
    S.nodes=[]; S.nextId=1; S.sel=null; S.hover=null;
    S.cols=clamp(nums.length-1,3,12);
    nums.forEach((v,i)=>{
      const norm=(v-mn)/((mx-mn)||1);
      const x = nums.length-1<=12 ? i : f2(i*12/(nums.length-1));
      const y = S.rows-Math.round(norm*S.rows);
      const color = norm>.66?PAL[0]:norm>.33?PAL[2]:PAL[1];
      mk(x,y,v,color,i||null,'circle',1);
    });
    afterLoad();
  }

  /* ---------- tree helpers ---------- */
  function treeInfo(){
    const ch={}, roots=[];
    S.nodes.forEach(n=>{ch[n.id]=[];});
    S.nodes.forEach(n=>{ if(n.p&&ch[n.p]) ch[n.p].push(n); else roots.push(n); });
    return {ch,roots};
  }
  function descendants(n){
    const {ch}=treeInfo(), out=[n], st=[n.id];
    while(st.length){ const id=st.pop(); ch[id].forEach(k=>{out.push(k);st.push(k.id);}); }
    return out;
  }
  function isDesc(n,m){
    let c=m,g=0;
    while(c&&g++<300){ if(c===n) return true; c=c.p?byId(c.p):null; }
    return false;
  }
  function depthOf(n){ let d=0,c=n,g=0; while(c.p&&g++<300){c=byId(c.p);d++;} return d; }

  function computeDist(){
    const by={}, dist={}, ch={}, dep={}; let max=0;
    S.nodes.forEach(n=>{by[n.id]=n;ch[n.id]=[];});
    S.nodes.forEach(n=>{ if(n.p&&ch[n.p]) ch[n.p].push(n); });
    function get(n,g){
      if(dist[n.id]!==undefined) return dist[n.id];
      dist[n.id]=0; dep[n.id]=0;
      let v=0, dd=0; const p=n.p&&by[n.p];
      if(p&&g<100){ v=get(p,g+1)+Math.hypot(p.px-n.px,p.py-n.py); dd=dep[p.id]+1; }
      dist[n.id]=v; dep[n.id]=dd; return v;
    }
    S.nodes.forEach(n=>{max=Math.max(max,get(n,0));});
    return {dist,max,by,ch,dep};
  }

  /* ---------- layouts ---------- */
  function nearestFree(fx,fy,occ){
    let best=null,bd=Infinity;
    for(let x=0;x<=S.cols;x++) for(let y=0;y<=S.rows;y++){
      if(occ.has(x+','+y)) continue;
      const d=(x-fx)*(x-fx)+(y-fy)*(y-fy);
      if(d<bd){bd=d;best=[x,y];}
    }
    return best||[clamp(Math.round(fx),0,S.cols),clamp(Math.round(fy),0,S.rows)];
  }
  function applyTargets(arr){
    const occ=new Set();
    arr.forEach(t=>{
      const b=nearestFree(t.fx,t.fy,occ);
      t.n.x=b[0]; t.n.y=b[1]; occ.add(b[0]+','+b[1]);
    });
    buildList(); commit();
  }
  function layout(kind){
    const N=S.nodes; if(!N.length) return;
    const {ch,roots}=treeInfo(), T=[];
    if(kind==='tree'){
      let leaf=0,maxD=0;
      const walk=(n,d)=>{
        maxD=Math.max(maxD,d); n._d=d;
        const kids=ch[n.id];
        if(!kids.length) n._ly=leaf++;
        else { kids.forEach(k=>walk(k,d+1)); n._ly=(kids[0]._ly+kids[kids.length-1]._ly)/2; }
        T.push(n);
      };
      roots.forEach(r=>walk(r,0));
      const L=Math.max(leaf-1,1);
      T.reverse();
      applyTargets(T.map(n=>({n:n,fx:maxD?n._d*S.cols/maxD:S.cols/2,fy:leaf>1?n._ly*S.rows/L:S.rows/2})));
    } else if(kind==='radial'){
      const order=[]; let maxD=0;
      const lc=n=>{const k=ch[n.id]; n._lc=k.length?k.reduce((s,m)=>s+lc(m),0):1; return n._lc;};
      roots.forEach(lc);
      const walk=(n,d,a0,a1)=>{
        maxD=Math.max(maxD,d);
        n._ang=(a0+a1)/2; n._dd=d; order.push(n);
        let a=a0;
        ch[n.id].forEach(k=>{const span=(a1-a0)*k._lc/n._lc; walk(k,d+1,a,a+span); a+=span;});
      };
      const full=Math.PI*2, start=-Math.PI/2;
      if(roots.length===1) walk(roots[0],0,start,start+full);
      else { const tl=roots.reduce((s,r)=>s+r._lc,0); let a=start; roots.forEach(r=>{const sp=full*r._lc/tl; walk(r,1,a,a+sp); a+=sp;}); }
      const md=Math.max(maxD,1), cx=S.cols/2, cy=S.rows/2;
      applyTargets(order.map(n=>({n:n,fx:cx+cx*n._dd/md*Math.cos(n._ang),fy:cy+cy*n._dd/md*Math.sin(n._ang)})));
    } else if(kind==='value'){
      const vs=N.filter(n=>n.v!=null).map(n=>n.v);
      const mn=Math.min(...vs), mx=Math.max(...vs), mid=vs.length?(mn+mx)/2:0;
      applyTargets(N.map((n,i)=>{
        const v=n.v==null?mid:n.v, norm=vs.length&&mx>mn?(v-mn)/(mx-mn):.5;
        return {n:n,fx:N.length>1?i*S.cols/(N.length-1):S.cols/2,fy:S.rows-norm*S.rows};
      }));
    } else if(kind==='spiral'){
      const cx=S.cols/2, cy=S.rows/2, n=N.length;
      applyTargets(N.map((m,i)=>{
        const t=i/Math.max(n-1,1), ang=i*.78-Math.PI/2, k=.12+.88*t;
        return {n:m,fx:cx+cx*k*Math.cos(ang),fy:cy+cy*k*Math.sin(ang)};
      }));
    }
  }
  function jitter(){
    const occ=new Set(S.nodes.map(n=>n.x+','+n.y));
    const order=S.nodes.slice().sort(()=>Math.random()-.5);
    order.forEach(n=>{
      if(Math.random()>.65) return;
      const c=[];
      for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
        if(!dx&&!dy) continue;
        const x=n.x+dx,y=n.y+dy;
        if(x<0||y<0||x>S.cols||y>S.rows||occ.has(x+','+y)) continue;
        c.push([x,y]);
      }
      if(!c.length) return;
      const pick=c[rint(0,c.length-1)];
      occ.delete(n.x+','+n.y); n.x=pick[0]; n.y=pick[1]; occ.add(pick[0]+','+pick[1]);
    });
    buildList(); commit();
  }
  function flip(axis){
    S.nodes.forEach(n=>{
      const B=bnd();
      if(axis==='h') n.x=clamp(f2(S.cols-n.x),B.x0,B.x1);
      else n.y=clamp(f2(S.rows-n.y),B.y0,B.y1);
    });
    buildList(); commit();
  }
  function recolor(mode){
    const {ch,roots}=treeInfo();
    if(mode==='value'){
      const vs=S.nodes.filter(n=>n.v!=null).map(n=>n.v).sort((a,b)=>a-b), ramp=THEMES[S.theme].ramp;
      S.nodes.forEach(n=>{
        if(n.v==null) return;
        const rank=vs.indexOf(n.v)/Math.max(vs.length-1,1);
        n.color=PAL[ramp[Math.min(4,Math.floor(rank*5))]];
      });
    } else if(mode==='depth'){
      const seq=[5,1,2,3,0,4];
      S.nodes.forEach(n=>{n.color=PAL[seq[depthOf(n)%6]];});
    } else {
      const seq=[0,1,2,3,4];
      roots.forEach(r=>{
        r.color=PAL[5];
        ch[r.id].forEach((top,k)=>{ descendants(top).forEach(m=>{m.color=PAL[seq[k%5]];}); });
      });
    }
    buildList(); renderInspector(); commit();
  }

  /* ---------- rendering ---------- */
  function polyPts(cx,cy,R,sides,rot){
    const pts=[];
    for(let i=0;i<sides;i++){ const a=rot+i*2*Math.PI/sides; pts.push(f2(cx+R*Math.cos(a))+','+f2(cy+R*Math.sin(a))); }
    return pts.join(' ');
  }
  function starPts(cx,cy,Ro,Ri){
    const pts=[];
    for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, R=i%2?Ri:Ro; pts.push(f2(cx+R*Math.cos(a))+','+f2(cy+R*Math.sin(a))); }
    return pts.join(' ');
  }
  function crossPts(cx,cy,L,w){
    const p=[[-w,-L],[w,-L],[w,-w],[L,-w],[L,w],[w,w],[w,L],[-w,L],[-w,w],[-L,w],[-L,-w],[-w,-w]];
    return p.map(q=>f2(cx+q[0])+','+f2(cy+q[1])).join(' ');
  }
  function shapeFor(n,D,vmin,vmax){
    const m=S.shapeMode;
    if(n.shape==='none') return 'none';
    if(m==='mixed') return n.shape;
    if(m==='depth') return GEO_DEPTH[D.dep[n.id]%GEO_DEPTH.length];
    if(m==='value'){
      if(n.v==null) return 'ring';
      const nm=vmax>vmin?(n.v-vmin)/(vmax-vmin):.5;
      return GEO_VALUE[Math.min(GEO_VALUE.length-1,Math.floor(nm*GEO_VALUE.length))];
    }
    return m;
  }
  function shapeCore(n,shape,x,y,r,a,rot){
    const col=n.color, op=a<.999?' opacity="'+f2(a)+'"':'';
    const mode=S.fillMode, sw=Math.max(1.6,r*.3);
    let paint;
    if(mode==='solid') paint=' fill="'+col+'"';
    else if(mode==='gradient'){ if(GRADSET) GRADSET[col]=1; paint=' fill="url(#ng_'+String(col).replace('#','')+')"'; }
    else paint=(mode==='duo'?' fill="'+col+'" fill-opacity=".3"':' fill="none"')+' stroke="'+col+'" stroke-width="'+f2(sw)+'" stroke-linejoin="round"';
    const ro = (mode==='solid'||mode==='gradient') ? r : Math.max(r-sw/2,.1);
    switch(shape){
      case 'square': {
        const s=ro*1.78;
        return '<rect x="'+f2(x-s/2)+'" y="'+f2(y-s/2)+'" width="'+f2(s)+'" height="'+f2(s)+'" rx="'+f2(s*.12)+'"'+paint+op+'/>';
      }
      case 'ring': {
        const rsw=r*.42;
        return '<circle cx="'+f2(x)+'" cy="'+f2(y)+'" r="'+f2(Math.max(r-rsw/2,.1))+'" fill="none" stroke="'+col+'" stroke-width="'+f2(rsw)+'"'+op+'/>';
      }
      case 'half': {
        const by=y+ro*.5;
        return '<path d="M'+f2(x-ro)+' '+f2(by)+' A'+f2(ro)+' '+f2(ro)+' 0 0 1 '+f2(x+ro)+' '+f2(by)+' Z"'+paint+op+'/>';
      }
      case 'none': return (!EXPORTING&&(S.sel===n.id||S.hover===n.id))?'<circle cx="'+f2(x)+'" cy="'+f2(y)+'" r="6" fill="none" stroke="#e06c47" stroke-width="2" stroke-dasharray="3 3"/>':'';
      case 'bird': {
        const k=ro*1.4;
        const d='M'+f2(-k)+' '+f2(-k*.05)+' Q'+f2(-k*.5)+' '+f2(-k*.75)+' 0 '+f2(-k*.12)+' Q'+f2(k*.5)+' '+f2(-k*.75)+' '+f2(k)+' '+f2(-k*.05)+' Q'+f2(k*.45)+' '+f2(-k*.18)+' 0 '+f2(k*.5)+' Q'+f2(-k*.45)+' '+f2(-k*.18)+' '+f2(-k)+' '+f2(-k*.05)+' Z';
        return '<path transform="translate('+f2(x)+' '+f2(y)+')" d="'+d+'"'+paint+op+' stroke-linejoin="round"/>';
      }
      case 'leaf': {
        const L=ro*1.3, Wd=ro*.9;
        const body='M0 '+f2(L)+' C'+f2(-Wd*1.3)+' '+f2(L*.4)+' '+f2(-Wd*1.15)+' '+f2(-L*.6)+' 0 '+f2(-L)+' C'+f2(Wd*1.15)+' '+f2(-L*.6)+' '+f2(Wd*1.3)+' '+f2(L*.4)+' 0 '+f2(L)+' Z';
        const vein=mode==='solid'?'<path d="M0 '+f2(L*1.4)+' L0 '+f2(-L*.62)+'" stroke="rgba(20,10,5,.4)" stroke-width="'+f2(Math.max(1.2,r*.07))+'" stroke-linecap="round" fill="none"/>':'';
        return '<g transform="translate('+f2(x)+' '+f2(y)+') rotate('+f2(rot||0)+')"'+op+'><path d="'+body+'"'+paint+'/>'+vein+'</g>';
      }
      case 'triangle': return '<polygon points="'+polyPts(x,y+ro*.1,ro*1.2,3,-Math.PI/2)+'"'+paint+op+'/>';
      case 'diamond':  return '<polygon points="'+polyPts(x,y,ro*1.2,4,-Math.PI/2)+'"'+paint+op+'/>';
      case 'hexagon':  return '<polygon points="'+polyPts(x,y,ro*1.05,6,0)+'"'+paint+op+'/>';
      case 'star':     return '<polygon points="'+starPts(x,y,ro*1.22,ro*.52)+'"'+paint+op+'/>';
      case 'cross':    return '<polygon points="'+crossPts(x,y,ro*1.1,ro*.38)+'"'+paint+op+'/>';
      default:         return '<circle cx="'+f2(x)+'" cy="'+f2(y)+'" r="'+f2(ro)+'"'+paint+op+'/>';
    }
  }
  function shapeSVG(n,shape,x,y,r,a,rot){
    const core=shapeCore(n,shape,x,y,r,a,rot);
    if(shape==='leaf'||!rot) return core;
    return '<g transform="rotate('+f2(rot)+' '+f2(x)+' '+f2(y)+')">'+core+'</g>';
  }
  function edgePath(x1,y1,x2,y2,time){
    const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy), E=S.edge;
    const straight='M'+f2(x1)+' '+f2(y1)+' L'+f2(x2)+' '+f2(y2);
    if(len<1) return straight;
    if(E==='straight') return straight;
    const nx=-dy/len, ny=dx/len, amp=S.waveAmp*CELL;
    if(E==='wave'){
      const K=Math.max(2,Math.round(len/(CELL*.45))), N=Math.max(16,Math.ceil(len/3)), ph=S.anim==='drift'?time*2.4:0;
      let d='M'+f2(x1)+' '+f2(y1);
      for(let i=1;i<=N;i++){
        const t=i/N, env=sm(Math.min(t,1-t)*6), o=amp*env*Math.sin(Math.PI*K*t+ph);
        d+=' L'+f2(x1+dx*t+nx*o)+' '+f2(y1+dy*t+ny*o);
      }
      return d;
    }
    if(E==='zigzag'){
      const K=Math.max(2,Math.round(len/(CELL*.4)));
      let d='M'+f2(x1)+' '+f2(y1);
      for(let k=1;k<K;k++){
        const t=k/K, o=(k%2?1:-1)*amp;
        d+=' L'+f2(x1+dx*t+nx*o)+' '+f2(y1+dy*t+ny*o);
      }
      return d+' L'+f2(x2)+' '+f2(y2);
    }
    if(E==='arc'){
      const bend=len*.28, cx=(x1+x2)/2+nx*bend, cy=(y1+y2)/2+ny*bend;
      return 'M'+f2(x1)+' '+f2(y1)+' Q'+f2(cx)+' '+f2(cy)+' '+f2(x2)+' '+f2(y2);
    }
    if(!dx||!dy) return straight;
    if(E==='step'){
      if(Math.abs(dx)>=Math.abs(dy)){ const mx=(x1+x2)/2; return 'M'+f2(x1)+' '+f2(y1)+' L'+f2(mx)+' '+f2(y1)+' L'+f2(mx)+' '+f2(y2)+' L'+f2(x2)+' '+f2(y2); }
      const my=(y1+y2)/2; return 'M'+f2(x1)+' '+f2(y1)+' L'+f2(x1)+' '+f2(my)+' L'+f2(x2)+' '+f2(my)+' L'+f2(x2)+' '+f2(y2);
    }
    if(Math.abs(dx)>=Math.abs(dy)){ const mx=(x1+x2)/2; return 'M'+f2(x1)+' '+f2(y1)+' C'+f2(mx)+' '+f2(y1)+' '+f2(mx)+' '+f2(y2)+' '+f2(x2)+' '+f2(y2); }
    const my=(y1+y2)/2; return 'M'+f2(x1)+' '+f2(y1)+' C'+f2(x1)+' '+f2(my)+' '+f2(x2)+' '+f2(my)+' '+f2(x2)+' '+f2(y2);
  }
  /* ---------- poster: format, background, text blocks ---------- */
  let EXPORTING=false, GRADSET=null;
  const FORMATS={p45:[1080,1350],p11:[1080,1080],p916:[1080,1920],p169:[1920,1080]};
  const FONTS={
    serif:{css:"'Averia Serif Libre',Georgia,serif",A:.95,D:.2874,label:'Averia Serif Libre'},
    sans:{css:"Arial,'Helvetica Neue',Helvetica,sans-serif",A:.905,D:.212,label:'Arial'},
    cond:{css:"'Roboto Condensed','Arial Narrow',Arial,sans-serif",A:.928,D:.244,label:'Roboto Condensed'},
    gothic:{css:"'Special Gothic Condensed One','Arial Narrow',sans-serif",A:.93,D:.25,label:'Special Gothic Condensed One'}
  };
  const mCtx=document.createElement('canvas').getContext('2d');
  function syncFrame(){ CELL=S.frame==='post'?108.65:50; }
  function fmtKey(){
    if(S.frame!=='post') return 'full';
    for(const k in FORMATS){ if(FORMATS[k][0]===S.artW&&FORMATS[k][1]===S.artH) return k; }
    return 'p45';
  }
  function setFormat(key){
    if(key==='full'){ switchFrame('full'); return; }
    const f=FORMATS[key]; if(!f) return;
    if(S.frame!=='post'){ S.artW=f[0]; S.artH=f[1]; switchFrame('post'); return; }
    const ow=S.artW, oh=S.artH;
    S.artW=f[0]; S.artH=f[1];
    S.blocks.forEach(b=>{ b.x=f2(b.x*f[0]/ow); b.y=f2(b.y*f[1]/oh); });
    S.nodes.forEach(n=>{ n.x=f2(n.x*f[0]/ow); n.y=f2(n.y*f[1]/oh); });
    S.cols=S.artW/CELL; S.rows=S.artH/CELL;
    syncSettings(); buildList(); commit();
  }
  function fitNodes(){
    const N=S.nodes.filter(n=>n.shape!=='none'); if(!N.length) return;
    let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
    N.forEach(n=>{x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y);});
    const m=.6, tw=S.cols-2*m, th=S.rows-2*m, bw=Math.max(x1-x0,.01), bh=Math.max(y1-y0,.01), k=Math.min(tw/bw,th/bh);
    const ox=m+(tw-bw*k)/2, oy=m+(th-bh*k)/2;
    S.nodes.forEach(n=>{ n.x=f2(ox+(n.x-x0)*k); n.y=f2(oy+(n.y-y0)*k); });
  }
  function switchFrame(f){
    if(f===S.frame) return;
    const oldC=CELL;
    S.frame=f; syncFrame();
    S.lineW=Math.min(8,Math.max(1,f2(S.lineW*CELL/oldC)));
    if(f==='post'){ S.cols=S.artW/CELL; S.rows=S.artH/CELL; }
    else {
      const N=S.nodes.filter(n=>n.shape!=='none');
      if(!N.length){ S.cols=9; S.rows=6; }
      else {
        let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
        N.forEach(n=>{x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y);});
        const bw=Math.max(x1-x0,.01), bh=Math.max(y1-y0,.01);
        if(bw>=bh){ S.cols=12; S.rows=clamp(Math.round(12*bh/bw),4,12); } else { S.rows=12; S.cols=clamp(Math.round(12*bw/bh),4,12); }
      }
    }
    fitNodes(); syncSettings(); buildList(); commit();
  }
  function lum(hex){ const n=parseInt(String(hex).slice(1),16)||0; const r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255; return .2126*r+.7152*g+.0722*b; }
  function autoInk(){
    const B=S.bg; let l=.5;
    if(B.type!=='none'&&B.stops.length) l=B.stops.reduce((a,q)=>a+lum(q.c),0)/B.stops.length;
    return l>.5?'#212121':'#f4f1ea';
  }
  function mkBlock(p){
    const b=Object.assign({id:S.nextBlock++,text:'New text',x:80,y:80,fs:40,font:'sans',bold:false,color:null,align:'start',ls:0,ls2:null,lh:1.1,upper:false,it:-1,layer:'front',anim:'fade',delay:0,cps:60,stagger:0,sync:false,locked:false,box:null},p||{});
    if(p&&p.id!=null) S.nextBlock=Math.max(S.nextBlock,p.id+1);
    S.blocks.push(b); return b;
  }
  const byBlock=id=>S.blocks.find(b=>b.id===id)||null;
  function fontStr(b,italic){ const M=FONTS[b.font]||FONTS.sans; return (italic?'italic ':'')+(b.bold?'700 ':'400 ')+b.fs+'px '+M.css; }
  function lineW(b,txt,italic){ mCtx.font=fontStr(b,italic); return mCtx.measureText(txt).width+txt.length*((italic&&b.ls2!=null)?b.ls2:b.ls); }
  function bBase(b,i){ const M=FONTS[b.font]||FONTS.sans; return b.y+b.fs*((b.lh-(M.A+M.D))/2+M.A)+i*b.lh*b.fs; }
  function blockGeom(b){
    const lines=String(b.text||'').split('\n').map(l=>b.upper?l.toUpperCase():l);
    const ws=lines.map((l,i)=>lineW(b,l,i===b.it));
    const W=Math.max.apply(null,ws.concat([0]));
    return {lines:lines,ws:ws,W:W,x0:b.align==='middle'?b.x-W/2:b.x,H:lines.length*b.lh*b.fs};
  }
  function blockRect(b){
    const g=blockGeom(b);
    if(b.box) return {x:g.x0-b.box.l,y:b.y-b.box.t,w:Math.max(b.box.minW||0,g.W+b.box.l+b.box.r),h:g.H+b.box.t+b.box.b};
    return {x:g.x0,y:b.y,w:g.W,h:g.H};
  }
  function lineSVG(b,i,txt,x,fill){
    const M=FONTS[b.font]||FONTS.sans, it=i===b.it, ls=(it&&b.ls2!=null)?b.ls2:b.ls;
    return '<text x="'+f2(x)+'" y="'+f2(bBase(b,i))+'" style="font-family:'+M.css+';font-size:'+b.fs+'px;font-weight:'+(b.bold?700:400)+';letter-spacing:'+ls+'px;'+(it?'font-style:italic;':'')+'fill:'+fill+';white-space:pre">'+esc(txt)+'</text>';
  }
  function blockSVG(b,ctx){
    const M=FONTS[b.font]||FONTS.sans, g=blockGeom(b), fill=b.color||ctx.ink;
    const boxR=b.box?blockRect(b):null;
    const bxid='bx'+b.id;
    const boxEl=boxR?(b.box.fill2?'<defs><linearGradient id="'+bxid+'" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate('+f2((b.box.angle==null?180:b.box.angle)-180)+' .5 .5)"><stop offset="0" stop-color="'+b.box.fill+'"/><stop offset="1" stop-color="'+b.box.fill2+'"/></linearGradient></defs>':'')+
      '<rect x="'+f2(boxR.x)+'" y="'+f2(boxR.y)+'" width="'+f2(boxR.w)+'" height="'+f2(boxR.h)+'" fill="'+(b.box.fill2?'url(#'+bxid+')':b.box.fill)+'"'+(b.box.radius?' rx="'+b.box.radius+'"':'')+((b.box.op!=null&&b.box.op<1)?' opacity="'+b.box.op+'"':'')+'/>':'';
    const xl=i=>b.align==='middle'?b.x-g.ws[i]/2:b.x;
    const lineEl=(i,txt)=>lineSVG(b,i,txt,xl(i),fill);
    const desc=[];
    g.lines.forEach((l,i)=>{ if(l) desc.push({text:l,x:xl(i),y:bBase(b,i),font:M.css,fs:b.fs,weight:b.bold?700:400,italic:i===b.it,ls:(i===b.it&&b.ls2!=null)?b.ls2:b.ls,fill:fill}); });
    const staticSVG=boxEl+g.lines.map((l,i)=>l?lineEl(i,l):'').join('');
    let out=staticSVG;
    if(ctx.live&&b.anim!=='none'){
      let t0=b.delay||0;
      if(b.sync){
        const cx=g.x0+g.W/2, cy=b.y+g.H/2; let best=null, bd=Infinity;
        ctx.real.forEach(n=>{ const d=Math.hypot(n.x*CELL-cx,n.y*CELL-cy); if(d<bd){bd=d;best=n;} });
        t0+=((best?(ctx.dist[best.id]||0):0)+.25)/3;
      }
      const pr=(s0,d)=>clamp((animT-s0)/d,0,1), eo=u=>1-Math.pow(1-u,3);
      const wrapG=(p,dx,dy,gs)=>{ if(!gs) return ''; if(p>=1) return gs; if(p<=0) return ''; const e=eo(p); return '<g opacity="'+f2(e)+'" transform="translate('+f2(dx*(1-e))+' '+f2(dy*(1-e))+')">'+gs+'</g>'; };
      const an=b.anim;
      if(an==='slide'){ out=wrapG(pr(t0,.6),-((boxR?boxR.x+boxR.w:g.x0+g.W)+10),0,staticSVG); }
      else if(an==='fade'||an==='rise'){
        const dur=an==='rise'?.95:.6, dy=an==='rise'?90:0, st=b.stagger||0;
        let acc=wrapG(pr(t0,dur),0,dy,boxEl);
        g.lines.forEach((l,i)=>{ if(l) acc+=wrapG(pr(t0+st*i,dur),0,dy,lineEl(i,l)); });
        out=acc;
      } else if(an==='wipe'||an==='type'){
        let acc=wrapG(pr(t0,.3),0,0,boxEl), t=t0+(boxEl?.15:0), last=-1;
        const cps=Math.max(5,b.cps||60);
        g.lines.forEach((l,i)=>{ if(l) last=i; });
        g.lines.forEach((l,i)=>{
          if(!l) return;
          const dur=l.length/cps;
          if(animT>=t){
            const p=clamp((animT-t)/dur,0,1);
            if(an==='type'){
              const n=Math.floor(p*l.length), cur=p<1||(i===last&&animT-t-dur<1&&Math.floor((animT-t-dur)*4)%2===0);
              acc+=lineEl(i,l.slice(0,n)+(cur?'|':''));
            } else if(p>=1) acc+=lineEl(i,l);
            else {
              const w=g.ws[i]*p, y0=bBase(b,i)-b.fs*.92, cid='wb'+b.id+'_'+i;
              acc+='<clipPath id="'+cid+'"><rect x="'+f2(xl(i)-6)+'" y="'+f2(y0)+'" width="'+f2(w+6)+'" height="'+f2(b.fs*1.25)+'"/></clipPath><g clip-path="url(#'+cid+')">'+lineEl(i,l)+'</g><rect x="'+f2(xl(i)+w-2)+'" y="'+f2(y0+b.fs*.04)+'" width="4" height="'+f2(b.fs*1.1)+'" fill="'+fill+'"/>';
            }
          }
          t+=dur;
        });
        out=acc;
      }
    }
    return {svg:out,box:boxEl,desc:desc};
  }
  function blocksSVG(ctx){
    const r={back:[],front:[],boxBack:[],boxFront:[],dBack:[],dFront:[]};
    S.blocks.forEach(b=>{
      const o=blockSVG(b,ctx), back=b.layer==='back';
      (back?r.back:r.front).push(o.svg);
      (back?r.boxBack:r.boxFront).push(o.box);
      Array.prototype.push.apply(back?r.dBack:r.dFront,o.desc);
    });
    const clip=(arr,id)=>arr.length?['<defs><clipPath id="'+id+'"><rect x="0" y="0" width="'+S.artW+'" height="'+S.artH+'"/></clipPath></defs><g clip-path="url(#'+id+')">'].concat(arr,['</g>']):[];
    r.back=clip(r.back,'abb'); r.front=clip(r.front,'abx');
    return r;
  }
  function hitBlock(px,py){
    if(S.frame!=='post') return null;
    const order=S.blocks.filter(b=>b.layer!=='back').reverse().concat(S.blocks.filter(b=>b.layer==='back').reverse());
    for(const b of order){
      if(b.locked) continue;
      const g=blockGeom(b), m=8;
      for(let i=0;i<g.lines.length;i++){
        if(!g.lines[i]) continue;
        const base=bBase(b,i), x0=b.align==='middle'?b.x-g.ws[i]/2:b.x;
        if(px>=x0-m&&px<=x0+g.ws[i]+m&&py>=base-b.fs*.82-m&&py<=base+b.fs*.25+m) return b;
      }
      if(b.box){ const r=blockRect(b); if(px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h) return b; }
    }
    return null;
  }
  function view(){
    const c=CELL, W=S.px.w||1000, H=S.px.h||800, Hc=Math.max(H-(S.px.dock||0),120);
    const post=S.frame==='post';
    const W0=post?S.artW+60:(S.cols+4)*c, H0=post?S.artH+60:(S.rows+4)*c, sc=Math.min(W/W0,Hc/H0);
    const vbW=W/sc, vbH=H/sc, cx=post?S.artW/2:S.cols*c/2, cy=post?S.artH/2:S.rows*c/2;
    return {vx:cx-vbW/2, vy:cy-(Hc/2)/sc, vbW:vbW, vbH:vbH, hc:Hc/sc, W0:W0, H0:H0, cx:cx, cy:cy};
  }
  function easeOutBack(u){ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2); }
  function edgeAngle(x1,y1,x2,y2){
    const dx=x2-x1, dy=y2-y1, E=S.edge, len=Math.hypot(dx,dy);
    if(E==='arc'&&len>=1){ const nx=-dy/len, ny=dx/len, bend=len*.28; return Math.atan2(y2-((y1+y2)/2+ny*bend), x2-((x1+x2)/2+nx*bend)); }
    if((E==='step'||E==='curve')&&dx&&dy){ if(Math.abs(dx)>=Math.abs(dy)) return dx>=0?0:Math.PI; return dy>=0?Math.PI/2:-Math.PI/2; }
    return Math.atan2(dy,dx);
  }

  // ex === null: draw into the page. ex === {} : build a static, final-state scene for export (nothing is drawn on screen)
  function render(ex){
    const c=CELL, N=S.nodes, time=ex?0:animT, anim=ex?'none':S.anim;
    const post=S.frame==='post', T=THEMES[S.theme];
    let V=view();
    if(ex){
      V=post?{vx:0,vy:0,vbW:S.artW,vbH:S.artH,hc:S.artH}:{vx:V.cx-V.W0/2,vy:V.cy-V.H0/2,vbW:V.W0,vbH:V.H0,hc:V.H0};
    } else {
      svg.setAttribute('viewBox',f2(V.vx)+' '+f2(V.vy)+' '+f2(V.vbW)+' '+f2(V.vbH));
      if(post) S.bounds={x0:0,x1:S.artW/c,y0:0,y1:S.artH/c};
      else S.bounds={
        x0:Math.min(-1,Math.ceil(V.vx/c+.5)), x1:Math.max(S.cols+1,Math.floor((V.vx+V.vbW)/c-.5)),
        y0:Math.min(-1,Math.ceil(V.vy/c+.5)), y1:Math.max(S.rows+1,Math.floor((V.vy+V.hc)/c-.5))
      };
    }

    N.forEach(n=>{
      let ox=0,oy=0;
      if(anim==='drift'){ ox=Math.sin(time*.9+n.id*1.7)*.14; oy=Math.cos(time*.7+n.id*2.3)*.14; }
      n.px=ex?n.x:n.dx+ox; n.py=ex?n.y:n.dy+oy;
    });
    const D=computeDist(), dist=D.dist, by=D.by;

    const fallDur=anim==='fall'?12:0, growEnd=D.max+4, total=growEnd+fallDur;
    let head=Infinity, fallT=-1;
    if(!ex){
      S.tl=total;
      if(anim==='draw'||anim==='fall'){
        let t=animT*3;
        if(t>total){ if(S.loop&&!S.paused){animT=0;t=0;} else t=S.loop?total:Infinity; }
        if(t===Infinity){ head=Infinity; S.prog=1; }
        else { head=t; S.prog=clamp(t/total,0,1); if(fallDur&&t>growEnd) fallT=(t-growEnd)/3; }
      } else S.prog=0;
    }

    let inSet=null;
    if(!ex&&S.focus && S.hover && by[S.hover]){
      inSet=new Set();
      let cur=by[S.hover],g=0;
      while(cur&&g++<300){inSet.add(cur.id);cur=cur.p?by[cur.p]:null;}
      const st=[S.hover];
      while(st.length){const id=st.pop();(D.ch[id]||[]).forEach(k=>{inSet.add(k.id);st.push(k.id);});}
    }
    const ka=1-Math.pow(.0001,S.dt);
    N.forEach(n=>{
      if(ex){ n.a=1; return; }
      const tgt=inSet?(inSet.has(n.id)?1:.18):1;
      n.a+=(tgt-n.a)*ka;
    });

    let vmin=Infinity,vmax=-Infinity;
    N.forEach(n=>{ if(n.v!=null){vmin=Math.min(vmin,n.v);vmax=Math.max(vmax,n.v);} });

    const out=[], nodeOut=[], edgeOut=[], selOut=[], labs=[], labD=[];
    const LBL=S.labelColor||(post?autoInk():T.label), LFONT=FONTS.serif.css;
    if(post){
      const B=S.bg, stops=B.stops.slice().sort((a,b)=>a.p-b.p);
      if(B.type==='gradient'&&stops.length>1) out.push('<defs><linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate('+f2(B.angle-180)+' .5 .5)">'+stops.map(q=>'<stop offset="'+f2(q.p)+'" stop-color="'+q.c+'"/>').join('')+'</linearGradient></defs><rect x="0" y="0" width="'+S.artW+'" height="'+S.artH+'" fill="url(#pbg)"/>');
      else if(B.type!=='none') out.push('<rect x="0" y="0" width="'+S.artW+'" height="'+S.artH+'" fill="'+(stops[0]?stops[0].c:'#ffffff')+'"/>');
      else if(!ex) out.push('<rect x="0" y="0" width="'+S.artW+'" height="'+S.artH+'" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/>');
    }
    if(S.gridMode!=='none'){
      const pg=S.pgrid, gw=post?pg.cw:c, gh=post?pg.ch:c, ox=post?pg.ox:0, oy=post?pg.oy:0, sw=post?pg.w:1.6, gl=post?pg.color:(S.gridCol||GRID_LINE), gd=post?pg.color:(S.gridCol||GRID_DOT);
      const tile = S.gridMode==='lines'
        ? '<path d="M0 0H'+gw+'M0 '+gh+'H'+gw+'M0 0V'+gh+'M'+gw+' 0V'+gh+'" stroke="'+gl+'" stroke-width="'+sw+'" fill="none"/>'
        : [[0,0],[gw,0],[0,gh],[gw,gh]].map(q=>'<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(post?Math.max(2,sw*1.2):2.2)+'" fill="'+gd+'"/>').join('');
      out.push('<defs><pattern id="gp" patternUnits="userSpaceOnUse" x="'+ox+'" y="'+oy+'" width="'+gw+'" height="'+gh+'">'+tile+'</pattern></defs>');
      if(post) out.push('<rect x="0" y="0" width="'+S.artW+'" height="'+S.artH+'" fill="url(#gp)"/>');
      else out.push('<rect x="'+f2(V.vx-c)+'" y="'+f2(V.vy-c)+'" width="'+f2(V.vbW+2*c)+'" height="'+f2(V.vbH+2*c)+'" fill="url(#gp)"/>');
    }

    GRADSET={};
    const bottom=(S.bounds?S.bounds.y1:S.rows)+1.5;
    const addLab=(text,x,y,fs,anchor,italic,fill,op)=>{
      labD.push({text:text,x:x,y:y,fs:fs,anchor:anchor,italic:italic,fill:fill,op:op});
      labs.push('<text x="'+f2(x)+'" y="'+f2(y)+'" text-anchor="'+anchor+'" opacity="'+f2(op)+'" style="font-family:'+LFONT+';font-size:'+f2(fs)+'px;'+(italic?'font-style:italic;':'')+'fill:'+fill+';white-space:pre">'+esc(text)+'</text>');
    };
    N.forEach((n,idx)=>{
      const u=head===Infinity?1:clamp((head-dist[n.id]+.25)/.8,0,1);
      let s=head===Infinity?1:easeOutBack(u);
      if(anim==='pulse') s*=1+.1*Math.sin(time*2.2+idx*.9);
      n.fl=0; n._r=c*.5*n.size;
      let fx=n.px, fy=n.py, af=1, fr=0;
      if(fallT>0){
        const loc=clamp((fallT-hsh(n.id)/100*1.8)/2.4,0,1);
        n.fl=loc;
        if(loc>0){
          fy=n.py+loc*loc*(bottom-n.py);
          fx=n.px+Math.sin(loc*8+n.id)*.6*loc;
          af=1-sm((loc-.6)/.4);
          fr=loc*(n.id%2?1:-1)*220;
        }
      }
      if(u<=.001||af<=.01) return;
      let r=c*.5*n.size;
      if(S.sizeByValue&&n.v!=null){
        const nm=vmax>vmin?(n.v-vmin)/(vmax-vmin):.5;
        r=c*(.26+.34*nm)*n.size;
      }
      n._r=r;
      r*=Math.max(0,s);
      const x=fx*c, y=fy*c;
      const shp=shapeFor(n,D,vmin,vmax);
      let rot=fr;
      if(shp==='leaf'){
        rot+=((n.id*67)%80)-40;
        if(anim==='drift'||anim==='fall') rot+=Math.sin(time*1.4+n.id*1.9)*7;
      }
      nodeOut.push(shapeSVG(n,shp,x,y,r,n.a*af,rot));
      if(!ex&&S.sel===n.id) selOut.push('<circle cx="'+f2(x)+'" cy="'+f2(y)+'" r="'+f2(r+8)+'" fill="none" stroke="'+RING+'" stroke-width="1.4" stroke-dasharray="3 4"/>');
      if(S.labels&&(n.v!=null||n.name)){
        const L=S.lblScale, fsV=c*.34*L, fsN=c*.26*L, lo=clamp(u*1.4-.2,0,1)*n.a*af, pos=S.labelPos;
        let lx=x, ly=y, anchor='middle', fill=LBL, nameDy=fsN*1.15;
        if(pos==='br'){ lx=x+r+.22*c*L; ly=y+.8*r+.28*c*L+5*L; nameDy=c*.3*L; }
        else if(pos==='r'){ lx=x+r+.18*c*L; ly=y+fsV*.35; anchor='start'; }
        else if(pos==='b'){ ly=y+r+fsV*1.05; }
        else if(pos==='t'){ ly=y-r-fsV*.3; if(n.name&&n.v!=null) ly-=fsN*1.15; }
        else if(pos==='c'){ ly=y+fsV*.35; fill=lum(n.color)>.55?'#212121':'#f4f1ea'; if(n.name&&n.v!=null) ly-=fsN*.5; }
        if(n.v!=null) addLab(f2(n.v)+S.unit,lx,ly,fsV,anchor,false,fill,lo);
        if(n.name) addLab(n.name,lx,n.v!=null?ly+nameDy:ly,n.v!=null?fsN:fsV*.8,anchor,true,fill,lo*.85);
      }
    });

    if(S.fillMode==='gradient'){
      const gs=Object.keys(GRADSET);
      if(gs.length) nodeOut.unshift('<defs>'+gs.map(cl=>'<linearGradient id="ng_'+cl.replace('#','')+'" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate('+f2(S.gradAngle-180)+' .5 .5)"><stop offset="0" stop-color="'+cl+'"/><stop offset="1" stop-color="'+S.gradEnd+'"/></linearGradient>').join('')+'</defs>');
    }
    if(S.line){
      const lw=S.lineW, lineCol=n=>S.lineColor==='node'?n.color:(S.lineColor==='custom'?S.lineHex:LINE);
      N.forEach(n=>{
        const p=n.p&&by[n.p]; if(!p) return;
        const len=Math.hypot(n.px-p.px,n.py-p.py);
        const frac=head===Infinity?1:(len>0?clamp((head-dist[p.id])/len,0,1):(head>=dist[p.id]?1:0));
        if(frac<=0) return;
        const a=Math.min(p.a,n.a)*(1-clamp(Math.max(p.fl,n.fl)*5,0,1));
        if(a<.01) return;
        const aa=a*(S.lineColor==='node'?.9:1), oa=aa<.999?' opacity="'+f2(aa)+'"':'';
        const d=edgePath(p.px*c,p.py*c,n.px*c,n.py*c,time), col=lineCol(n);
        const base=' fill="none" stroke="'+col+'" stroke-width="'+lw+'" stroke-linecap="'+(S.dash==='even'?'butt':'round')+'" stroke-linejoin="'+(S.dash==='even'?'miter':'round')+'"'+oa;
        const fr=Math.round(frac*10000)/10000;
        if(S.dash==='solid'){
          edgeOut.push('<path d="'+d+'" pathLength="1"'+base+(frac<1?' stroke-dasharray="'+fr+' 2"':'')+'/>');
        } else {
          const da=S.dash==='dashed' ? f2(lw*3.2)+' '+f2(lw*2.4) : S.dash==='even' ? f2(lw*2)+' '+f2(lw*2) : '0.01 '+f2(lw*2.6);
          if(frac>=1) edgeOut.push('<path d="'+d+'"'+base+' stroke-dasharray="'+da+'"/>');
          else {
            const mid='m'+n.id;
            edgeOut.push('<mask id="'+mid+'" maskUnits="userSpaceOnUse" x="'+f2(V.vx)+'" y="'+f2(V.vy)+'" width="'+f2(V.vbW)+'" height="'+f2(V.vbH)+'"><path d="'+d+'" pathLength="1" fill="none" stroke="#fff" stroke-width="'+(lw+6)+'" stroke-linecap="round" stroke-dasharray="'+fr+' 2"/></mask>'+
              '<path d="'+d+'" mask="url(#'+mid+')"'+base+' stroke-dasharray="'+da+'"/>');
          }
        }
        if(S.arrows&&frac>=1&&len>0){
          const x1=p.px*c, y1=p.py*c, x2=n.px*c, y2=n.py*c, ang=edgeAngle(x1,y1,x2,y2);
          const L=S.arrowSize*(lw*2.4+8), Wd=L*.55, tipx=x2-Math.cos(ang)*((n._r||c*.5)*.98), tipy=y2-Math.sin(ang)*((n._r||c*.5)*.98);
          const bx=tipx-Math.cos(ang)*L, by2=tipy-Math.sin(ang)*L, nx=-Math.sin(ang)*Wd, ny=Math.cos(ang)*Wd;
          edgeOut.push('<polygon points="'+f2(tipx)+','+f2(tipy)+' '+f2(bx+nx)+','+f2(by2+ny)+' '+f2(bx-nx)+','+f2(by2-ny)+'" fill="'+col+'"'+oa+'/>');
        }
      });
    }

    const prev=[];
    if(!ex&&S.ghost){
      const gx=S.ghost.x*c, gy=S.ghost.y*c;
      const par=S.chain&&S.sel?byId(S.sel):null;
      if(par) prev.push('<line x1="'+f2(par.px*c)+'" y1="'+f2(par.py*c)+'" x2="'+f2(gx)+'" y2="'+f2(gy)+'" stroke="'+RING+'" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>');
      prev.push('<circle cx="'+f2(gx)+'" cy="'+f2(gy)+'" r="'+f2(c*.5*S.newSize)+'" fill="'+S.brush+'" fill-opacity=".3" stroke="'+RING+'" stroke-opacity=".7" stroke-width="1.6" stroke-dasharray="4 5"/>');
    }
    if(!ex&&S.link){
      const L=S.link, fx=L.from.px*c, fy=L.from.py*c;
      const tx=(L.target?L.target.px:L.gx)*c, ty=(L.target?L.target.py:L.gy)*c;
      prev.push('<line x1="'+f2(fx)+'" y1="'+f2(fy)+'" x2="'+f2(tx)+'" y2="'+f2(ty)+'" stroke="'+PAL[2]+'" stroke-width="2.5" stroke-dasharray="4 5" stroke-linecap="round"/>');
      if(L.target) prev.push('<circle cx="'+f2(tx)+'" cy="'+f2(ty)+'" r="'+f2(c*.5+8)+'" fill="none" stroke="'+PAL[2]+'" stroke-width="2.5"/>');
      else if(L.far) prev.push('<circle cx="'+f2(tx)+'" cy="'+f2(ty)+'" r="'+f2(c*.5)+'" fill="none" stroke="'+PAL[2]+'" stroke-width="2" stroke-dasharray="4 5"/>');
    }

    const body=S.lineOver?nodeOut.concat(edgeOut):edgeOut.concat(nodeOut);
    const live=!ex&&S.animText&&(anim==='draw'||anim==='fall');
    const ps=post?blocksSVG({live:live,ink:autoInk(),dist:dist,real:N.filter(n=>n.shape!=='none')}):{back:[],front:[],boxBack:[],boxFront:[],dBack:[],dFront:[]};
    if(!ex&&post&&S.selBlock){
      const sb=byBlock(S.selBlock);
      if(sb){ const r=blockRect(sb); selOut.push('<rect x="'+f2(r.x-6)+'" y="'+f2(r.y-6)+'" width="'+f2(r.w+12)+'" height="'+f2(r.h+12)+'" fill="none" stroke="#e06c47" stroke-width="2" stroke-dasharray="6 5"/>'); }
    }
    if(ex){
      const vb=f2(V.vx)+' '+f2(V.vy)+' '+f2(V.vbW)+' '+f2(V.vbH);
      const wrapSvg=parts=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" width="'+f2(V.vbW)+'" height="'+f2(V.vbH)+'">'+parts.join('')+'</svg>';
      const pageBg=post?[]:['<rect x="'+f2(V.vx)+'" y="'+f2(V.vy)+'" width="'+f2(V.vbW)+'" height="'+f2(V.vbH)+'" fill="'+(S.stageBg||T.bg)+'"/>'];
      return {
        w:V.vbW, h:V.vbH, vx:V.vx, vy:V.vy,
        full:wrapSvg(pageBg.concat(out,ps.back,body,ps.front,labs)),
        back:wrapSvg(pageBg.concat(out,ps.boxBack)),
        front:wrapSvg(body.concat(ps.boxFront)),
        tBack:ps.dBack, tFront:ps.dFront.concat(labD.map(l=>({text:l.text,x:l.x,y:l.y,font:LFONT,fs:l.fs,weight:400,italic:l.italic,ls:0,fill:l.fill,op:l.op,anchor:l.anchor})))
      };
    }
    svg.innerHTML=out.concat(ps.back,body,ps.front,selOut,prev,labs).join('');
  }

  function frame(now){
    if(!alive) return;
    const dt=Math.min(.05,(now-last)/1000); last=now; S.dt=dt;
    const k=reduce?1:1-Math.pow(.0005,dt);
    S.nodes.forEach(n=>{n.dx+=(n.x-n.dx)*k;n.dy+=(n.y-n.dy)*k;});
    if(!S.paused) animT+=dt*S.speed;
    render();
    if(scrubbable()&&!scrubbing) scrub.value=Math.round(S.prog*1000);
    requestAnimationFrame(frame);
  }

  /* ---------- hints ---------- */
  const HINTS={
    move:'Drag a node. Double-click empty space to place a new point.',
    add:'Click anywhere to place a point. Step and Chain are set above.',
    draw:'Press and drag across the canvas: points stay behind and join into a line.',
    link:'Drag from one node to another to connect them. Release on empty space to grow a new branch.',
    delete:'Click a node to remove it. Its children move up to its parent.'
  };
  let ft=null;
  function setHint(){ hintEl.textContent=HINTS[S.tool]; }
  function flash(msg){ hintEl.textContent=msg; clearTimeout(ft); ft=setTimeout(setHint,3200); }

  /* ---------- canvas interaction ---------- */
  function pt(e){
    const m=svg.getScreenCTM().inverse();
    const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m);
    return {x:p.x/CELL,y:p.y/CELL};
  }
  function snapPt(p){ const B=bnd(); return {x:clamp(snapV(p.x),B.x0,B.x1),y:clamp(snapV(p.y),B.y0,B.y1)}; }
  function hitNode(p){
    for(let i=S.nodes.length-1;i>=0;i--){
      const n=S.nodes[i];
      if(Math.hypot(n.px-p.x,n.py-p.y)<Math.max(.34,.5*n.size)*1.12) return n;
    }
    return null;
  }
  function occupied(x,y){ return S.nodes.some(n=>Math.hypot(n.x-x,n.y-y)<.3); }
  function shiftGroup(group,orig,dx,dy){
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    orig.forEach(o=>{minX=Math.min(minX,o.x);maxX=Math.max(maxX,o.x);minY=Math.min(minY,o.y);maxY=Math.max(maxY,o.y);});
    const B=bnd(); dx=clamp(dx,B.x0-minX,B.x1-maxX); dy=clamp(dy,B.y0-minY,B.y1-maxY);
    group.forEach((g,i)=>{g.x=f2(orig[i].x+dx);g.y=f2(orig[i].y+dy);});
    return dx||dy;
  }
  function stepOf(v){ return S.snap>0?Math.round(v/S.snap)*S.snap:v; }
  function addAt(p){
    const s=snapPt(p);
    if(occupied(s.x,s.y)) return;
    const par=S.chain&&S.sel?byId(S.sel):null;
    const n=mk(s.x,s.y,null,S.brush,par?par.id:null,'circle',S.newSize,par);
    buildList(); select(n.id); commit();
  }
  function removeNode(id){
    const n=byId(id); if(!n) return;
    S.nodes.forEach(m=>{ if(m.p===id) m.p=n.p; });
    S.nodes=S.nodes.filter(m=>m.id!==id);
    if(S.sel===id) S.sel=null;
    if(S.hover===id) S.hover=null;
    buildList(); renderInspector(); commit(); hideTip();
  }
  function removeBranch(id){
    const n=byId(id); if(!n) return;
    const ids=new Set(descendants(n).map(m=>m.id));
    S.nodes=S.nodes.filter(m=>!ids.has(m.id));
    if(S.sel&&ids.has(S.sel)) S.sel=null;
    if(S.hover&&ids.has(S.hover)) S.hover=null;
    buildList(); renderInspector(); commit(); hideTip();
  }

  function showTip(n,e){
    const kids=S.nodes.filter(m=>m.p===n.id).length;
    tip.innerHTML='<b>'+(n.name?esc(n.name):'Node '+idxOf(n))+'</b><i>'+(n.v==null?'no value':'value '+esc(f2(n.v)+S.unit))+'</i><i>depth '+depthOf(n)+', children '+kids+'</i>';
    tip.hidden=false;
    const r=stage.getBoundingClientRect();
    tip.style.left=clamp(e.clientX-r.left+14,4,Math.max(4,r.width-170))+'px';
    tip.style.top=clamp(e.clientY-r.top+14,4,Math.max(4,r.height-80))+'px';
  }
  function hideTip(){ tip.hidden=true; }
  function setCursor(hit){
    let cur='default';
    if(S.drag||S.bdrag) cur='grabbing';
    else if(S.tool==='move') cur=hit?'grab':'default';
    else if(S.tool==='link'||S.tool==='draw') cur='crosshair';
    else if(S.tool==='add') cur=hit?'pointer':'copy';
    else if(S.tool==='delete') cur=hit?'pointer':'default';
    svg.style.cursor=cur;
  }

  svg.addEventListener('pointerdown',e=>{
    const p=pt(e), hit=hitNode(p);
    if(e.pointerType!=='mouse'){ S.hover=hit?hit.id:null; if(hit) showTip(hit,e); else hideTip(); }
    if(S.tool==='move'){
      if(hit){
        select(hit.id);
        const group=(S.branchDrag||e.shiftKey)?descendants(hit):[hit];
        S.drag={n:hit,group:group,orig:group.map(g=>({x:g.x,y:g.y})),p0:p,moved:false};
        try{svg.setPointerCapture(e.pointerId);}catch(_){}
        e.preventDefault(); setCursor(hit);
      } else {
        const hb=hitBlock(p.x*CELL,p.y*CELL);
        if(hb){
          selectBlock(hb.id);
          S.bdrag={b:hb,x0:p.x*CELL,y0:p.y*CELL,ox:hb.x,oy:hb.y,moved:false};
          try{svg.setPointerCapture(e.pointerId);}catch(_){}
          e.preventDefault(); setCursor(null);
        } else { select(null); selectBlock(null); }
      }
    } else if(S.tool==='link'){
      if(hit){
        select(hit.id);
        S.link={from:hit,gx:hit.x,gy:hit.y,target:null,far:false};
        try{svg.setPointerCapture(e.pointerId);}catch(_){}
        e.preventDefault();
      } else select(null);
    } else if(S.tool==='add'){
      if(hit) select(hit.id); else addAt(p);
    } else if(S.tool==='draw'){
      let prev=null, made=false;
      if(hit){ select(hit.id); prev=hit; }
      else {
        const s=snapPt(p), par=S.chain&&S.sel?byId(S.sel):null;
        prev=mk(s.x,s.y,null,S.brush,par?par.id:null,'circle',S.newSize,par);
        made=true; S.sel=prev.id; buildList();
      }
      S.paint={prev:prev,made:made};
      S.ghost=null;
      try{svg.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault();
    } else if(S.tool==='delete'){
      if(hit) removeNode(hit.id);
      else { const hb=hitBlock(p.x*CELL,p.y*CELL); if(hb) removeBlock(hb.id); }
    }
  });
  svg.addEventListener('pointermove',e=>{
    const p=pt(e);
    if(S.bdrag){
      const d=S.bdrag;
      d.b.x=Math.round(d.ox+(p.x*CELL-d.x0)); d.b.y=Math.round(d.oy+(p.y*CELL-d.y0)); d.moved=true;
      syncBlockPos(d.b); return;
    }
    if(S.drag){
      const d=S.drag;
      if(shiftGroup(d.group,d.orig,stepOf(p.x-d.p0.x),stepOf(p.y-d.p0.y))) d.moved=true;
      d.group.forEach(syncRow);
      return;
    }
    if(S.paint){
      const P=S.paint, from=P.prev, sp=S.snap>0?Math.max(S.snap,.75):.7;
      if(Math.hypot(p.x-from.x,p.y-from.y)>=sp){
        const s=snapPt(p);
        if(!occupied(s.x,s.y)){
          const n=mk(s.x,s.y,null,S.brush,from.id,'circle',S.newSize,from);
          P.prev=n; P.made=true; S.sel=n.id; buildList();
        }
      }
      return;
    }
    if(S.link){
      const L=S.link, s=snapPt(p), t=hitNode(p);
      L.target=(t&&t!==L.from)?t:null;
      L.gx=s.x; L.gy=s.y;
      L.far=!L.target&&(Math.hypot(s.x-L.from.x,s.y-L.from.y)>.3);
      return;
    }
    if(e.pointerType==='mouse'){
      const hit=hitNode(p);
      S.hover=hit?hit.id:null;
      if(hit) showTip(hit,e); else hideTip();
      S.ghost=((S.tool==='add'||S.tool==='draw')&&!hit)?snapPt(p):null;
      const hb=(!hit&&S.tool==='move')?hitBlock(p.x*CELL,p.y*CELL):null;
      setCursor(hit||hb);
    }
  });
  function endPointer(){
    if(S.bdrag){ const m=S.bdrag.moved; S.bdrag=null; if(m) commit(); }
    if(S.drag){ const m=S.drag.moved; S.drag=null; if(m) commit(); }
    if(S.paint){
      const P=S.paint; S.paint=null;
      if(P.made){ buildList(); select(P.prev.id); commit(); }
    }
    if(S.link){
      const L=S.link; S.link=null;
      if(L.target){
        const a=L.from,b=L.target;
        if(b.p===a.id) flash('Those nodes are already connected.');
        else if(isDesc(b,a)) flash('Can’t do that: it would create a loop.');
        else { b.p=a.id; buildList(); commit(); flash('Node '+idxOf(b)+' is now attached to node '+idxOf(a)+'.'); }
      } else if(L.far && !occupied(L.gx,L.gy)){
        const n=mk(L.gx,L.gy,null,S.brush,L.from.id,'circle',S.newSize,L.from);
        buildList(); select(n.id); commit();
      }
    }
  }
  svg.addEventListener('pointerup',endPointer);
  svg.addEventListener('pointercancel',endPointer);
  svg.addEventListener('pointerleave',e=>{
    if(e.pointerType==='mouse'&&!S.drag&&!S.link&&!S.paint){ S.hover=null; S.ghost=null; hideTip(); }
  });
  svg.addEventListener('dblclick',e=>{
    if(S.tool!=='move') return;
    const p=pt(e); if(hitNode(p)) return;
    const hb=hitBlock(p.x*CELL,p.y*CELL);
    if(hb){ selectBlock(hb.id); const ta=binsp.querySelector('[data-bf="text"]'); if(ta){ ta.focus(); ta.select(); } return; }
    addAt(p);
  });

  /* ---------- keyboard ---------- */
  let active=false;
  const onDocDown=e=>{ active=!!(e.composedPath&&e.composedPath().indexOf(host)>=0); };
  document.addEventListener('pointerdown',onDocDown,true); cleanups.push(()=>document.removeEventListener('pointerdown',onDocDown,true));
  const onKey=e=>{
    if(!active||!alive) return;
    const tg=(e.composedPath&&e.composedPath()[0])||e.target;
    if(/INPUT|TEXTAREA|SELECT/.test(tg.tagName)) return;
    const mod=e.ctrlKey||e.metaKey, k=e.key;
    if(mod&&k.toLowerCase()==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
    if(mod&&k.toLowerCase()==='y'){ e.preventDefault(); redo(); return; }
    const sb=S.selBlock?byBlock(S.selBlock):null;
    if(sb){
      if(k==='Escape'){ selectBlock(null); return; }
      if(k==='Delete'||k==='Backspace'){ e.preventDefault(); removeBlock(sb.id); return; }
      const sp=e.shiftKey?10:1, dd={ArrowLeft:[-sp,0],ArrowRight:[sp,0],ArrowUp:[0,-sp],ArrowDown:[0,sp]}[k];
      if(dd){ e.preventDefault(); sb.x+=dd[0]; sb.y+=dd[1]; syncBlockPos(sb); commit(); return; }
    }
    const n=byId(S.sel); if(!n) return;
    if(k==='Escape'){ select(null); return; }
    if(k==='Delete'||k==='Backspace'){ e.preventDefault(); removeNode(n.id); return; }
    const st=S.snap||.25, dirs={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]};
    if(dirs[k]){
      e.preventDefault();
      const g=(e.shiftKey||S.branchDrag)?descendants(n):[n];
      shiftGroup(g,g.map(m=>({x:m.x,y:m.y})),dirs[k][0],dirs[k][1]);
      g.forEach(syncRow); commit();
    }
  };
  document.addEventListener('keydown',onKey); cleanups.push(()=>document.removeEventListener('keydown',onKey));

  /* ---------- inspector ---------- */
  function shapeIcon(s){
    const i={
      circle:'<circle cx="10" cy="10" r="7" fill="currentColor"/>',
      square:'<rect x="3.5" y="3.5" width="13" height="13" rx="1.8" fill="currentColor"/>',
      ring:'<circle cx="10" cy="10" r="5.6" fill="none" stroke="currentColor" stroke-width="3"/>',
      half:'<path d="M3 13 A7 7 0 0 1 17 13 Z" fill="currentColor"/>',
      bird:'<path d="M1.5 9 Q5.5 2.5 10 8 Q14.5 2.5 18.5 9 Q14.5 8.5 10 14.5 Q5.5 8.5 1.5 9 Z" fill="currentColor"/>',
      leaf:'<path d="M10 17.5 C4.2 14.5 3.8 7.5 10 2.5 C16.2 7.5 15.8 14.5 10 17.5 Z" fill="currentColor"/>',
      triangle:'<polygon points="10,3 17.5,16 2.5,16" fill="currentColor"/>',
      diamond:'<polygon points="10,2.5 17.5,10 10,17.5 2.5,10" fill="currentColor"/>',
      hexagon:'<polygon points="10,2.5 16.5,6.2 16.5,13.8 10,17.5 3.5,13.8 3.5,6.2" fill="currentColor"/>',
      star:'<polygon points="10,1.8 12.12,7.09 17.8,7.47 13.42,11.11 14.82,16.63 10,13.6 5.18,16.63 6.58,11.11 2.2,7.47 7.88,7.09" fill="currentColor"/>',
      cross:'<polygon points="8,3 12,3 12,8 17,8 17,12 12,12 12,17 8,17 8,12 3,12 3,8 8,8" fill="currentColor"/>',
      none:'<circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/>'
    }[s];
    return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">'+i+'</svg>';
  }
  function renderInspector(){
    const n=byId(S.sel);
    if(!n){ insp.innerHTML='<p class="hint" style="margin:0">Select a node on the canvas or in the list to edit its shape, size and path.</p>'; return; }
    const path=[]; let c=n,g=0;
    while(c&&g++<100){ path.unshift(idxOf(c)); c=c.p?byId(c.p):null; }
    const dn=descendants(n).length-1;
    const note=S.shapeMode!=='mixed'?'<p class="hint" style="margin:0 0 8px">Shapes are currently set by the global style. Picking one below switches to “Per node”.</p>':'';
    insp.innerHTML=
      '<div class="irow"><b>Node '+idxOf(n)+'</b><span class="mute">path '+path.join(' → ')+', descendants '+dn+'</span></div>'+
      '<label class="field" style="margin-bottom:10px"><span>Name</span><input type="text" data-i="name" maxlength="24" placeholder="e.g. First frost" value="'+esc(n.name)+'"></label>'+
      '<div class="grid2">'+
        '<label class="field"><span>Value</span><input type="number" step="any" data-i="v" value="'+(n.v==null?'':n.v)+'" placeholder="—"></label>'+
        '<label class="field"><span>Colour</span><input type="color" data-i="color" value="'+n.color+'" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"></label>'+
      '</div>'+
      '<div class="lab mt">Shape</div>'+note+
      '<div class="shapes">'+SHAPES.map(s=>'<button type="button" class="shp" data-shape="'+s+'" aria-label="'+SHAPE_NAMES[s]+'" title="'+SHAPE_NAMES[s]+'" aria-pressed="'+(n.shape===s)+'">'+shapeIcon(s)+'</button>').join('')+'</div>'+
      '<label class="field"><span>Size</span><input type="range" min="0.5" max="1.6" step="0.05" data-i="size" value="'+n.size+'"></label>'+
      '<div class="btns"><button type="button" data-iact="unlink">Detach from parent</button><button type="button" data-iact="delbranch">Delete branch</button></div>';
  }
  insp.addEventListener('input',e=>{
    const t=e.target, f=t.dataset.i, n=byId(S.sel); if(!n||!f) return;
    if(f==='name') n.name=t.value;
    else if(f==='v') n.v=t.value===''?null:parseFloat(t.value);
    else if(f==='color') n.color=t.value;
    else if(f==='size') n.size=parseFloat(t.value);
    syncRow(n);
  });
  insp.addEventListener('change',e=>{ if(e.target.dataset.i) commit(); });
  insp.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    const n=byId(S.sel); if(!n) return;
    if(b.dataset.shape){
      n.shape=b.dataset.shape;
      if(S.shapeMode!=='mixed'){ S.shapeMode='mixed'; syncSettings(); flash('Shapes are now set per node.'); }
      renderInspector(); commit();
    }
    else if(b.dataset.iact==='unlink'){ n.p=null; buildList(); renderInspector(); commit(); }
    else if(b.dataset.iact==='delbranch'){ removeBranch(n.id); }
  });

  /* ---------- node list ---------- */
  function parentIndex(n){ return n.p?S.nodes.findIndex(m=>m.id===n.p)+1:''; }
  function rowHTML(n,i){
    const v=n.v==null?'':n.v;
    return '<div class="nrow'+(S.sel===n.id?' sel':'')+'" data-id="'+n.id+'">'+
      '<button class="idx" type="button" data-act="sel" aria-label="Select node '+(i+1)+'">'+(i+1)+'</button>'+
      '<input type="color" data-f="color" value="'+n.color+'" aria-label="Colour of node '+(i+1)+'">'+
      '<input type="number" step="any" data-f="x" value="'+n.x+'" aria-label="x of node '+(i+1)+'">'+
      '<input type="number" step="any" data-f="y" value="'+n.y+'" aria-label="y of node '+(i+1)+'">'+
      '<input type="number" step="any" data-f="v" value="'+v+'" placeholder="—" aria-label="Value of node '+(i+1)+'">'+
      '<input type="number" min="1" step="1" data-f="p" value="'+parentIndex(n)+'" placeholder="—" aria-label="Link of node '+(i+1)+'">'+
      '<button class="del" type="button" data-act="del" aria-label="Delete node '+(i+1)+'">×</button></div>';
  }
  function buildList(){ list.innerHTML=S.nodes.map(rowHTML).join(''); }
  function rowOf(id){ return list.querySelector('[data-id="'+id+'"]'); }
  function setIf(el,val){ if(el&&root.activeElement!==el) el.value=val; }
  function syncRow(n){
    const r=rowOf(n.id); if(!r) return;
    setIf(r.querySelector('[data-f="x"]'),n.x);
    setIf(r.querySelector('[data-f="y"]'),n.y);
    setIf(r.querySelector('[data-f="v"]'),n.v==null?'':n.v);
    setIf(r.querySelector('[data-f="color"]'),n.color);
  }
  function select(id){
    S.sel=id;
    if(id!=null){ if(S.selBlock){ S.selBlock=null; renderBlockList(); renderBlockEditor(); } setTab('graph'); }
    Array.prototype.forEach.call(list.children,r=>{ r.classList.toggle('sel',+r.dataset.id===id); });
    renderInspector();
  }
  list.addEventListener('input',e=>{
    const t=e.target, row=t.closest('.nrow'); if(!row) return;
    const n=byId(+row.dataset.id), f=t.dataset.f; if(!n||!f) return;
    if(f==='color') n.color=t.value;
    else if(f==='x'||f==='y'){ const v=parseFloat(t.value); if(!isNaN(v)){ const B=bnd(); n[f]=f==='x'?clamp(v,B.x0,B.x1):clamp(v,B.y0,B.y1); } }
    else if(f==='v') n.v=t.value===''?null:parseFloat(t.value);
    if(S.sel===n.id&&f!=='p') renderInspector();
  });
  list.addEventListener('change',e=>{
    const t=e.target, row=t.closest('.nrow'); if(!row||!t.dataset.f) return;
    const n=byId(+row.dataset.id);
    if(t.dataset.f==='p'){
      const val=parseInt(t.value,10);
      if(!t.value) n.p=null;
      else {
        const m=S.nodes[val-1];
        if(m&&m!==n&&!isDesc(n,m)) n.p=m.id; else t.value=parentIndex(n);
      }
      renderInspector();
    }
    commit();
  });
  list.addEventListener('focusin',e=>{
    const row=e.target.closest('.nrow');
    if(row&&S.sel!==+row.dataset.id) select(+row.dataset.id);
  });
  list.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    const id=+b.closest('.nrow').dataset.id;
    if(b.dataset.act==='sel') select(id);
    if(b.dataset.act==='del') removeNode(id);
  });
  $('add').addEventListener('click',()=>{
    const par=(S.sel&&byId(S.sel))||S.nodes[S.nodes.length-1]||null;
    const occ=new Set(S.nodes.map(n=>n.x+','+n.y));
    const dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2]];
    let x=rint(0,S.cols), y=rint(0,S.rows);
    if(par){
      for(let i=0;i<dirs.length;i++){
        const nx=par.x+dirs[i][0], ny=par.y+dirs[i][1];
        if(nx>=0&&ny>=0&&nx<=S.cols&&ny<=S.rows&&!occ.has(nx+','+ny)){x=nx;y=ny;break;}
      }
    }
    const n=mk(x,y,null,S.brush,par?par.id:null,'circle',S.newSize,par);
    buildList(); select(n.id); commit();
    const r=rowOf(n.id); if(r&&r.scrollIntoView) r.scrollIntoView({block:'nearest'});
  });

  /* ---------- palette ---------- */
  const chips=$('chips');
  function buildChips(keepEditor){
    chips.innerHTML=PAL.map(c=>'<button type="button" class="chip" data-c="'+c+'" style="background:'+c+'" aria-label="Colour '+c+'" aria-pressed="'+(S.brush===c)+'"></button>').join('');
    if(!keepEditor) renderPalEditor();
  }
  function renderPalEditor(){
    const el=$('palEd'); if(!el) return;
    el.innerHTML=PAL.map((c,i)=>'<input type="color" data-pi="'+i+'" value="'+c+'" aria-label="Palette colour '+(i+1)+'" style="width:34px;height:30px;padding:0;border:1px solid var(--rule);border-radius:4px;background:none">').join('');
  }
  function setPaletteColor(i,c){
    const old=PAL[i]; if(old===c) return;
    PAL[i]=c; S.nodes.forEach(n=>{ if(n.color===old) n.color=c; });
    if(S.brush===old) S.brush=c;
    buildChips(true); buildList();
  }
  $('palEd').addEventListener('input',e=>{ const i=e.target.dataset.pi; if(i!=null) setPaletteColor(+i,e.target.value); });
  $('palEd').addEventListener('change',()=>commit());
  chips.addEventListener('click',e=>{
    const b=e.target.closest('.chip'); if(!b) return;
    S.brush=b.dataset.c;
    const n=byId(S.sel);
    if(n){ n.color=S.brush; syncRow(n); renderInspector(); commit(); }
    buildChips();
  });

  /* ---------- controls ---------- */
  function syncSettings(){
    $('cols').value=f2(S.cols); $('rows').value=f2(S.rows); $('gridMode').value=S.gridMode; $('edge').value=S.edge; $('dash').value=S.dash;
    $('shapeMode').value=S.shapeMode; $('fillMode').value=S.fillMode; $('amp').value=S.waveAmp;
    $('line').checked=S.line; $('lineOver').checked=S.lineOver; $('labels').checked=S.labels; $('size').checked=S.sizeByValue;
    $('focus').checked=S.focus; $('lw').value=S.lineW; $('anim').value=S.anim; $('speed').value=S.speed; $('loop').checked=S.loop;
    $('snap').value=String(S.snap); $('tChain').setAttribute('aria-pressed',String(S.chain));
    $('frame').value=fmtKey(); $('pAnim').checked=S.animText;
    $('lineHex').value=S.lineHex; $('arrows').checked=S.arrows; $('arrowSize').value=S.arrowSize; $('labelPos').value=S.labelPos; $('newSize').value=S.newSize;
    $('gradEnd').value=S.gradEnd; $('gradAngle').value=S.gradAngle; $('labelColor').value=S.labelColor||(S.frame==='post'?autoInk():THEMES[S.theme].label); $('stageBg').value=S.stageBg||THEMES[S.theme].bg;
    $('pgColor').value=S.gridCol||S.pgrid.color; $('pgW').value=S.pgrid.w; $('pgSize').value=Math.round(S.pgrid.cw);
    renderBgEditor(); renderBlockList(); renderBlockEditor();
    $('theme').value=S.theme; $('lineColor').value=S.lineColor; $('lblSize').value=S.lblScale; $('unit').value=S.unit; $('capOn').checked=S.capOn; $('capTin').value=S.capT; $('capSin').value=S.capS;
    syncCaption();
    scrub.disabled=!scrubbable();
  }
  const on=(id,ev,fn)=>$(id).addEventListener(ev,fn);
  on('cols','input',e=>{const v=parseInt(e.target.value,10);if(v>=3&&v<=12)S.cols=v;});
  on('rows','input',e=>{const v=parseInt(e.target.value,10);if(v>=3&&v<=12)S.rows=v;});
  on('cols','change',commit); on('rows','change',commit);
  on('gridMode','change',e=>{S.gridMode=e.target.value;});
  on('edge','change',e=>{S.edge=e.target.value;});
  on('dash','change',e=>{S.dash=e.target.value;});
  on('shapeMode','change',e=>{S.shapeMode=e.target.value;renderInspector();});
  on('fillMode','change',e=>{S.fillMode=e.target.value;});
  on('amp','input',e=>{S.waveAmp=parseFloat(e.target.value);});
  on('line','change',e=>{S.line=e.target.checked;});
  on('lineOver','change',e=>{S.lineOver=e.target.checked;});
  on('labels','change',e=>{S.labels=e.target.checked;});
  on('size','change',e=>{S.sizeByValue=e.target.checked;});
  on('focus','change',e=>{S.focus=e.target.checked;});
  on('theme','change',e=>{applyTheme(e.target.value,true);renderInspector();commit();});
  on('unit','input',e=>{S.unit=e.target.value;});
  on('lineColor','change',e=>{S.lineColor=e.target.value;});
  on('frame','change',e=>setFormat(e.target.value));
  on('pAnim','change',e=>{S.animText=e.target.checked;});
  on('lineHex','input',e=>{S.lineHex=e.target.value; S.lineColor='custom'; $('lineColor').value='custom';});
  on('arrows','change',e=>{S.arrows=e.target.checked;});
  on('arrowSize','input',e=>{S.arrowSize=parseFloat(e.target.value);});
  on('labelPos','change',e=>{S.labelPos=e.target.value;});
  on('gradEnd','input',e=>{S.gradEnd=e.target.value; if(S.fillMode!=='gradient'){ S.fillMode='gradient'; $('fillMode').value='gradient'; }});
  on('gradAngle','input',e=>{S.gradAngle=parseFloat(e.target.value);});
  on('labelColor','input',e=>{S.labelColor=e.target.value;});
  on('labelColorAuto','click',()=>{S.labelColor=null; syncSettings();});
  on('stageBg','input',e=>{S.stageBg=e.target.value; applyStage();});
  on('stageBgAuto','click',()=>{S.stageBg=null; applyStage(); syncSettings();});
  on('newSize','input',e=>{S.newSize=parseFloat(e.target.value);});
  on('lblSize','input',e=>{S.lblScale=parseFloat(e.target.value);});
  on('capOn','change',e=>{S.capOn=e.target.checked;syncCaption();});
  on('capTin','input',e=>{S.capT=e.target.value;syncCaption();});
  on('capSin','input',e=>{S.capS=e.target.value;syncCaption();});
  on('lw','input',e=>{S.lineW=parseFloat(e.target.value);});
  on('speed','input',e=>{S.speed=parseFloat(e.target.value);});
  on('loop','change',e=>{S.loop=e.target.checked;animT=0;});
  on('anim','change',e=>{S.anim=e.target.value;animT=0;scrub.disabled=!scrubbable();});
  on('replay','click',()=>{
    if(!scrubbable()){ S.anim='draw'; $('anim').value='draw'; } scrub.disabled=false;
    animT=0; S.paused=false; $('play').textContent='Pause';
  });
  on('play','click',()=>{
    if(S.paused&&S.anim==='draw'&&!S.loop&&S.prog>=1) animT=0;
    S.paused=!S.paused; $('play').textContent=S.paused?'Play':'Pause';
  });
  scrub.addEventListener('pointerdown',()=>{scrubbing=true;});
  ['pointerup','pointercancel','change','blur'].forEach(ev=>scrub.addEventListener(ev,()=>{scrubbing=false;}));
  scrub.addEventListener('input',()=>{
    S.paused=true; $('play').textContent='Play';
    animT=(scrub.value/1000)*S.tl/3;
  });

  root.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{
    S.tool=b.dataset.tool;
    root.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    S.link=null; S.drag=null; S.paint=null; S.ghost=null; setHint(); setCursor(null);
  }));
  on('snap','change',e=>{S.snap=parseFloat(e.target.value);});
  on('tChain','click',e=>{ S.chain=!S.chain; e.currentTarget.setAttribute('aria-pressed',String(S.chain)); });
  on('tBranch','click',e=>{ S.branchDrag=!S.branchDrag; e.currentTarget.setAttribute('aria-pressed',String(S.branchDrag)); });
  on('undo','click',undo); on('redo','click',redo);

  root.querySelectorAll('[data-look]').forEach(b=>b.addEventListener('click',()=>applyLook(b.dataset.look)));
  root.querySelectorAll('[data-layout]').forEach(b=>b.addEventListener('click',()=>layout(b.dataset.layout)));
  on('jitter','click',jitter);
  on('flipH','click',()=>flip('h'));
  on('flipV','click',()=>flip('v'));
  on('recolor','click',()=>recolor($('recolorMode').value));

  on('seed','input',e=>{const v=parseInt(e.target.value,10);if(v>0)S.seed=v;});
  on('count','input',e=>{S.count=+e.target.value;$('countOut').textContent=S.count;});
  on('branchy','input',e=>{S.branchy=parseFloat(e.target.value);});
  on('gen','click',generate);
  on('newSeed','click',()=>{S.seed=rint(1,9999);$('seed').value=S.seed;generate();});
  on('clearAll','click',clearAll);

  on('build','click',fromSeries);
  on('pAutumn','click',loadAutumn);
  on('pMigr','click',loadMigration);
  on('pPoster','click',loadPoster);
  on('pPosterV1','click',loadPosterV1);
  on('pConst','click',loadConst);
  on('pRef','click',loadRef);


  /* ---------- tabs ---------- */
  function setTab(t){
    root.querySelectorAll('[data-tabbtn]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tabbtn===t)));
    root.querySelectorAll('.panel [data-tab]').forEach(el=>{ el.hidden=el.dataset.tab!==t; });
  }
  root.querySelectorAll('[data-tabbtn]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tabbtn)));

  /* ---------- background editor ---------- */
  const BG_PRESETS={
    sunset:()=>defBg(),
    sky:()=>({type:'gradient',angle:180,stops:[{p:0,c:'#a7cadc'},{p:1,c:'#eaf3f7'}]}),
    night:()=>({type:'gradient',angle:180,stops:[{p:0,c:'#0f1a2b'},{p:1,c:'#34507a'}]}),
    paper:()=>({type:'solid',angle:180,stops:[{p:0,c:'#efe8d5'}]}),
    mint:()=>({type:'gradient',angle:160,stops:[{p:0,c:'#d8f0e4'},{p:1,c:'#8fcfb0'}]}),
    mono:()=>({type:'solid',angle:180,stops:[{p:0,c:'#e8e8e6'}]})
  };
  function renderBgEditor(){
    const B=S.bg;
    $('bgType').value=B.type; $('bgAngle').value=B.angle; $('bgAngleOut').textContent=B.angle;
    $('bgAngle').disabled=B.type!=='gradient';
    const box=$('bgStops');
    if(B.type==='none'){ box.innerHTML='<p class="hint" style="margin:0">No background fill.</p>'; $('bgAdd').disabled=true; return; }
    $('bgAdd').disabled=B.type!=='gradient';
    const stops=B.type==='solid'?B.stops.slice(0,1):B.stops;
    box.innerHTML=stops.map((q,i)=>'<div class="stoprow" data-i="'+i+'"><input type="color" data-sf="c" value="'+q.c+'" aria-label="Stop '+(i+1)+' colour">'+
      '<label class="field" style="gap:0"><span style="font-size:12px">'+(B.type==='solid'?'Colour':'Position '+Math.round(q.p*100)+'%')+'</span>'+(B.type==='solid'?'':'<input type="range" min="0" max="100" step="1" data-sf="p" value="'+Math.round(q.p*100)+'" aria-label="Stop '+(i+1)+' position">')+'</label>'+
      '<button type="button" class="del" data-sdel="'+i+'" aria-label="Remove stop '+(i+1)+'"'+(B.type==='gradient'&&B.stops.length<=2?' disabled':'')+'>×</button></div>').join('');
  }
  $('bgStops').addEventListener('input',e=>{
    const row=e.target.closest('.stoprow'); if(!row) return;
    const q=S.bg.stops[+row.dataset.i], f=e.target.dataset.sf; if(!q) return;
    if(f==='c') q.c=e.target.value;
    else if(f==='p'){ q.p=clamp(parseFloat(e.target.value)/100,0,1); const sp=row.querySelector('span'); if(sp) sp.textContent='Position '+Math.round(q.p*100)+'%'; }
  });
  $('bgStops').addEventListener('change',()=>commit());
  $('bgStops').addEventListener('click',e=>{
    const b=e.target.closest('[data-sdel]'); if(!b||S.bg.stops.length<=2) return;
    S.bg.stops.splice(+b.dataset.sdel,1); renderBgEditor(); commit();
  });
  $('bgAdd').addEventListener('click',()=>{
    const st=S.bg.stops.slice().sort((a,b)=>a.p-b.p); let gap=0, at=.5;
    for(let i=0;i<st.length-1;i++){ const d=st[i+1].p-st[i].p; if(d>gap){gap=d; at=(st[i].p+st[i+1].p)/2;} }
    S.bg.stops.push({p:at,c:st[Math.floor(st.length/2)].c}); renderBgEditor(); commit();
  });
  $('bgType').addEventListener('change',e=>{
    S.bg.type=e.target.value;
    if(S.bg.type==='gradient'&&S.bg.stops.length<2) S.bg.stops.push({p:1,c:'#ffffff'});
    renderBgEditor(); commit();
  });
  $('bgAngle').addEventListener('input',e=>{ S.bg.angle=parseFloat(e.target.value); $('bgAngleOut').textContent=S.bg.angle; });
  $('bgAngle').addEventListener('change',()=>commit());
  root.querySelectorAll('[data-bgp]').forEach(b=>b.addEventListener('click',()=>{ S.bg=BG_PRESETS[b.dataset.bgp](); renderBgEditor(); commit(); }));
  $('pgColor').addEventListener('input',e=>{ S.pgrid.color=e.target.value; S.gridCol=e.target.value; });
  $('pgW').addEventListener('input',e=>{ S.pgrid.w=parseFloat(e.target.value); });
  $('pgSize').addEventListener('input',e=>{ const v=parseFloat(e.target.value); if(v>=20&&v<=400){ S.pgrid.cw=v; S.pgrid.ch=v; } });
  ['pgColor','pgW','pgSize'].forEach(id=>$(id).addEventListener('change',()=>commit()));

  /* ---------- text blocks ---------- */
  const blockList=$('blockList'), binsp=$('binsp');
  const ANIMS=[['none','None'],['fade','Fade in'],['rise','Rise and fade'],['slide','Slide in from left'],['wipe','Wipe (left to right)'],['type','Typewriter']];
  function renderBlockList(){
    blockList.innerHTML=S.blocks.length?S.blocks.map(b=>{
      const first=String(b.text||'').split('\n')[0]||'(empty)';
      return '<button type="button" class="bitem'+(S.selBlock===b.id?' sel':'')+'" data-bid="'+b.id+'"><span>'+esc(first.slice(0,34))+'</span><i>'+(b.layer==='back'?'behind':'')+(b.locked?' · locked':'')+'</i></button>';
    }).join(''):'<p class="hint" style="margin:0">No text yet. Choose a poster format, then “Add text”.</p>';
  }
  blockList.addEventListener('click',e=>{ const b=e.target.closest('[data-bid]'); if(b) selectBlock(+b.dataset.bid); });
  function selectBlock(id){
    S.selBlock=id;
    if(id!=null){ S.sel=null; Array.prototype.forEach.call(list.children,r=>r.classList.remove('sel')); renderInspector(); setTab('poster'); }
    renderBlockList(); renderBlockEditor();
    if(id!=null&&binsp.scrollIntoView) binsp.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function removeBlock(id){
    S.blocks=S.blocks.filter(b=>b.id!==id); if(S.selBlock===id) S.selBlock=null;
    renderBlockList(); renderBlockEditor(); commit();
  }
  function syncBlockPos(b){
    if(S.selBlock!==b.id) return;
    const xi=binsp.querySelector('[data-bf="x"]'), yi=binsp.querySelector('[data-bf="y"]');
    if(xi&&root.activeElement!==xi) xi.value=b.x;
    if(yi&&root.activeElement!==yi) yi.value=b.y;
  }
  function renderBlockEditor(){
    const b=byBlock(S.selBlock);
    if(!b){ binsp.innerHTML='<p class="hint" style="margin:0">Select a text on the poster or in the list above to change its words, font, size, colour, position and animation.</p>'; return; }
    const sel=(f,opts,val)=>'<select data-bf="'+f+'">'+opts.map(o=>'<option value="'+o[0]+'"'+(String(o[0])===String(val)?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
    const num=(f,val,step,extra)=>'<input type="number" data-bf="'+f+'" value="'+val+'" step="'+(step||1)+'"'+(extra||'')+'>';
    const fld=(label,html,full)=>'<label class="field"'+(full?' style="grid-column:1/-1"':'')+'><span>'+label+'</span>'+html+'</label>';
    const chk=(f,label,val)=>'<label class="check"><input type="checkbox" data-bf="'+f+'"'+(val?' checked':'')+'> '+label+'</label>';
    const an=b.anim, bx=b.box;
    binsp.innerHTML=
      fld('Text (one row per line)','<textarea data-bf="text" rows="4">'+esc(b.text)+'</textarea>',true).replace('<label class="field"','<label class="field" style="grid-column:1/-1;margin-bottom:10px"')+
      '<div class="grid2">'+
        fld('Font',sel('font',Object.keys(FONTS).map(k=>[k,FONTS[k].label]),b.font))+
        fld('Size, px',num('fs',b.fs,1,' min="6" max="900"'))+
        fld('Colour','<span style="display:flex;gap:6px"><input type="color" data-bf="color" value="'+(b.color||autoInk())+'" style="flex:1;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)"><button type="button" data-bact="autocolor" title="Follow the background automatically">Auto</button></span>')+
        fld('Align',sel('align',[['start','Left'],['middle','Centre']],b.align))+
        fld('Letter spacing, px',num('ls',b.ls,0.1))+
        fld('Line height ×',num('lh',b.lh,0.02,' min="0.4" max="3"'))+
        fld('X, px',num('x',Math.round(b.x*100)/100,1))+
        fld('Y, px (top of text)',num('y',Math.round(b.y*100)/100,1))+
        fld('Layer',sel('layer',[['front','Above the graph'],['back','Behind the graph']],b.layer))+
        fld('Control id (optional)','<input type="text" data-bf="role" value="'+esc(b.role||'')+'" placeholder="e.g. title">')+
        fld('Italic row (0 = none)',num('it',b.it+1,1,' min="0" max="20"'))+
      '</div>'+
      '<div class="subcheck">'+chk('bold','Bold',b.bold)+chk('upper','UPPERCASE',b.upper)+chk('locked','Lock position',b.locked)+'</div>'+
      '<div class="lab mt">Animation</div>'+
      '<div class="grid2">'+
        fld('Type',sel('anim',ANIMS,an))+
        fld('Delay, s',num('delay',b.delay,0.05,' min="0"'))+
        ((an==='wipe'||an==='type')?fld('Speed, characters/s',num('cps',b.cps,5,' min="5"')):'')+
        ((an==='fade'||an==='rise')?fld('Delay between rows, s',num('stagger',b.stagger,0.05,' min="0"')):'')+
      '</div>'+
      '<div class="subcheck">'+chk('sync','Appear when the path reaches it',b.sync)+'</div>'+
      '<div class="lab mt">Background box</div>'+
      '<div class="subcheck">'+'<label class="check"><input type="checkbox" data-bact="boxToggle"'+(bx?' checked':'')+'> Show a box behind the text</label></div>'+
      (bx?'<div class="subcheck"><label class="check"><input type="checkbox" data-bact="gradToggle"'+(bx.fill2?' checked':'')+'> Gradient fill</label></div><div class="grid2">'+
        fld(bx.fill2?'Colour 1':'Box colour','<input type="color" data-bf="box.fill" value="'+bx.fill+'" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)">')+
        (bx.fill2?fld('Colour 2','<input type="color" data-bf="box.fill2" value="'+bx.fill2+'" style="width:100%;height:32px;padding:2px;border:1px solid var(--rule);border-radius:4px;background:var(--field)">')+fld('Gradient angle',num('box.angle',bx.angle==null?180:bx.angle,5)):'')+
        fld('Minimum width, px',num('box.minW',bx.minW||0,1,' min="0"'))+
        fld('Padding left/right',num('padx',bx.l,1,' min="0"'))+
        fld('Padding top/bottom',num('pady',bx.t,1,' min="0"'))+
        fld('Corner radius, px',num('box.radius',bx.radius||0,1,' min="0"'))+
        fld('Opacity (0–1)',num('box.op',bx.op==null?1:bx.op,0.05,' min="0" max="1"'))+
      '</div>':'');
  }
  function setBf(b,key,el){
    const v=el.type==='checkbox'?el.checked:el.value;
    const numF=['fs','ls','lh','x','y','delay','cps','stagger'];
    if(key==='it'){ b.it=(parseInt(v,10)||0)-1; return; }
    if(key==='padx'){ if(b.box){ const n=parseFloat(v)||0; b.box.l=n; b.box.r=n; } return; }
    if(key==='pady'){ if(b.box){ const n=parseFloat(v)||0; b.box.t=n; b.box.b=n; } return; }
    if(key.startsWith('box.')){ if(b.box) b.box[key.slice(4)]=(key==='box.fill'||key==='box.fill2')?v:(parseFloat(v)||0); return; }
    if(numF.indexOf(key)>=0){ const n=parseFloat(v); if(!isNaN(n)) b[key]=n; return; }
    b[key]=v;
  }
  binsp.addEventListener('input',e=>{
    const b=byBlock(S.selBlock), key=e.target.dataset.bf; if(!b||!key) return;
    if(e.target.tagName==='SELECT'||e.target.type==='checkbox') return;
    setBf(b,key,e.target); if(key==='text') renderBlockList();
  });
  binsp.addEventListener('change',e=>{
    const b=byBlock(S.selBlock), key=e.target.dataset.bf; if(!b||!key) return;
    setBf(b,key,e.target);
    if(key==='anim'||key==='locked'||key==='layer'||key==='text') { renderBlockEditor(); renderBlockList(); }
    commit();
  });
  binsp.addEventListener('click',e=>{
    const b=byBlock(S.selBlock); if(!b) return;
    const a=e.target.closest('[data-bact]'); if(!a) return;
    if(a.dataset.bact==='autocolor'){ b.color=null; renderBlockEditor(); commit(); }
    if(a.dataset.bact==='gradToggle'){ if(b.box) b.box.fill2=a.checked?(b.box.fill2||'#ffffff'):null; renderBlockEditor(); commit(); }
    if(a.dataset.bact==='boxToggle'){ b.box=a.checked?(b.box||{fill:'#f3f14d',l:18,t:12,r:18,b:12,minW:0}):null; renderBlockEditor(); commit(); }
  });
  function addBlock(dup){
    if(S.frame!=='post'){ S.artW=1080; S.artH=1350; switchFrame('post'); }
    const src=dup&&byBlock(S.selBlock);
    const b=src?mkBlock(Object.assign(JSON.parse(JSON.stringify(src)),{id:undefined,x:src.x+30,y:src.y+30,locked:false}))
               :mkBlock({text:'New text',x:Math.round(S.artW*.1),y:Math.round(S.artH*.12),fs:Math.round(S.artW/24),anim:'fade'});
    selectBlock(b.id); commit();
  }
  $('bAdd').addEventListener('click',()=>addBlock(false));
  $('bDup').addEventListener('click',()=>{ if(byBlock(S.selBlock)) addBlock(true); });
  $('bDel').addEventListener('click',()=>{ if(S.selBlock) removeBlock(S.selBlock); });

  /* ---------- project save / load, autosave ---------- */
  const SKEYS=['cols','rows','gridMode','edge','dash','waveAmp','lineOver','line','labels','sizeByValue','shapeMode','fillMode','snap','chain','lineW','anim','speed','loop','focus','frame','artW','artH','newSize','lineColor','lineHex','arrows','arrowSize','labelPos','gradEnd','gradAngle','labelColor','stageBg','gridCol','animText','theme','unit','lblScale','capOn','capT','capS','legend','legendT','seed','count','branchy'];
  function serialize(){
    const o={v:1,s:{}};
    SKEYS.forEach(k=>{ o.s[k]=S[k]; });
    o.nodes=S.nodes.map(n=>({id:n.id,x:n.x,y:n.y,v:n.v,color:n.color,p:n.p,shape:n.shape,size:n.size,name:n.name}));
    o.pal=PAL.slice(); o.nextId=S.nextId; o.blocks=S.blocks; o.nextBlock=S.nextBlock; o.bg=S.bg; o.pgrid=S.pgrid;
    return o;
  }
  function deserialize(o){
    if(!o||!o.s||!Array.isArray(o.nodes)) throw new Error('This file is not a project.');
    Object.keys(o.s).forEach(k=>{ if(SKEYS.indexOf(k)>=0) S[k]=o.s[k]; });
    syncFrame();
    if(THEMES[S.theme]) applyTheme(S.theme,false);
    if(o.pal) o.pal.forEach((c,i)=>{ PAL[i]=c; });
    S.nodes=[]; S.nextId=1; S.sel=null; S.hover=null;
    o.nodes.forEach(d=>{ const n=mk(d.x,d.y,d.v,d.color,d.p,d.shape,d.size); n.id=d.id; n.name=d.name||''; });
    S.nextId=o.nextId||(S.nodes.reduce((m,n)=>Math.max(m,n.id+1),1));
    S.blocks=(o.blocks||[]).map(b=>Object.assign({},b)); S.nextBlock=o.nextBlock||(S.blocks.reduce((m,b)=>Math.max(m,b.id+1),1)); S.selBlock=null;
    S.bg=o.bg||defBg(); S.pgrid=o.pgrid||defPgrid();
    afterLoad();
  }
  const KEY=opts.storageKey; let lastSaved='';
  function autosave(){
    try{ const j=JSON.stringify(serialize()); if(j!==lastSaved){ localStorage.setItem(KEY,j); lastSaved=j; } }catch(_){}
  }
  function loadSaved(){
    try{ const j=localStorage.getItem(KEY); if(!j) return false; deserialize(JSON.parse(j)); lastSaved=j; return true; }catch(_){ return false; }
  }

  /* ---------- export ---------- */
  const exMsg=$('exMsg');
  const say=t=>{ exMsg.textContent=t; };
  async function downloadsApi(){
    try{ return (window.claude&&window.claude.use)?await window.claude.use('downloads'):null; }catch(_){ return null; }
  }
  function overlay(msg,node){
    $('ovMsg').textContent=msg; const body=$('ovBody'); body.innerHTML=''; body.appendChild(node); $('overlay').hidden=false;
  }
  $('ovClose').addEventListener('click',()=>{ $('overlay').hidden=true; });
  async function saveFile(name,data,fallback){
    if(opts.onDownload){ opts.onDownload({filename:name,data:data}); say('Exported '+name+'.'); return; }
    const d=await downloadsApi();
    if(d){
      try{ await d.save({filename:name,data:data}); say('Saved '+name+'.'); }
      catch(err){ say(err&&err.code==='declined'?'Save cancelled.':'Could not save: '+((err&&err.message)||err)); }
      return;
    }
    try{
      const blob=data instanceof Blob?data:new Blob([data],{type:/\.svg$/.test(name)?'image/svg+xml':'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),4000); say('Saved '+name+'.'); return;
    }catch(_){}
    fallback&&fallback();
  }
  function scene(){ EXPORTING=true; try{ return render({}); } finally{ EXPORTING=false; } }
  async function loadFonts(list){
    const seen=new Set();
    const jobs=[];
    list.forEach(d=>{ const f=(d.italic?'italic ':'')+d.weight+' '+d.fs+'px '+d.font; if(!seen.has(f)){ seen.add(f); jobs.push(document.fonts.load(f,d.text).catch(()=>{})); } });
    await Promise.all(jobs);
  }
  function drawTexts(ctx,list,sc,k){
    ctx.setTransform(k,0,0,k,-sc.vx*k,-sc.vy*k);
    list.forEach(d=>{
      ctx.font=(d.italic?'italic ':'')+d.weight+' '+d.fs+'px '+d.font;
      ctx.fillStyle=d.fill; ctx.globalAlpha=d.op==null?1:d.op; ctx.textBaseline='alphabetic'; ctx.textAlign='left';
      const ls=d.ls||0, native=('letterSpacing' in ctx);
      if(native) ctx.letterSpacing=ls+'px';
      let x=d.x;
      if(d.anchor==='middle') x=d.x-(ctx.measureText(d.text).width+(native?0:d.text.length*ls))/2;
      if(native||!ls) ctx.fillText(d.text,x,d.y);
      else { let cx=x; for(const ch of d.text){ ctx.fillText(ch,cx,d.y); cx+=ctx.measureText(ch).width+ls; } }
    });
    ctx.globalAlpha=1; ctx.setTransform(1,0,0,1,0,0);
  }
  async function exportPng(k){
    const sc=scene();
    await loadFonts(sc.tBack.concat(sc.tFront));
    const W=Math.round(sc.w*k), H=Math.round(sc.h*k);
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const ctx=cv.getContext('2d');
    const drawSvg=src=>new Promise((res,rej)=>{
      const im=new Image();
      im.onload=()=>{ ctx.drawImage(im,0,0,W,H); res(); };
      im.onerror=()=>rej(new Error('Could not render the picture.'));
      im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(src);
    });
    await drawSvg(sc.back); drawTexts(ctx,sc.tBack,sc,k);
    await drawSvg(sc.front); drawTexts(ctx,sc.tFront,sc,k);
    return await new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('Empty image.')),'image/png'));
  }
  $('exPng').addEventListener('click',async()=>{
    say('Rendering…');
    try{
      const blob=await exportPng(parseFloat($('exScale').value)||2);
      await saveFile('bird-migration.png',blob,()=>{
        const img=document.createElement('img'); img.src=URL.createObjectURL(blob); img.alt='Exported poster';
        overlay('Downloads are not available here. Press and hold or right-click the picture to save it.',img); say('');
      });
    }catch(err){ say('Export failed: '+((err&&err.message)||err)); }
  });
  $('exSvg').addEventListener('click',async()=>{
    const src=scene().full;
    await saveFile('bird-migration.svg',src,()=>{
      const ta=document.createElement('textarea'); ta.value=src; ta.readOnly=true;
      overlay('Downloads are not available here. Copy the SVG text below.',ta); ta.select();
    });
  });
  $('exJson').addEventListener('click',async()=>{
    const src=JSON.stringify(serialize(),null,1);
    await saveFile('nodes-and-paths-project.json',src,()=>{
      const ta=document.createElement('textarea'); ta.value=src; ta.readOnly=true;
      overlay('Downloads are not available here. Copy this text and keep it; “Paste project” restores it.',ta); ta.select();
    });
  });
  $('exLoad').addEventListener('click',()=>$('exFile').click());
  $('exFile').addEventListener('change',async e=>{
    const f=e.target.files&&e.target.files[0]; if(!f) return;
    try{ deserialize(JSON.parse(await f.text())); say('Project loaded.'); }catch(err){ say('Could not open this file: '+((err&&err.message)||err)); }
    e.target.value='';
  });
  $('exPaste').addEventListener('click',()=>{
    const ta=document.createElement('textarea'); ta.placeholder='Paste the project JSON here';
    const ok=document.createElement('button'); ok.type='button'; ok.className='primary'; ok.textContent='Load';
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;gap:10px;align-items:center'; wrap.appendChild(ta); wrap.appendChild(ok);
    ok.addEventListener('click',()=>{ try{ deserialize(JSON.parse(ta.value)); $('overlay').hidden=true; say('Project loaded.'); }catch(err){ $('ovMsg').textContent='Could not read this text: '+((err&&err.message)||err); } });
    overlay('Paste a project you saved earlier.',wrap); ta.focus();
  });
  $('bBlank').addEventListener('click',()=>{ newBlank(); });
  $('exReset').addEventListener('click',()=>{ try{ localStorage.removeItem(KEY); }catch(_){} lastSaved=''; loadPoster(); say('Back to the example.'); });

  function measure(){ S.px={w:svg.clientWidth,h:svg.clientHeight,dock:dock.offsetHeight}; }
  let ro=null;
  if(typeof ResizeObserver!=='undefined'){ ro=new ResizeObserver(measure); ro.observe(svg); ro.observe(dock); ro.observe(host); }
  window.addEventListener('resize',measure); cleanups.push(()=>{ window.removeEventListener('resize',measure); if(ro) ro.disconnect(); });
  measure();
  buildChips(); setHint();

  /* ---------- public API: every control of the tool, for a host platform ---------- */
  const SHAPE_OPTS=[['mixed','Per node'],['circle','Circles'],['square','Squares'],['ring','Rings'],['triangle','Triangles'],['diamond','Diamonds'],['hexagon','Hexagons'],['star','Stars'],['cross','Crosses'],['half','Half-circles'],['leaf','Leaves'],['bird','Birds'],['depth','By depth'],['value','By value']];
  const ensureBox=b=>{ if(!b.box) b.box={fill:'#f3f14d',l:18,t:12,r:18,b:12,minW:0}; return b.box; };
  function paramDefs(){
    const out=[];
    const add=(id,group,label,type,o,get,set)=>out.push(Object.assign({id:id,group:group,label:label,type:type},o||{},{get:get,set:set}));
    const stops=()=>S.bg.stops.slice().sort((a,b)=>a.p-b.p);

    /* Poster: format, background gradient, grid */
    add('format','Poster','Format','select',{options:[['full','Full canvas'],['p45','Poster 4:5 (1080×1350)'],['p11','Square 1:1 (1080×1080)'],['p916','Story 9:16 (1080×1920)'],['p169','Wide 16:9 (1920×1080)']]},()=>fmtKey(),v=>setFormat(v));
    add('bgType','Poster','Background','select',{options:[['gradient','Gradient'],['solid','Solid colour'],['none','None']]},()=>S.bg.type,v=>{ S.bg.type=v; if(v==='gradient'&&S.bg.stops.length<2) S.bg.stops.push({p:1,c:'#ffffff'}); });
    add('bgAngle','Poster','Gradient angle','range',{min:0,max:360,step:5},()=>S.bg.angle,v=>{ S.bg.angle=+v; });
    stops().forEach((q,i)=>{
      add('bg.stop'+(i+1)+'.color','Poster · gradient stops','Stop '+(i+1)+' colour','color',{},()=>stops()[i].c,v=>{ stops()[i].c=v; });
      add('bg.stop'+(i+1)+'.pos','Poster · gradient stops','Stop '+(i+1)+' position, %','range',{min:0,max:100,step:1},()=>Math.round(stops()[i].p*100),v=>{ stops()[i].p=clamp(+v/100,0,1); });
    });
    add('gridMode','Poster','Grid','select',{options:[['lines','Lines'],['dots','Dots'],['none','None']]},()=>S.gridMode,v=>{ S.gridMode=v; });
    add('gridColor','Poster','Grid colour','color',{},()=>S.gridCol||S.pgrid.color,v=>{ S.pgrid.color=v; S.gridCol=v; });
    add('gridWidth','Poster','Grid line width','range',{min:.5,max:8,step:.5},()=>S.pgrid.w,v=>{ S.pgrid.w=+v; });
    add('gridSize','Poster','Grid cell size','range',{min:20,max:400,step:1},()=>S.pgrid.cw,v=>{ S.pgrid.cw=+v; S.pgrid.ch=+v; });
    add('stageColor','Poster','Canvas background colour','color',{},()=>S.stageBg||THEMES[S.theme].bg,v=>{ S.stageBg=v; applyStage(); });

    /* Nodes: palette, colours, shapes, fill, gradient */
    add('palette','Nodes','Palette','select',{options:Object.keys(THEMES).map(k=>[k,k])},()=>S.theme,v=>{ applyTheme(v,true); });
    for(let i=0;i<6;i++) add('paletteColor'+(i+1),'Nodes','Palette colour '+(i+1),'color',{},()=>PAL[i],v=>{ setPaletteColor(i,v); });
    add('allNodesColor','Nodes','Colour of all nodes','color',{},()=>(S.nodes[0]&&S.nodes[0].color)||PAL[0],v=>{ S.nodes.forEach(n=>{ n.color=v; }); buildList(); });
    add('allNodesShape','Nodes','Shape of all nodes','select',{options:SHAPE_OPTS.slice(1,11)},()=>(S.nodes.find(n=>n.shape!=='none')||{shape:'circle'}).shape,v=>{ S.nodes.forEach(n=>{ if(n.shape!=='none') n.shape=v; }); S.shapeMode='mixed'; });
    add('allNodesSize','Nodes','Size of all nodes','range',{min:.2,max:2,step:.05},()=>(S.nodes[0]&&S.nodes[0].size)||1,v=>{ S.nodes.forEach(n=>{ n.size=+v; }); });
    add('shapeMode','Nodes','Node shapes (rule)','select',{options:SHAPE_OPTS},()=>S.shapeMode,v=>{ S.shapeMode=v; });
    add('fillMode','Nodes','Fill','select',{options:[['solid','Solid'],['outline','Outline only'],['duo','Translucent'],['gradient','Gradient']]},()=>S.fillMode,v=>{ S.fillMode=v; });
    add('gradEnd','Nodes','Gradient end colour','color',{},()=>S.gradEnd,v=>{ S.gradEnd=v; });
    add('gradAngle','Nodes','Gradient angle','range',{min:0,max:360,step:5},()=>S.gradAngle,v=>{ S.gradAngle=+v; });
    add('newNodeSize','Nodes','New node size','range',{min:.2,max:1.6,step:.05},()=>S.newSize,v=>{ S.newSize=+v; });
    add('highlightBranch','Nodes','Highlight branch on hover','checkbox',{},()=>S.focus,v=>{ S.focus=!!v; });
    add('snap','Nodes','Snap step','select',{options:[['1','Grid'],['0.5','Half'],['0.25','Quarter'],['0','Free']]},()=>String(S.snap),v=>{ S.snap=parseFloat(v); });

    /* Lines */
    add('showLines','Lines','Show lines','checkbox',{},()=>S.line,v=>{ S.line=!!v; });
    add('edge','Lines','Line shape','select',{options:[['curve','Smooth'],['straight','Straight'],['step','Stepped'],['wave','Wavy'],['zigzag','Zigzag'],['arc','Arcs']]},()=>S.edge,v=>{ S.edge=v; });
    add('dash','Lines','Stroke','select',{options:[['solid','Solid'],['dashed','Dashed'],['even','Even dashes'],['dotted','Dotted']]},()=>S.dash,v=>{ S.dash=v; });
    add('lineWidth','Lines','Line width','range',{min:1,max:12,step:.5},()=>S.lineW,v=>{ S.lineW=+v; });
    add('lineColorMode','Lines','Line colour source','select',{options:[['theme','Theme'],['node','Follow nodes'],['custom','Custom']]},()=>S.lineColor,v=>{ S.lineColor=v; });
    add('lineColor','Lines','Custom line colour','color',{},()=>S.lineHex,v=>{ S.lineHex=v; });
    add('arrows','Lines','Arrowheads','checkbox',{},()=>S.arrows,v=>{ S.arrows=!!v; });
    add('arrowSize','Lines','Arrow size','range',{min:.5,max:3,step:.1},()=>S.arrowSize,v=>{ S.arrowSize=+v; });
    add('waveAmp','Lines','Wave and zigzag amplitude','range',{min:.05,max:.45,step:.01},()=>S.waveAmp,v=>{ S.waveAmp=+v; });
    add('lineOverNodes','Lines','Lines above nodes','checkbox',{},()=>S.lineOver,v=>{ S.lineOver=!!v; });

    /* Labels and caption */
    add('showLabels','Labels','Show node labels','checkbox',{},()=>S.labels,v=>{ S.labels=!!v; });
    add('labelPos','Labels','Label position','select',{options:[['br','Below right'],['r','Right'],['b','Below'],['t','Above'],['c','Inside the node']]},()=>S.labelPos,v=>{ S.labelPos=v; });
    add('labelSize','Labels','Label size','range',{min:.6,max:2.4,step:.1},()=>S.lblScale,v=>{ S.lblScale=+v; });
    add('labelColor','Labels','Label colour','color',{},()=>S.labelColor||(S.frame==='post'?autoInk():THEMES[S.theme].label),v=>{ S.labelColor=v; });
    add('unit','Labels','Value unit','text',{},()=>S.unit,v=>{ S.unit=String(v); });
    add('sizeByValue','Labels','Node size follows value','checkbox',{},()=>S.sizeByValue,v=>{ S.sizeByValue=!!v; });
    add('captionOn','Labels','Show caption (full canvas)','checkbox',{},()=>S.capOn,v=>{ S.capOn=!!v; syncCaption(); });
    add('captionTitle','Labels','Caption title','text',{},()=>S.capT,v=>{ S.capT=String(v); syncCaption(); });
    add('captionText','Labels','Caption text','text',{},()=>S.capS,v=>{ S.capS=String(v); syncCaption(); });

    /* Layout, generator, data */
    add('layoutCols','Layout','Layout columns','number',{min:3,max:12,step:1},()=>Math.round(S.cols*100)/100,v=>{ S.cols=clamp(+v,3,12); });
    add('layoutRows','Layout','Layout rows','number',{min:3,max:12,step:1},()=>Math.round(S.rows*100)/100,v=>{ S.rows=clamp(+v,3,12); });
    add('seed','Layout','Generator seed','number',{min:1,max:99999,step:1},()=>S.seed,v=>{ S.seed=Math.max(1,Math.round(+v)); $('seed').value=S.seed; });
    add('count','Layout','Generator nodes','range',{min:5,max:40,step:1},()=>S.count,v=>{ S.count=Math.round(+v); $('count').value=S.count; $('countOut').textContent=S.count; });
    add('branching','Layout','Generator branching','range',{min:0,max:1,step:.05},()=>S.branchy,v=>{ S.branchy=+v; $('branchy').value=S.branchy; });
    add('series','Layout','Number series (comma-separated)','textarea',{},()=>$('series').value,v=>{ $('series').value=String(v); });

    /* Motion */
    add('animation','Motion','Animation','select',{options:[['draw','Draw path'],['pulse','Pulse'],['drift','Drift'],['fall','Leaf fall'],['none','None']]},()=>S.anim,v=>{ S.anim=v; animT=0; });
    add('speed','Motion','Speed','range',{min:.25,max:3,step:.05},()=>S.speed,v=>{ S.speed=+v; });
    add('loop','Motion','Loop','checkbox',{},()=>S.loop,v=>{ S.loop=!!v; animT=0; });
    add('animateText','Motion','Animate poster text','checkbox',{},()=>S.animText,v=>{ S.animText=!!v; });
    add('progress','Motion','Timeline position','range',{min:0,max:1,step:.001},()=>Math.round(S.prog*1000)/1000,v=>{ S.paused=true; animT=clamp(+v,0,1)*S.tl/3; setPlayLabel(); });

    /* Text blocks that have a control id (role) */
    S.blocks.forEach(b=>{
      if(!b.role) return;
      const r=b.role, g='Text · '+r;
      add(r+'.text',g,'Text','textarea',{},()=>b.text,v=>{ b.text=String(v); });
      add(r+'.font',g,'Font','select',{options:Object.keys(FONTS).map(k=>[k,FONTS[k].label])},()=>b.font,v=>{ b.font=v; });
      add(r+'.size',g,'Size','range',{min:8,max:600,step:1},()=>b.fs,v=>{ b.fs=+v; });
      add(r+'.color',g,'Colour','color',{},()=>b.color||autoInk(),v=>{ b.color=v; });
      add(r+'.bold',g,'Bold','checkbox',{},()=>!!b.bold,v=>{ b.bold=!!v; });
      add(r+'.upper',g,'UPPERCASE','checkbox',{},()=>!!b.upper,v=>{ b.upper=!!v; });
      add(r+'.align',g,'Align','select',{options:[['start','Left'],['middle','Centre']]},()=>b.align,v=>{ b.align=v; });
      add(r+'.letterSpacing',g,'Letter spacing, px','number',{step:.1},()=>b.ls,v=>{ b.ls=+v; });
      add(r+'.lineHeight',g,'Line height ×','number',{min:.4,max:3,step:.02},()=>b.lh,v=>{ b.lh=+v; });
      add(r+'.italicRow',g,'Italic row (0 = none)','number',{min:0,max:20,step:1},()=>b.it+1,v=>{ b.it=Math.round(+v)-1; });
      add(r+'.x',g,'X, px','number',{step:1},()=>b.x,v=>{ b.x=+v; });
      add(r+'.y',g,'Y, px','number',{step:1},()=>b.y,v=>{ b.y=+v; });
      add(r+'.layer',g,'Layer','select',{options:[['front','Above the graph'],['back','Behind the graph']]},()=>b.layer,v=>{ b.layer=v; });
      add(r+'.animation',g,'Animation','select',{options:ANIMS},()=>b.anim,v=>{ b.anim=v; });
      add(r+'.delay',g,'Delay, s','number',{min:0,step:.05},()=>b.delay,v=>{ b.delay=+v; });
      add(r+'.speed',g,'Speed, characters/s','number',{min:5,step:5},()=>b.cps,v=>{ b.cps=+v; });
      add(r+'.stagger',g,'Delay between rows, s','number',{min:0,step:.05},()=>b.stagger,v=>{ b.stagger=+v; });
      add(r+'.sync',g,'Appear when the path reaches it','checkbox',{},()=>!!b.sync,v=>{ b.sync=!!v; });
      add(r+'.box',g,'Plate behind the text','checkbox',{},()=>!!b.box,v=>{ if(v) ensureBox(b); else b.box=null; });
      add(r+'.box.color',g,'Plate colour','color',{},()=>b.box?b.box.fill:'#f3f14d',v=>{ ensureBox(b).fill=v; });
      add(r+'.box.gradient',g,'Plate gradient','checkbox',{},()=>!!(b.box&&b.box.fill2),v=>{ const x=ensureBox(b); x.fill2=v?(x.fill2||'#ffffff'):null; });
      add(r+'.box.color2',g,'Plate gradient colour 2','color',{},()=>(b.box&&b.box.fill2)||'#ffffff',v=>{ ensureBox(b).fill2=v; });
      add(r+'.box.angle',g,'Plate gradient angle','range',{min:0,max:360,step:5},()=>(b.box&&b.box.angle!=null)?b.box.angle:180,v=>{ ensureBox(b).angle=+v; });
      add(r+'.box.padX',g,'Plate padding left/right','number',{min:0,step:1},()=>b.box?b.box.l:18,v=>{ const x=ensureBox(b); x.l=+v; x.r=+v; });
      add(r+'.box.padY',g,'Plate padding top/bottom','number',{min:0,step:1},()=>b.box?b.box.t:12,v=>{ const x=ensureBox(b); x.t=+v; x.b=+v; });
      add(r+'.box.minWidth',g,'Plate minimum width, px','number',{min:0,step:1},()=>b.box?(b.box.minW||0):0,v=>{ ensureBox(b).minW=+v; });
      add(r+'.box.radius',g,'Plate corner radius, px','number',{min:0,step:1},()=>b.box?(b.box.radius||0):0,v=>{ ensureBox(b).radius=+v; });
      add(r+'.box.opacity',g,'Plate opacity','range',{min:0,max:1,step:.05},()=>(b.box&&b.box.op!=null)?b.box.op:1,v=>{ ensureBox(b).op=+v; });
    });
    return out;
  }
  const PRESETS={poster:loadPoster,'poster-v1':loadPosterV1,autumn:loadAutumn,constellation:loadConst,tree:loadRef,routes:loadMigration,blank:newBlank};
  function setPlayLabel(){ $('play').textContent=S.paused?'Play':'Pause'; }
  const resolveBlock=a=>byBlock(+a)||S.blocks.find(b=>b.role===a)||null;
  /* actions are buttons: api.action(id, optionalArgument) */
  const ACTIONS={
    replay:['Replay',()=>{ if(!scrubbable()) S.anim='draw'; animT=0; S.paused=false; setPlayLabel(); }],
    togglePlay:['Play / pause',()=>{ S.paused=!S.paused; setPlayLabel(); }],
    play:['Play',()=>{ S.paused=false; setPlayLabel(); }],
    pause:['Pause',()=>{ S.paused=true; setPlayLabel(); }],
    undo:['Undo',()=>undo()],
    redo:['Redo',()=>redo()],
    clearAll:['Clear all nodes',()=>clearAll()],
    generate:['Generate a graph from the seed',()=>generate()],
    newSeed:['New random seed and generate',()=>{ S.seed=rint(1,9999); $('seed').value=S.seed; generate(); }],
    relayout:['Auto layout (argument: tree, radial, value, spiral)',a=>layout(a||'tree')],
    jitter:['Jitter positions',()=>jitter()],
    flipH:['Mirror horizontally',()=>flip('h')],
    flipV:['Mirror vertically',()=>flip('v')],
    recolor:['Recolour nodes (argument: value, depth, branch)',a=>recolor(a||'value')],
    buildSeries:['Build nodes from the number series',a=>{ if(a!=null) $('series').value=String(a); fromSeries(); }],
    loadTemplate:['Load an example (argument: '+Object.keys(PRESETS).join(', ')+')',a=>(PRESETS[a]||loadPoster)()],
    applyLook:['Apply a look (argument: dots, squares, geometry, outline, waves, dashed, leaves)',a=>applyLook(a||'dots')],
    addText:['Add a text block',()=>addBlock(false)],
    duplicateText:['Duplicate the selected text block',()=>{ if(byBlock(S.selBlock)) addBlock(true); }],
    deleteText:['Delete a text block (argument: control id)',a=>{ const b=resolveBlock(a)||byBlock(S.selBlock); if(b) removeBlock(b.id); }],
    blankPoster:['Start a blank poster',()=>newBlank()],
    bgAddStop:['Add a background gradient stop',()=>{ $('bgAdd').click(); }],
    bgRemoveStop:['Remove the last background gradient stop',()=>{ if(S.bg.stops.length>2){ S.bg.stops.pop(); renderBgEditor(); commit(); } }],
    bgPreset:['Background preset (argument: sunset, sky, night, paper, mint, mono)',a=>{ if(BG_PRESETS[a]){ S.bg=BG_PRESETS[a](); renderBgEditor(); commit(); } }]
  };
  const api={
    version:'1.1.0',
    host:host,
    /** Every control: [{id,group,label,type,min,max,step,options,value}] */
    params(){ return paramDefs().map(d=>({id:d.id,group:d.group,label:d.label,type:d.type,min:d.min,max:d.max,step:d.step,options:d.options,value:d.get()})); },
    actions(){ return Object.keys(ACTIONS).map(k=>({id:k,label:ACTIONS[k][0]})); },
    get(id){ const d=paramDefs().find(x=>x.id===id); return d?d.get():undefined; },
    getAll(){ const o={}; paramDefs().forEach(d=>{ o[d.id]=d.get(); }); return o; },
    set(id,value){
      const d=paramDefs().find(x=>x.id===id); if(!d) return false;
      let v=value;
      if(d.type==='range'||d.type==='number') v=parseFloat(value);
      else if(d.type==='checkbox') v=(value===true||value==='true'||value===1||value==='1'||value==='on');
      if((d.type==='range'||d.type==='number')&&isNaN(v)) return false;
      d.set(v); syncSettings(); emit('change',{source:'param',id:id,value:v}); return true;
    },
    setMany(o){ Object.keys(o||{}).forEach(k=>api.set(k,o[k])); },
    action(name,arg){ const d=ACTIONS[name]; if(!d) return false; d[1](arg); syncSettings(); emit('change',{source:'action',name:name}); return true; },
    setData(text){ $('series').value=String(text||''); fromSeries(); },
    setMaxHeight(){ return true; },
    on(type,fn){ (listeners[type]=listeners[type]||[]).push(fn); return ()=>api.off(type,fn); },
    off(type,fn){ listeners[type]=(listeners[type]||[]).filter(f=>f!==fn); },
    presets:Object.keys(PRESETS),
    loadPreset(name){ (PRESETS[name]||loadPoster)(); syncSettings(); emit('change',{source:'preset',name:name}); },
    getState(){ return serialize(); },
    setState(o){ deserialize(o); },
    play(){ ACTIONS.play[1](); },
    pause(){ ACTIONS.pause[1](); },
    replay(){ ACTIONS.replay[1](); syncSettings(); },
    seek(p){ S.paused=true; animT=clamp(+p,0,1)*S.tl/3; setPlayLabel(); },
    get progress(){ return S.prog; },
    exportPng(scale){ return exportPng(scale||2); },
    exportSvg(){ return scene().full; },
    exportJson(){ return JSON.stringify(serialize()); },
    /** The live <svg> element (inside the Shadow DOM). */
    get svgElement(){ return svg; },
    /** The CURRENT animated frame as a standalone SVG string. Pass fontCss (@font-face rules with data: URLs) to keep fonts when it is rasterised. */
    snapshotSvg(fontCss){
      render();
      const vb=(svg.getAttribute('viewBox')||'0 0 100 100').split(/\s+/).map(Number);
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb.join(' ')+'" width="'+f2(vb[2])+'" height="'+f2(vb[3])+'">'+((fontCss||opts.fontCss)?'<style>'+(fontCss||opts.fontCss)+'</style>':'')+svg.innerHTML+'</svg>';
    },
    setUI(mode){ rootEl.dataset.ui=(mode===false?'none':(mode===true?'full':mode)); measure(); },
    resize(){ measure(); },
    destroy(){ alive=false; cleanups.forEach(f=>{ try{f();}catch(_){} }); if(saveTimer) clearInterval(saveTimer); host.remove(); }
  };
  if(opts.onChange) listeners.change=[opts.onChange];

  setTab('graph');
  let saveTimer=null;
  if(!(opts.autosave&&loadSaved())) (PRESETS[opts.preset]||loadPoster)();
  if(opts.autosave) saveTimer=setInterval(autosave,2000);
  const onKeyHost=()=>{};   // keeps the host focusable for assistive tech
  requestAnimationFrame(frame);
  if(opts.onReady) Promise.resolve().then(()=>opts.onReady(api));
  return api;
}

export default mount;
