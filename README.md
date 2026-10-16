# Nodes & Paths — `tool.js`

One self-contained ES module (no dependencies, no build step): an interactive node/path infographic tool
(nodes, lines, poster artboards, text blocks, gradients, animation) with PNG / SVG / JSON export.
It runs inside a **Shadow DOM**, so it cannot break the host page's CSS and the host cannot break it.

**All controls of the tool are exposed** (175 in the poster example, 24 actions): every colour, both gradients
(background and plates behind texts, plus node gradient fill), palette, lines, labels, grid, layout, generator, motion,
and every setting of every text block. The full list is in **`controls.json`** — give that file to whoever builds the Brik panel.

## 1. Put it on GitHub

```
my-repo/
  tool.js              <- the module (the only file a host needs)
  controls.json        <- the complete controls file (ids, types, ranges, defaults, actions)
  index.html           <- standalone demo (the tool's own UI)
  controls-demo.html   <- demo where the HOST page builds all controls from tool.params()
```

Commit, create a **tag** (e.g. `v1.1.0`), and import through **jsDelivr**:

```
https://cdn.jsdelivr.net/gh/<user>/<repo>@v1.1.0/tool.js
```

Do not use `raw.githubusercontent.com` (it serves `text/plain` + `nosniff`, browsers refuse it as a module).
Pin a tag or commit: `@main` is cached for hours.

## 2. Use it from Brik canvas code (same pattern as the other tools)

```js
const mod = await import('https://cdn.jsdelivr.net/gh/<user>/<repo>@v1.1.0/tool.js');
const api = mod.mount(host, { ui: false, persist: false });   // own UI hidden, no localStorage

api.setMany(initialValues);                        // { lineWidth: 6, 'tag.box.color2': '#ff3b6b', ... }
controls.onChange(id, v => api.set(id, v));        // every Brik control -> api.set(id, value)
controls.onAction('act_replay', () => api.action('replay'));
api.setData('3, 8, 5, 12');                        // optional: number series -> nodes
const svgString = api.snapshotSvg(fontCss);        // current animated frame as SVG
```

`host` needs a height (the tool fills it). Control ids and defaults: **`controls.json`**.
Unknown ids are ignored by `set` (it returns `false`), so a partial `setMany` is safe.

> Fonts: the tool uses Averia Serif Libre, Special Gothic Condensed One and Roboto Condensed (loaded from Google Fonts).
> A frame rasterised through SVG-in-an-image does not see page fonts. Pass `fontCss` (`@font-face` rules with `data:` URLs)
> to `snapshotSvg(fontCss)`, or use `exportPng()` which draws text with the page fonts.

Prompt phrase for Brik:
> підключи модуль за URL через динамічний import, сховай його власний UI (`ui: false`), виведи ВСІ параметри з `controls.json` у контроли Brik (кольори, градієнти, плашки, тексти), дії підключи через `api.action`

## 3. `mount(container, options)`

| option | default | meaning |
|---|---|---|
| `ui` | `'full'` | `'full'` / `'dock'` / `'none'` or `true` / `false` (`false` = canvas only) |
| `persist` | `false` | `true` keeps the project in `localStorage` (alias of `autosave`) |
| `theme` | `'auto'` | panel theme: `'auto'`, `'light'`, `'dark'` |
| `preset` | `'poster'` | `poster`, `poster-v1`, `autumn`, `constellation`, `tree`, `routes`, `blank` |
| `loadFonts` | `true` | adds the Google Fonts `<link>` to `document.head` |
| `fontCss` | `''` | `@font-face` CSS used by `snapshotSvg()` |
| `onDownload` | – | `({filename, data}) => {}` — the host saves exports itself |
| `onChange`, `onReady` | – | callbacks |

## 4. API

`params()` · `get(id)` · `getAll()` · `set(id, value)` · `setMany({id: value})` · `action(name, arg?)` · `actions()` ·
`setData(text)` · `on('change', fn)` / `off` · `presets` · `loadPreset(name)` · `getState()` / `setState(obj)` ·
`play()` · `pause()` · `replay()` · `seek(0..1)` · `progress` ·
`exportPng(scale = 2)` → `Promise<Blob>` · `exportSvg()` · `exportJson()` · `snapshotSvg(fontCss?)` · `svgElement` ·
`setUI(mode)` · `resize()` · `destroy()`

## 5. Controls

**Poster**

| id | control | type | range / options |
|---|---|---|---|
| `format` | Format | select | full, p45, p11, p916, p169 |
| `bgType` | Background | select | gradient, solid, none |
| `bgAngle` | Gradient angle | range | 0–360 |
| `gridMode` | Grid | select | lines, dots, none |
| `gridColor` | Grid colour | color |  |
| `gridWidth` | Grid line width | range | 0.5–8 |
| `gridSize` | Grid cell size | range | 20–400 |
| `stageColor` | Canvas background colour | color |  |

**Poster · gradient stops**

| id | control | type | range / options |
|---|---|---|---|
| `bg.stop1.color` | Stop 1 colour | color |  |
| `bg.stop1.pos` | Stop 1 position, % | range | 0–100 |
| `bg.stop2.color` | Stop 2 colour | color |  |
| `bg.stop2.pos` | Stop 2 position, % | range | 0–100 |
| `bg.stop3.color` | Stop 3 colour | color |  |
| `bg.stop3.pos` | Stop 3 position, % | range | 0–100 |
| `bg.stop4.color` | Stop 4 colour | color |  |
| `bg.stop4.pos` | Stop 4 position, % | range | 0–100 |

**Nodes**

