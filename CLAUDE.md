# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: FamScript Visual Builder

A browser-based visual genealogy/family-tree compiler and renderer. Users write FamScript syntax, which is parsed, validated, converted to Mermaid graph syntax, and rendered as a visual tree. No build system — pure static HTML/CSS/Vanilla JS served directly in the browser.

## Running the app

Open `index.html` directly in a browser (Chrome/Edge/Firefox/Brave). No server or build step required. Mermaid is loaded from CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
```

Initialize with:
```js
mermaid.initialize({ startOnLoad: false, theme: "default" });
mermaid.render("tree", mermaidCode);
```

Safari has partial support only.

## Architecture: Processing Pipeline

FamScript text flows through these modules in sequence:

```
parser.js → validator.js → mermaidGenerator.js → Mermaid renderer → export.js
```

`importer.js` is a parallel entry point: it accepts raw Mermaid or JSON and converts it into the same internal JSON model that `mermaidGenerator.js` reads.

## Module responsibilities

| File | Responsibility |
|---|---|
| `parser.js` | FamScript text → internal JSON (`nodes[]` + `relations[]`) |
| `validator.js` | Enforces all business rules against the JSON model |
| `mermaidGenerator.js` | Internal JSON → Mermaid `graph TB` syntax |
| `importer.js` | Mermaid/JSON input → internal JSON model |
| `export.js` | SVG (XMLSerializer), PNG/JPG (SVG→Canvas→toDataURL), MD (blob), JSON (blob) |
| `app.js` | Wires UI events, orchestrates the pipeline, manages theme switching |

## Internal data model

```js
// Node
{ id: "", name: "", age: 0, gender: "", generation: "", status: "" }

// Relation
{ from: "", to: "", type: "" }

// Project JSON (import/export)
{ projectName: "", version: "1.0", nodes: [], relations: [], settings: { theme: "dark" } }
```

Person IDs follow the pattern `ROLE_GEN_NNN` (e.g., `GROOM_SLF_001`). IDs must be unique across the entire tree.

## FamScript syntax

```
PERSON GROOM_SLF_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0

RELATION GROOM_SLF_001 MARRIED_TO BRIDE_SLF_001
```

Generation codes map to the hierarchy: `G+4` (great-great-grandparents) down to `G-3` (great-grandchildren). `G0` is the self/ego generation.

## Validation rules (validator.js must enforce all of these)

| Rule | Constraint |
|---|---|
| Age Rule | Parent age ≥ child age + 15 |
| Generation Rule | Generations must match the relationship hierarchy |
| Gender Rule | Father = M, Mother = F |
| Duplicate Rule | No duplicate node IDs |
| Circular Relation Rule | No cyclic ancestry |
| Marriage Rule | Spouses must share the same generation |
| Child Generation Rule | Child must be one generation lower than parent |
| Missing Data Rule | `id`, `name`, `gender`, `generation` are required fields |

## Relationship types → Mermaid edges

| Relation type | Mermaid edge |
|---|---|
| Parent / Mother | `-->` |
| Marriage | `---` |
| Core Couple | `==>` |
| Step / Cousin / Adoptive | `-.->` |

## Rendering rules

Mermaid output uses `graph TB`. Generations are grouped with `subgraph` blocks. Older generations appear above, G0 is centered, children go below. Edge crossing should be minimized.

## Performance targets

- Initial render: < 1s
- Live compile delay: < 100ms (debounce editor input)
- Export: < 2s
- Must handle 10,000+ nodes

## Generation hierarchy reference

The generation model (from `hierarchy.pdf`) spans GEN +4 (great-great-grandparents) to GEN -3 (great-grandchildren), with GEN 0 as self. The corporate/org hierarchy mirror uses LEVEL +6 (founders/board) down to LEVEL -2 (external/temp workforce). Both hierarchies use the same node/relation data model — only the relationship type vocabulary differs.

## Export methods

- **SVG**: `new XMLSerializer().serializeToString(svgElement)`
- **PNG**: SVG → `<canvas>` → `canvas.toDataURL("image/png")`
- **JPG**: SVG → `<canvas>` → `canvas.toDataURL("image/jpeg")`
- **Markdown**: wrap Mermaid code in ` ```mermaid ``` ` fences, download as blob
- **JSON**: serialize project model, download as blob
