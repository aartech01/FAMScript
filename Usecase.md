# FamScript — Use Case & Feature Guide

> A code-first family tree compiler for Indian ceremonies and beyond.
> Write structured text, get a visual diagram instantly.

---

## Table of Contents

1. [What Is FamScript?](#what-is-famscript)
2. [How It Works — The Pipeline](#how-it-works--the-pipeline)
3. [The FamScript Language](#the-famscript-language)
4. [Relationship Types](#relationship-types)
5. [Generation Hierarchy](#generation-hierarchy)
6. [Validation Engine](#validation-engine)
7. [Event Modes](#event-modes)
8. [Canvas Controls](#canvas-controls)
9. [Import Capabilities](#import-capabilities)
10. [Export Capabilities](#export-capabilities)
11. [Real-World Use Cases](#real-world-use-cases)
12. [How FamScript Differs from Other Tools](#how-famscript-differs-from-other-tools)
13. [Technical Architecture](#technical-architecture)
14. [Quick-Start Walkthrough](#quick-start-walkthrough)

---

## What Is FamScript?

FamScript is a **browser-based, code-driven genealogy tool** that lets you describe a family tree in plain structured text and instantly renders it as a professional visual diagram — no drawing, no dragging, no software installation required.

It is purpose-built for **Indian ceremonies** (weddings, Mundan, Namkaran, Vastu Puja, and more) where both sides of a family must be documented, compared, and shared. It also works for any general genealogy task worldwide.

**The core idea:** Write a script, click Compile, get a diagram.

```
PERSON GROOM_G0_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0

RELATION GROOM_DAD_P1_001 FATHER_OF GROOM_G0_001
```

That text becomes a colour-coded, zoomable, exportable family tree — in under a second.

---

## How It Works — The Pipeline

FamScript processes your text through a 4-stage pipeline, all running in the browser with no server:

```
Your Text
    │
    ▼
┌─────────────┐
│  parser.js  │  Reads PERSON blocks and RELATION statements
│             │  Outputs: { nodes[], relations[], parseErrors[] }
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  validator.js    │  Enforces 7 business rules
│                  │  Outputs: { type: 'error'|'warning', message }[]
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│  mermaidGenerator.js │  Converts internal model to Mermaid graph syntax
│                      │  Groups by generation, adds colour styles
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│  Mermaid v10 │  Renders the diagram as an SVG inside the canvas
└──────────────┘
```

**Import path** (alternative entry): `importer.js` accepts an existing JSON project file or a raw Mermaid `.mmd` file and converts it into the same internal model, bypassing the parser.

**Export path**: `export.js` reads the rendered SVG and produces downloadable files (SVG, PNG, JPG, Markdown, JSON).

Everything runs client-side. No data leaves your browser.

---

## The FamScript Language

FamScript is a simple, line-based domain-specific language. It has two constructs: **PERSON blocks** and **RELATION statements**.

### PERSON Block

A PERSON block starts with the `PERSON` keyword and its ID, followed by attribute lines:

```
PERSON <UNIQUE_ID>
NAME   <Full Name>
AGE    <integer>
GENDER <M | F>
GEN    <generation code>
STATUS <optional text>
```

| Keyword          | Description                                     | Required      |
|------------------|-------------------------------------------------|---------------|
| `PERSON <ID>`    | Opens a new person. ID must be unique, no spaces | Yes           |
| `NAME <text>`    | Display name shown inside the diagram node      | Recommended   |
| `AGE <number>`   | Integer age; used by the age validation rule    | Optional      |
| `GENDER M\|F`   | M renders a blue node, F renders a pink node    | Recommended   |
| `GEN <code>`     | Generation position (G+2, G+1, G0, G-1, G-2…)  | Recommended   |
| `STATUS <text>`  | Free text, e.g. "Deceased", "NRI"               | Optional      |

**ID naming convention:** `ROLE_GEN_NNN` — for example `GROOM_DAD_P1_001`, `BRIDE_SIS_G0_002`. This keeps large trees readable and IDs self-documenting.

### RELATION Statement

```
RELATION <FROM_ID> <TYPE> <TO_ID>
```

One statement per relationship. The direction matters:

```
RELATION DAD FATHER_OF SON        // DAD → SON  (parent to child)
RELATION SON CHILD_OF  DAD        // SON ← DAD  (child to parent, same result)
RELATION DAD MARRIED_TO MOM       // DAD — MOM  (undirected)
```

### Comments

Lines starting with `//`, `#`, or `%` are ignored:

```
// This is a comment
# Also a comment
% Mermaid-style comment, also ignored
```

### Complete Example

```
// Groom's Family - Wedding
PERSON GROOM_G0_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0

PERSON GROOM_DAD_P1_001
NAME Rajesh Kumar
AGE 55
GENDER M
GEN G+1

PERSON GROOM_MOM_P1_001
NAME Sunita Kumar
AGE 52
GENDER F
GEN G+1

PERSON GROOM_GDF_P2_001
NAME Mohan Kumar
AGE 78
GENDER M
GEN G+2

PERSON GROOM_GDM_P2_001
NAME Kamla Kumar
AGE 75
GENDER F
GEN G+2

RELATION GROOM_GDF_P2_001 MARRIED_TO  GROOM_GDM_P2_001
RELATION GROOM_GDF_P2_001 FATHER_OF   GROOM_DAD_P1_001
RELATION GROOM_GDM_P2_001 MOTHER_OF   GROOM_DAD_P1_001
RELATION GROOM_DAD_P1_001 MARRIED_TO  GROOM_MOM_P1_001
RELATION GROOM_DAD_P1_001 FATHER_OF   GROOM_G0_001
RELATION GROOM_MOM_P1_001 MOTHER_OF   GROOM_G0_001
```

This produces a three-generation tree with blue (male) and pink (female) colour-coded nodes, grouped into generation bands (G+2 on top, G+1 in the middle, G0 at the bottom).

---

## Relationship Types

FamScript supports 20+ relationship types across four categories:

### Parent–Child (directed arrow →)

| Type            | Direction      | Mermaid Edge |
|-----------------|----------------|--------------|
| `PARENT_OF`     | Parent → Child | `-->`        |
| `FATHER_OF`     | Father → Child | `-->`        |
| `MOTHER_OF`     | Mother → Child | `-->`        |
| `CHILD_OF`      | Child → Parent | `<--`        |
| `SON_OF`        | Son → Parent   | `<--`        |
| `DAUGHTER_OF`   | Daughter → Parent | `<--`     |

### Marriage / Partnership (undirected line —)

| Type          | Edge  | Use                            |
|---------------|-------|--------------------------------|
| `MARRIED_TO`  | `---` | Standard marriage              |
| `CORE_COUPLE` | `==>` | Highlighted central couple     |

### Extended / Non-biological (dashed arrow - -)

| Type               | Use case                    |
|--------------------|-----------------------------|
| `SIBLING_OF`       | Brothers, sisters           |
| `BROTHER_OF`       | Explicit brother            |
| `SISTER_OF`        | Explicit sister             |
| `COUSIN_OF`        | First or general cousin     |
| `HALF_SIBLING`     | Half-brother or half-sister |
| `STEP_PARENT`      | Step-mother, step-father    |
| `STEP_CHILD`       | Step-son, step-daughter     |
| `ADOPTIVE_PARENT`  | Adoptive parent             |
| `ADOPTED_BY`       | Adopted child               |
| `GODPARENT_OF`     | Godfather, godmother        |
| `GODCHILD_OF`      | Godchild                    |

All extended/non-biological types render as a dashed arrow (`-.->`) to visually distinguish them from blood or legal parent–child lines.

---

## Generation Hierarchy

The generation model spans **8 levels** — from great-great-grandparents (G+4) down to great-grandchildren (G-3):

| Code  | Label                      | Typical members              |
|-------|----------------------------|------------------------------|
| `G+4` | GEN +4 · Great-Great Grandparents | Oldest living elders  |
| `G+3` | GEN +3 · Great Grandparents       | Great-grandparents    |
| `G+2` | GEN +2 · Grandparents             | Dada, Dadi, Nana, Nani |
| `G+1` | GEN +1 · Parents                  | Father, Mother, Chacha, Mama |
| `G0`  | GEN 0 · Self                      | The person the tree is centred on |
| `G-1` | GEN -1 · Children                 | Sons, daughters         |
| `G-2` | GEN -2 · Grandchildren            | Grandchildren           |
| `G-3` | GEN -3 · Great Grandchildren      | Great-grandchildren     |

The renderer **automatically sorts generations** — higher codes appear at the top of the diagram, lower codes at the bottom, in a top-to-bottom tree layout. Each generation is enclosed in a labelled `subgraph` band so the viewer can immediately see the generational tier of every person.

---

## Validation Engine

Before rendering, FamScript validates the model against **7 business rules**. Errors and warnings appear in the console panel at the bottom of the screen in real time.

### Rule 1 — Duplicate ID
No two PERSON blocks may share the same ID. Renders a hard error.

### Rule 2 — Required Fields
Missing `NAME`, `GENDER`, or `GEN` produces a warning (not a hard error). The tree still renders, but the warning appears in the console.

### Rule 3 — Age Rule (Parent ≥ Child + 15)
If both a parent and child have an `AGE` value, the parent's age must be at least 15 years greater. Catches impossible relationships like a 20-year-old father of a 10-year-old.

```
// This triggers an error:
PERSON A
AGE 25
RELATION A FATHER_OF B  // B is AGE 18 → 25 < 18 + 15
```

### Rule 4 — Gender Rule
- A person declared in a `FATHER_OF` relation must have `GENDER M`
- A person declared in a `MOTHER_OF` relation must have `GENDER F`

Catches data-entry mistakes like assigning a mother to a male-gender node.

### Rule 5 — Generation Rule (Parent–Child)
For parent–child relations, the parent's generation code must be exactly 1 higher than the child's. A G+1 person can be parent of a G0 person, not a G+2 person.

### Rule 6 — Marriage Rule (Same Generation)
Both parties in a `MARRIED_TO` or `CORE_COUPLE` relation must share the same generation code. Cross-generation marriages trigger a warning.

### Rule 7 — Circular Ancestry
A depth-first search detects if any ancestor chain loops back to itself (A → B → C → A). Circular ancestry is a hard error — it would cause the tree to render incorrectly.

### How Results Appear

```
✓  Compiled · 6 persons · 8 relations
⚠  GROOM_G0_001: missing GEN
✗  Age rule: FATHER (age 30) must be ≥ SON (age 20) + 15
ℹ  Editor is empty — load a sample to get started
```

The status badge in the header also reflects the overall result: **OK**, **Warnings**, **Error**, or **Compiling**.

---

## Event Modes

FamScript ships with **10 Indian ceremony presets**, each with its own accent colour. Select the event from the dropdown — the interface adapts instantly.

| Event          | Canvas Mode | Accent Colour | Description                                  |
|----------------|-------------|---------------|----------------------------------------------|
| Wedding (Vivah)| **Dual**    | Lime           | Two canvases: Groom's side + Bride's side    |
| Engagement (Sagai) | Single  | Violet         | Single tree for the engagement ceremony      |
| Mundan         | Single      | Sky Blue       | Child's first haircut ceremony               |
| Namkaran       | Single      | Blue           | Baby naming ceremony                         |
| Annaprashan    | Single      | Orange         | First rice-feeding ceremony                  |
| Vastu Puja     | Single      | Green          | House-warming ceremony                       |
| Upanayana      | Single      | Indigo         | Sacred thread / Janeu ceremony               |
| Godh Bharai    | Single      | Pink           | Baby shower                                  |
| Birthday       | Single      | Amber          | General birthday celebration                 |
| Custom Event   | Single      | Gray           | Any other occasion                           |

### Wedding Dual-Canvas Mode

Wedding is the only event with **two independent canvases** side-by-side:

```
┌─────────────────────┬─────────────────────┐
│   Groom's Family    │   Bride's Family     │
│   (blue-tinted)     │   (rose-tinted)      │
│                     │                     │
│  [Groom's tree]     │  [Bride's tree]     │
└─────────────────────┴─────────────────────┘
```

- The editor has two tabs (Groom / Bride) — each tab holds its own independent FamScript text.
- Both trees compile and validate independently.
- Both trees can be exported independently (SVG or PNG per side).
- Each canvas has its own zoom, pan, and fullscreen controls.
- On mobile, the two canvases stack vertically.

This is designed for the common Indian wedding tradition where the groom's family (`Baaraat`) and the bride's family (`Barat`) need to be documented separately and presented together for matching and reference.

---

## Canvas Controls

Every canvas viewport includes a floating toolbar and gesture controls:

### Toolbar Buttons

| Button | Action                                                   |
|--------|----------------------------------------------------------|
| `−`    | Zoom out (×0.77 per click, centred on canvas)            |
| `+`    | Zoom in (×1.3 per click, centred on canvas)              |
| `Fit`  | Auto-scale and centre the tree to fill the canvas        |
| `1:1`  | Reset to 100% zoom, origin at top-left                   |
| `[ ]`  | Toggle fullscreen (the canvas fills the entire screen)   |

The zoom percentage is displayed between the `−` and `+` buttons and updates in real time.

### Mouse / Trackpad

| Gesture          | Action                       |
|------------------|------------------------------|
| Scroll wheel     | Zoom in/out toward the cursor |
| Click + drag     | Pan the canvas               |

Zoom always happens **toward the cursor position** — if you scroll over a specific node, that node stays under your cursor as you zoom in. This makes navigating large trees with many generations intuitive.

### Touch (Mobile / Tablet)

| Gesture          | Action                |
|------------------|-----------------------|
| One-finger drag  | Pan the canvas        |
| Two-finger pinch | Zoom in / out         |

### Auto-fit After Compile

Every time a tree compiles successfully, the canvas automatically fits the entire tree to the viewport and centres it. This means you always start with a full overview, and then zoom in to details.

---

## Import Capabilities

FamScript can import trees from two external formats, useful when migrating existing data:

### JSON Project File

Import a `.json` file that was previously exported from FamScript. It restores the full project including all nodes, relations, and settings.

```json
{
  "projectName": "Kumar Family",
  "version": "1.0",
  "nodes": [
    { "id": "GROOM_G0_001", "name": "Arjun Kumar", "age": 28, "gender": "M", "generation": "G0" }
  ],
  "relations": [
    { "from": "GROOM_DAD_P1_001", "to": "GROOM_G0_001", "type": "FATHER_OF" }
  ],
  "settings": { "theme": "dark" }
}
```

### Raw Mermaid File

Import a `.mmd`, `.md`, or `.txt` file containing a Mermaid `graph TB` diagram. FamScript parses the node IDs, labels, and edges and reconstructs the internal model. Generation and gender data is inferred where possible from the edge types.

This makes FamScript compatible with any tool that can export Mermaid diagrams (Obsidian, Notion, draw.io, etc.).

---

## Export Capabilities

Once a tree is compiled, you can export it in five formats:

### SVG — Vector Graphic

- Uses `XMLSerializer` to serialise the rendered SVG element.
- Fully scalable — can be resized to any dimension without quality loss.
- Can be embedded directly in websites, presentations, or Word documents.
- File name: `family-tree.svg`

### PNG — Raster Image (2× resolution)

- The SVG is drawn onto an off-screen `<canvas>` at **2× the natural size** (retina-quality).
- Suitable for WhatsApp, email attachments, printing up to A4 at 150 dpi.
- File name: `family-tree.png`

### JPG — Compressed Raster Image

- Same as PNG export but with JPEG compression (quality 0.95) and a white background fill.
- Smaller file size than PNG, useful when email size limits apply.
- File name: `family-tree.jpg`

### Markdown (`.md`)

- Wraps the generated Mermaid code in a ` ```mermaid ``` ` fence block.
- Paste it directly into GitHub README files, Notion, Obsidian, or any Mermaid-compatible Markdown renderer.
- File name: `family-tree.md`

### JSON Project

- Exports the full internal model: nodes, relations, settings, and project name.
- Can be re-imported later to resume work, or shared with another FamScript user.
- For wedding mode, both the groom's and bride's models are bundled in one file.
- File name: `family-tree.json`

### View Mermaid Code

Click **{ } View Mermaid** in the sidebar to see the raw Mermaid code in a modal. You can copy it to the clipboard and paste it anywhere — GitHub, a Mermaid live editor, or a documentation system.

---

## Real-World Use Cases

### 1. Wedding Matching (Kundali Milan)
Indian families traditionally exchange family trees during the marriage process (`Rishta`). FamScript lets both families write their trees separately, compile them, and export professional PDFs to share over WhatsApp or email — in minutes, not hours. The dual canvas puts both sides on screen simultaneously for comparison.

### 2. Ceremony Invitations and Programs
For events like Mundan, Namkaran, or Godhbharai, the event organiser can build the family tree of the child being celebrated and include the exported image in printed invitations or digital ceremony booklets.

### 3. Family Reunion Planning
Large extended families holding a reunion can document all branches of the family in one FamScript project, export it as a large SVG, and print it as a banner or poster.

### 4. NRI Family Documentation
Non-resident Indian families often struggle to document relationships for visa sponsorship, property inheritance, or legal affidavits. FamScript produces a structured JSON output that can be used as a data source for formal documents, alongside the visual diagram.

### 5. Ancestry Research
Researchers tracing Indian lineages — spanning multiple `gotras`, clans, and regions — can use the generation hierarchy (G+4 to G-3) to map known ancestors, identify gaps, and document the research in a shareable format.

### 6. Developers / Integrators
FamScript's JSON export format is clean and structured. Developers can programmatically generate FamScript text from database records (a roster of family members) and feed it to the tool, or consume the JSON output to populate other genealogy applications.

### 7. Teachers and Students
For sociology, anthropology, or history classes studying kinship systems, FamScript provides a fast way for students to diagram family structures studied in the curriculum — without needing graphic design skills.

---

## How FamScript Differs from Other Tools

| Feature                          | FamScript        | Ancestry.com      | draw.io / Lucidchart | GenoPro       | Mermaid (raw) |
|----------------------------------|------------------|-------------------|-----------------------|---------------|---------------|
| **Format**                       | Code (DSL)       | Form-based GUI    | Drag-and-drop GUI     | GUI + GEDCOM  | Code (generic)|
| **Indian ceremony modes**        | Yes (10 presets) | No                | No                    | No            | No            |
| **Wedding dual canvas**          | Yes              | No                | No                    | No            | No            |
| **Offline / no account needed**  | Yes              | No                | No                    | No            | Yes           |
| **Validation with rules**        | Yes (7 rules)    | Limited           | No                    | Yes           | No            |
| **Circular ancestry detection**  | Yes (DFS)        | No                | No                    | Yes           | No            |
| **Age / gender / gen checks**    | Yes              | No                | No                    | Partial       | No            |
| **Export to SVG / PNG / JPG / MD**| Yes             | Limited (PDF)     | Yes (paid)            | Yes (paid)    | PNG only      |
| **Mermaid import / export**      | Yes              | No                | No                    | No            | Native        |
| **Zero installation**            | Yes (browser)    | No (account)      | No (account)          | No (download) | Yes           |
| **Open data format (JSON)**      | Yes              | No (proprietary)  | No                    | GEDCOM        | No            |
| **10,000+ node support target**  | Yes              | Yes               | Limited               | Yes           | Limited       |
| **Touch / pinch zoom**           | Yes              | No                | Partial               | No            | No            |
| **Responsive (mobile/tablet)**   | Yes              | Partial           | No                    | No            | No            |

### Key Differentiators Summarised

**1. Code-First, Not Click-First**
FamScript treats a family tree as structured data you write, not a diagram you draw. This means you can version-control it with Git, generate it programmatically, diff changes over time, and edit it in any text editor.

**2. Indian Ceremony Native**
No other genealogy tool ships with Mundan, Namkaran, Godhbharai, or Upanayana as first-class event types. FamScript is designed from the ground up for the Indian ceremony context, where the occasion shapes what the tree needs to communicate.

**3. Dual Canvas for Wedding**
The split groom-and-bride canvas is unique. It mirrors the real-world structure of an Indian wedding where two complete family trees must be held side-by-side for review, not merged into one combined tree.

**4. Semantic Validation**
Most drawing tools let you connect any two boxes with any line. FamScript enforces domain rules: a father must be male, a parent must be old enough, spouses must share a generation. This catches real data errors before they reach the printed page.

**5. Mermaid as the Rendering Engine**
By using Mermaid under the hood, FamScript inherits a battle-tested layout engine that handles complex graphs with crossing-minimisation and automatic spacing. The output is a standard SVG — it works in every browser and every document format.

**6. No Backend, No Account, No Cost**
The entire tool is a set of static files. There is no server, no login, no subscription, no data collection. Open the HTML file in a browser and it works. Family data never leaves the user's device.

---

## Technical Architecture

For developers who want to understand or extend FamScript:

### File Structure

```
index.html          — UI shell, all DOM structure
style.css           — Dark theme (#08080E / #C8FF3E), responsive breakpoints
parser.js           — FamScript DSL → { nodes[], relations[], parseErrors[] }
validator.js        — Business rule checks → { type, message }[]
mermaidGenerator.js — Internal model → Mermaid graph TB string
importer.js         — JSON / Mermaid → internal model
export.js           — SVG, PNG, JPG, Markdown, JSON download functions
canvas.js           — CanvasController class (zoom, pan, fullscreen, touch)
utils.js            — debounce() utility
app.js              — Wires all modules together, manages state and UI events
```

### Internal Data Model

```js
// Node
{
  id:         "GROOM_G0_001",   // unique, no spaces
  name:       "Arjun Kumar",
  age:        28,               // integer or null
  gender:     "M",             // "M", "F", or ""
  generation: "G0",            // "G+2", "G+1", "G0", "G-1", etc.
  status:     ""               // e.g. "Deceased"
}

// Relation
{
  from: "GROOM_DAD_P1_001",
  to:   "GROOM_G0_001",
  type: "FATHER_OF"
}

// Full project (JSON export format)
{
  projectName: "Kumar Family Wedding",
  version:     "1.0",
  nodes:       [...],
  relations:   [...],
  settings:    { theme: "dark" }
}
```

### Mermaid Output Example

The generator produces a `graph TB` with `subgraph` blocks per generation:

```
graph TB

  subgraph GEN_P2["GEN +2 · Grandparents"]
    GROOM_GDF_P2_001["Mohan Kumar, 78 (M)"]
    GROOM_GDM_P2_001["Kamla Kumar, 75 (F)"]
  end

  subgraph GEN_P1["GEN +1 · Parents"]
    GROOM_DAD_P1_001["Rajesh Kumar, 55 (M)"]
    GROOM_MOM_P1_001["Sunita Kumar, 52 (F)"]
  end

  subgraph GEN_P0["GEN 0 · Self"]
    GROOM_G0_001["Arjun Kumar, 28 (M)"]
  end

  GROOM_GDF_P2_001 ---|"married"| GROOM_GDM_P2_001
  GROOM_DAD_P1_001 ---|"married"| GROOM_MOM_P1_001
  GROOM_GDF_P2_001 -->|"father"| GROOM_DAD_P1_001
  GROOM_DAD_P1_001 -->|"father"| GROOM_G0_001

  style GROOM_G0_001 fill:#3b82f6,color:#fff,stroke:#1d4ed8,stroke-width:2px
  style GROOM_GDM_P2_001 fill:#ec4899,color:#fff,stroke:#9d174d,stroke-width:2px
```

### Adding a New Event Mode

To add a new ceremony preset, add one entry to the `EVENTS` object in `app.js`:

```js
const EVENTS = {
  // ...
  myEvent: {
    name:    'My Ceremony',
    color:   '#7c3aed',                   // accent hex
    ecLight: 'rgba(124,58,237,0.07)',     // dark-mode tinted bg
    dual:    false,                       // true = wedding-style dual canvas
    desc:    'Family tree for my ceremony'
  }
};
```

Then add the corresponding `<option>` in `index.html`. No other changes needed.

### Performance Notes

- Compile pipeline (parse + validate + generate): typically < 50 ms for 100 nodes
- Mermaid render: < 500 ms for 100 nodes, < 2s for 500+ nodes
- Editor debounce: 750 ms after last keystroke before auto-compile triggers
- Export (PNG at 2×): < 2s for typical wedding-size trees
- The tool is designed to handle 10,000+ node targets per the architecture spec

---

## Quick-Start Walkthrough

### Step 1 — Open the app

Open `index.html` in Chrome, Edge, Firefox, or Brave. No installation. No internet required after the first load (Mermaid is cached by the browser).

### Step 2 — Choose your event

Select **Wedding (Vivah)** from the event dropdown to get the dual-canvas layout, or choose any other ceremony for a single canvas.

### Step 3 — Load a sample

Click **Load Sample** in the sidebar. Both the Groom's and Bride's sample scripts load automatically. Click **Compile** (or press `Ctrl+Enter`).

You will see:
- Two colour-coded family trees rendered side-by-side
- Green success messages in the Console panel
- Status badge showing **OK**

### Step 4 — Edit the sample

Click the **Groom's Family** tab and replace the names with real names. Click **Bride's Family** and do the same. The tree auto-compiles 750 ms after you stop typing.

### Step 5 — Validate

If you make a mistake — wrong gender for a `MOTHER_OF` relation, an age gap that is too small, a missing `GEN` code — the Console panel shows a clear error message pointing to the problem.

### Step 6 — Zoom and explore

Use the scroll wheel over either canvas to zoom in. Drag to pan. Click **Fit** to return to the full overview. Click **[ ]** for fullscreen presentation mode.

### Step 7 — Export

- Click **SVG** to download a vector file for presentations.
- Click **PNG** for a high-resolution image to share on WhatsApp.
- Click **JSON Project** to save your work and resume it later.
- Click **{ } View Mermaid** to copy the raw diagram code for use in Notion or GitHub.

---

*FamScript — built for families, designed for ceremonies, powered by Mermaid.*