| id | control | type | range / options |
|---|---|---|---|
| `palette` | Palette | select | poster, autumn, night, sunset, dusk |
| `paletteColor1` | Palette colour 1 | color |  |
| `paletteColor2` | Palette colour 2 | color |  |
| `paletteColor3` | Palette colour 3 | color |  |
| `paletteColor4` | Palette colour 4 | color |  |
| `paletteColor5` | Palette colour 5 | color |  |
| `paletteColor6` | Palette colour 6 | color |  |
| `allNodesColor` | Colour of all nodes | color |  |
| `allNodesShape` | Shape of all nodes | select | circle, square, ring, triangle, diamond, hexagon, star, cross, half, leaf |
| `allNodesSize` | Size of all nodes | range | 0.2–2 |
| `shapeMode` | Node shapes (rule) | select | mixed, circle, square, ring, triangle, diamond, hexagon, star, cross, half, leaf, bird, depth, value |
| `fillMode` | Fill | select | solid, outline, duo, gradient |
| `gradEnd` | Gradient end colour | color |  |
| `gradAngle` | Gradient angle | range | 0–360 |
| `newNodeSize` | New node size | range | 0.2–1.6 |
| `highlightBranch` | Highlight branch on hover | checkbox |  |
| `snap` | Snap step | select | 1, 0.5, 0.25, 0 |

**Lines**

| id | control | type | range / options |
|---|---|---|---|
| `showLines` | Show lines | checkbox |  |
| `edge` | Line shape | select | curve, straight, step, wave, zigzag, arc |
| `dash` | Stroke | select | solid, dashed, even, dotted |
| `lineWidth` | Line width | range | 1–12 |
| `lineColorMode` | Line colour source | select | theme, node, custom |
| `lineColor` | Custom line colour | color |  |
| `arrows` | Arrowheads | checkbox |  |
| `arrowSize` | Arrow size | range | 0.5–3 |
| `waveAmp` | Wave and zigzag amplitude | range | 0.05–0.45 |
| `lineOverNodes` | Lines above nodes | checkbox |  |

**Labels**

| id | control | type | range / options |
|---|---|---|---|
| `showLabels` | Show node labels | checkbox |  |
| `labelPos` | Label position | select | br, r, b, t, c |
| `labelSize` | Label size | range | 0.6–2.4 |
| `labelColor` | Label colour | color |  |
| `unit` | Value unit | text |  |
| `sizeByValue` | Node size follows value | checkbox |  |
| `captionOn` | Show caption (full canvas) | checkbox |  |
| `captionTitle` | Caption title | text |  |
| `captionText` | Caption text | text |  |

**Layout**

| id | control | type | range / options |
|---|---|---|---|
| `layoutCols` | Layout columns | number | 3–12 |
| `layoutRows` | Layout rows | number | 3–12 |
| `seed` | Generator seed | number | 1–99999 |
| `count` | Generator nodes | range | 5–40 |
| `branching` | Generator branching | range | 0–1 |
| `series` | Number series (comma-separated) | textarea |  |

**Motion**

| id | control | type | range / options |
|---|---|---|---|
| `animation` | Animation | select | draw, pulse, drift, fall, none |
| `speed` | Speed | range | 0.25–3 |
| `loop` | Loop | checkbox |  |
| `animateText` | Animate poster text | checkbox |  |
| `progress` | Timeline position | range | 0–1 |

**Text blocks** (for every text that has a control id; the poster example has `title`, `subtitle`, `footer`, `tag`): `<id>.` + `text`, `font`, `size`, `color`, `bold`, `upper`, `align`, `letterSpacing`, `lineHeight`, `italicRow`, `x`, `y`, `layer`, `animation`, `delay`, `speed`, `stagger`, `sync`, `box`, `box.color`, `box.gradient`, `box.color2`, `box.angle`, `box.padX`, `box.padY`, `box.minWidth`, `box.radius`, `box.opacity`

**Gradient stops**: `bg.stop1.color`, `bg.stop1.pos`, `bg.stop2.color`, … one pair per stop (add/remove with the `bgAddStop` / `bgRemoveStop` actions).

## 6. Actions (`api.action(name, arg)`; Brik control id = `act_` + name)

| action | what it does |
|---|---|
| `replay` | Replay |
| `togglePlay` | Play / pause |
| `play` | Play |
| `pause` | Pause |
| `undo` | Undo |
| `redo` | Redo |
| `clearAll` | Clear all nodes |
| `generate` | Generate a graph from the seed |
| `newSeed` | New random seed and generate |
| `relayout` | Auto layout (argument: tree, radial, value, spiral) |
| `jitter` | Jitter positions |
| `flipH` | Mirror horizontally |
| `flipV` | Mirror vertically |
| `recolor` | Recolour nodes (argument: value, depth, branch) |
| `buildSeries` | Build nodes from the number series |
| `loadTemplate` | Load an example (argument: poster, poster-v1, autumn, constellation, tree, routes, blank) |
| `applyLook` | Apply a look (argument: dots, squares, geometry, outline, waves, dashed, leaves) |
| `addText` | Add a text block |
| `duplicateText` | Duplicate the selected text block |
| `deleteText` | Delete a text block (argument: control id) |
| `blankPoster` | Start a blank poster |
| `bgAddStop` | Add a background gradient stop |
| `bgRemoveStop` | Remove the last background gradient stop |
| `bgPreset` | Background preset (argument: sunset, sky, night, paper, mint, mono) |

## 7. Notes

* The tool draws SVG; PNG export renders to a canvas internally.
* Keyboard shortcuts only react after the user clicked inside the tool, and never while typing.
* Several instances can live on one page.
