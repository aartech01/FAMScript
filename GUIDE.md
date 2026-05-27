# FamScript Visual Builder — Complete User Guide

**Version 1.0 | Code-first family tree compiler for Indian ceremonies**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Interface Overview](#3-interface-overview)
4. [FamScript Syntax](#4-famscript-syntax)
   - 4.1 PERSON Block
   - 4.2 Generation Codes
   - 4.3 RELATION Statement
   - 4.4 Comments
   - 4.5 ID Naming Convention
5. [Relationship Types](#5-relationship-types)
6. [Ceremony & Event Modes](#6-ceremony--event-modes)
7. [Canvas Controls](#7-canvas-controls)
8. [Import & Export](#8-import--export)
9. [Syntax Converter](#9-syntax-converter)
10. [Mermaid Code Editor](#10-mermaid-code-editor)
11. [Validation Rules](#11-validation-rules)
12. [Complete Example — Wedding (3 Generations)](#12-complete-example--wedding-3-generations)
13. [Tips & Best Practices](#13-tips--best-practices)
14. [For Developers — Adding Custom Events](#14-for-developers--adding-custom-events)

---

## 1. Overview

**FamScript Visual Builder** is a browser-based, code-first family tree compiler designed specifically for Indian ceremonies. Instead of dragging boxes and drawing lines, you write a short structured script — the tool instantly parses it, validates it against a set of family rules, and renders a colour-coded, zoomable diagram.

**Key principles:**

- No account required. No installation. No internet connection after the page loads.
- All processing happens locally in your browser. No data is sent to any server.
- Optimised for Indian ceremony contexts: Wedding (Vivah), Mundan, Namkaran, Sagai, and more.
- Supports trees with 10,000+ nodes at sub-second render times.

**Processing pipeline:**

```
FamScript Text
      ↓
   Parser (parser.js)
      ↓
  Validator (validator.js)
      ↓
 Mermaid Generator (mermaidGenerator.js)
      ↓
   Mermaid Renderer (CDN library)
      ↓
  Visual Tree on Canvas
      ↓
   Export (export.js)
```

---

## 2. Getting Started

### 2.1 Opening the App

Open `index.html` directly in any modern browser — Chrome, Edge, Firefox, or Brave. No server or build step is required. Safari has partial support only.

### 2.2 Quick Start (5 Steps)

1. Select a ceremony from the **Event dropdown** in the header (e.g., Wedding).
2. Click **Load Sample** in the left sidebar. A working family tree script loads into the editor.
3. Press **Ctrl + Enter** (or click the **Compile** button). The tree renders immediately in the preview pane.
4. Edit names, ages, and relationships. Press **Ctrl + Enter** to re-render at any time.
5. Check the **Console** at the bottom of the screen for validation errors or warnings.
6. Use the export buttons in the sidebar to save the diagram as SVG, PNG, JPG, or other formats.

### 2.3 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Compile / re-render the tree |
| `Tab` | Indent in the editor (inserts 2 spaces) |
| `Scroll wheel` on canvas | Zoom in or out toward the cursor position |
| `Click + Drag` on canvas | Pan the tree in any direction |
| `Esc` | Exit fullscreen mode |

---

## 3. Interface Overview

The interface is divided into four zones:

### 3.1 Header Bar

| Element | Purpose |
|---|---|
| **Menu ( ☰ )** | Opens / closes the sidebar (mobile only) |
| **Event Dropdown** | Select the Indian ceremony type (e.g., Wedding, Mundan) |
| **Project Name field** | Name used as a prefix when exporting files |
| **Status Badge** | Real-time compile status: Ready / Compiling / OK / Warnings / Error |
| **Theme Dropdown** | Switch the Mermaid diagram theme (Dark, Default, Forest, Neutral, Base) |
| **? Help** | Opens the in-app FamScript Reference Guide |
| **▶ Compile** | Trigger compilation manually |

### 3.2 Sidebar

| Section | Buttons |
|---|---|
| **Actions** | Load Sample, Clear |
| **Import** | JSON File, Mermaid File |
| **Export (Single mode)** | SVG, PNG, JPG, Mermaid (.md), FAMScript (.fam) |
| **Export (Wedding mode)** | Separate SVG / PNG / Mermaid / FAMScript for each side |
| **Export (Always)** | JSON Project |
| **Tools** | { } View Mermaid, ⇄ Converter, Mermaid Editor |

### 3.3 Editor Pane

The left pane contains a plain-text editor where you write FamScript. In Wedding mode, two tabs appear — **Groom's Family** and **Bride's Family** — each with its own independent script.

### 3.4 Preview Pane

The right pane shows the rendered diagram. In Wedding mode, two side-by-side canvases appear — one per family. Each canvas has its own zoom, pan, and fullscreen controls.

### 3.5 Console (Footer)

The console at the bottom displays real-time compilation output:

| Icon | Type | Meaning |
|---|---|---|
| ✓ (green) | Success | Tree compiled cleanly with no issues |
| ⚠ (amber) | Warning | Tree rendered but has data issues — review advised |
| ✗ (red) | Error | Compilation failed — fix the reported issue first |
| ℹ (blue) | Info | General message (e.g., the editor is empty) |

---

## 4. FamScript Syntax

### 4.1 PERSON Block

A `PERSON` block defines one individual. Open it with the `PERSON` keyword followed by a unique ID, then add attribute lines in any order before the next `PERSON` or `RELATION` statement.

```
PERSON <UNIQUE_ID>
NAME   <Full Name>
AGE    <integer>
GENDER <M | F>
GEN    <generation code>
STATUS <optional free text>
```

**Attribute reference:**

| Keyword | Value | Required | Effect |
|---|---|---|---|
| `PERSON <ID>` | Unique, no spaces | Yes | Opens a new person block |
| `NAME <text>` | Full name; spaces allowed | Recommended | Label shown inside the diagram node |
| `AGE <number>` | Positive integer | Optional | Displayed in the node; used by the age validation rule |
| `GENDER M\|F` | `M` or `F` (case-insensitive) | Recommended | M = blue node · F = pink node · omitted = grey |
| `GEN <code>` | G+4 to G-3 | Recommended | Determines the generation row in the diagram |
| `STATUS <text>` | Any free text | Optional | Stored in the data model; use for notes such as "Deceased" |

**Example:**

```
PERSON GROOM_G0_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0
STATUS Eldest son
```

---

### 4.2 Generation Codes (GEN)

Generation codes place each person in a horizontal tier of the diagram. Older ancestors appear at the top; younger descendants appear at the bottom.

| Code | Label | Typical Family Members |
|---|---|---|
| `G+4` | Great-Great Grandparents | Oldest living elders, historical ancestors |
| `G+3` | Great Grandparents | Pardada, Pardadi, Parnana, Parnani |
| `G+2` | Grandparents | Dada, Dadi, Nana, Nani |
| `G+1` | Parents | Father, Mother, Chacha, Chachi, Mama, Mami |
| `G0` | Self / Ego | The person the tree is centred on; siblings; cousins |
| `G-1` | Children | Sons, daughters, nephews, nieces |
| `G-2` | Grandchildren | Grandsons, granddaughters |
| `G-3` | Great Grandchildren | Great-grandsons, great-granddaughters |

> Every person should have a `GEN` code. Without it the validator raises a warning and that person's row placement may be unpredictable.

---

### 4.3 RELATION Statement

Each `RELATION` line defines one directed relationship between two person IDs.

```
RELATION <FROM_ID> <TYPE> <TO_ID>
```

**Examples:**

```
RELATION DAD_001 FATHER_OF SON_001      // DAD → SON (parent points to child)
RELATION SON_001 CHILD_OF  DAD_001      // SON ← DAD (same result, reversed direction)
RELATION DAD_001 MARRIED_TO MOM_001     // DAD — MOM (undirected marriage link)
```

> `RELATION` statements can appear anywhere in the file — before or after `PERSON` blocks. The compiler collects all persons first, then processes all relations.

---

### 4.4 Comments

Lines beginning with `//`, `#`, or `%` are ignored by the compiler. Use them freely to organise your script.

```
// This is a comment — ignored by the compiler
# Also a comment
% Mermaid-style comment — also ignored

PERSON DAD_001
// Attributes follow:
NAME Ramesh Kumar
```

---

### 4.5 ID Naming Convention

IDs must be unique across the entire tree, must contain no spaces, and are case-sensitive. The recommended format is:

```
ROLE_GEN_NNN
```

| Example ID | Meaning |
|---|---|
| `GROOM_G0_001` | Groom himself, generation 0, person #1 |
| `GROOM_DAD_P1_001` | Groom's father, generation +1, person #1 |
| `BRIDE_SIS_G0_002` | Bride's sister, generation 0, person #2 |
| `BRIDE_GDM_P2_001` | Bride's grandmother (maternal), generation +2 |

Self-documenting IDs make large trees readable at a glance and prevent accidental duplicate ID errors.

---

## 5. Relationship Types

### 5.1 Parent – Child Relationships (solid arrow →)

| Type | Direction | Notes |
|---|---|---|
| `PARENT_OF` | Parent → Child | Generic parent; gender is not enforced |
| `FATHER_OF` | Father → Child | Requires `GENDER M` on the FROM person |
| `MOTHER_OF` | Mother → Child | Requires `GENDER F` on the FROM person |
| `CHILD_OF` | Child ← Parent | Reverse of `PARENT_OF` |
| `SON_OF` | Son ← Parent | Reverse of `FATHER_OF` / `PARENT_OF` |
| `DAUGHTER_OF` | Daughter ← Parent | Reverse of `MOTHER_OF` / `PARENT_OF` |

### 5.2 Marriage & Partnership (solid line —)

| Type | Edge Style | Notes |
|---|---|---|
| `MARRIED_TO` | Solid line | Standard marriage link; both persons must share the same `GEN` code |
| `CORE_COUPLE` | Bold double arrow | Highlights the central couple in a wedding tree |

### 5.3 Siblings & Extended Family (dashed line - ->)

| Type | Use Case |
|---|---|
| `SIBLING_OF` | Generic brother or sister |
| `BROTHER_OF` | Explicit brother relationship |
| `SISTER_OF` | Explicit sister relationship |
| `COUSIN_OF` | First cousin or general cousin |
| `HALF_SIBLING` | Half-brother or half-sister |

### 5.4 Step & Adoptive Relationships (dashed line - ->)

| Type | Use Case |
|---|---|
| `STEP_PARENT` | Step-mother or step-father |
| `STEP_CHILD` | Step-son or step-daughter |
| `ADOPTIVE_PARENT` | Adoptive mother or father |
| `ADOPTED_BY` | Reverse of `ADOPTIVE_PARENT` |

### 5.5 Spiritual Relationships (dashed line - ->)

| Type | Use Case |
|---|---|
| `GODPARENT_OF` | Godfather or godmother |
| `GODCHILD_OF` | Godson or goddaughter |

### 5.6 Edge Style Summary

| Edge Style | Meaning | Relationship Types |
|---|---|---|
| → Solid arrow | Blood / legal parent-to-child | `PARENT_OF`, `FATHER_OF`, `MOTHER_OF`, `CHILD_OF`, `SON_OF`, `DAUGHTER_OF` |
| — Solid line | Marriage / partnership | `MARRIED_TO` |
| ⇒ Bold double arrow | Core couple highlight | `CORE_COUPLE` |
| - -> Dashed arrow | Extended / non-biological | `SIBLING_OF`, `COUSIN_OF`, `STEP_*`, `ADOPTIVE_*`, `GODPARENT_*` |

Dashed edges visually distinguish non-biological or non-legal relationships from solid blood and marriage lines. Any unknown relationship type also defaults to a dashed edge.

---

## 6. Ceremony & Event Modes

FamScript ships with 10 Indian ceremony presets. Select one from the event dropdown — the accent colour, description, and canvas layout adapt instantly.

| Event | Canvas Mode | Description |
|---|---|---|
| **Wedding (Vivah)** | **Dual** | Groom's family tree + Bride's family tree, side-by-side |
| Engagement (Sagai) | Single | Family tree for the engagement ceremony |
| Mundan | Single | Child's first haircut — document the child's family |
| Namkaran | Single | Baby naming ceremony family tree |
| Annaprashan | Single | First rice-feeding ceremony |
| Vastu Puja | Single | House-warming — household family tree |
| Upanayana | Single | Sacred thread / Janeu ceremony |
| Godh Bharai | Single | Baby shower family tree |
| Birthday | Single | Birthday celebration family tree |
| Custom Event | Single | Any other occasion — neutral accent |

### 6.1 Wedding Dual-Canvas Mode

Wedding is the only event that renders two independent canvases side-by-side:

- The editor shows two tabs — **Groom's Family** and **Bride's Family** — each holding its own FamScript text.
- Both trees compile and validate independently.
- Each canvas has its own zoom, pan, and fullscreen controls.
- Both trees can be exported separately (SVG, PNG, Mermaid, or FAMScript per side).
- On mobile, the two canvases stack vertically.

> Switch between Groom and Bride tabs freely — your text is saved automatically when you switch.

---

## 7. Canvas Controls

### 7.1 Toolbar Buttons

| Button | Action | Detail |
|---|---|---|
| `−` | Zoom out | Scales to 77% per click, centred on the canvas |
| `+` | Zoom in | Scales to 130% per click, centred on the canvas |
| Zoom % display | Current zoom level | Read-only (e.g., 75%, 100%, 200%) |
| `Fit` | Fit to screen | Auto-scales and centres the entire tree in the viewport |
| `1:1` | Reset zoom | Returns to 100% with no translation |
| `[ ]` | Fullscreen | The canvas fills the entire screen; press `Esc` to exit |

### 7.2 Mouse & Trackpad

| Gesture | Action |
|---|---|
| Scroll wheel | Zoom in or out toward the cursor position (the point under the cursor stays fixed) |
| Click + drag | Pan the canvas freely in any direction |

### 7.3 Touch (Mobile / Tablet)

| Gesture | Action |
|---|---|
| One-finger drag | Pan the canvas |
| Two-finger pinch | Zoom in or out (the pinch centre is the zoom focal point) |

### 7.4 Auto-fit After Compile

Every time a tree compiles successfully, the canvas automatically fits the entire tree into the viewport and centres it. You always start with a full overview and then zoom in to explore details.

### 7.5 Responsive Layout

| Screen Width | Layout |
|---|---|
| > 1024 px | Full desktop: sidebar + editor + preview side-by-side |
| 769 – 1024 px | Compact tablet: narrower sidebar and editor pane |
| 481 – 768 px | Mobile: sidebar becomes a slide-in drawer (tap ☰); editor and preview stack vertically |
| ≤ 480 px | Small mobile: further compressed header; dual canvases stack vertically |

---

## 8. Import & Export

### 8.1 Import

Click **JSON File** or **Mermaid File** in the sidebar to import existing data into the editor.

| Format | File Extension | What It Restores |
|---|---|---|
| **JSON Project** | `.json` | Full project: nodes, relations, project name, and settings (previously exported by FamScript) |
| **Mermaid Diagram** | `.mmd`, `.md`, `.txt` | Parses a `graph TB` Mermaid file — extracts node IDs and edge relationships; generation and gender are inferred from edge types |

> Mermaid files exported by Obsidian, Notion, or GitHub Markdown are compatible with FamScript's Mermaid importer.

### 8.2 Export

Once a tree is compiled, use the sidebar buttons to export it.

| Format | Best For | Technical Detail |
|---|---|---|
| **SVG** | Presentations, print, web embedding | Lossless vector; scales to any size without pixelation |
| **PNG** | WhatsApp, email, social media | Rasterised at 2× resolution (retina quality); includes FamScript watermark |
| **JPG** | Email attachments where file size matters | JPEG compression at 95% quality; white background fill; includes watermark |
| **Markdown (.md)** | GitHub README, Notion, Obsidian | Wraps the Mermaid code in a fenced ` ```mermaid ``` ` code block |
| **FAMScript (.fam)** | Saving your script as a standalone file | Plain text file containing the raw FamScript syntax |
| **JSON Project** | Saving progress; sharing with another FamScript user | Full internal model; re-importable; human-readable |

### 8.3 JSON Project File Format

The JSON project format is the complete internal representation of your tree. It can be re-imported at any time to restore your project.

```json
{
  "projectName": "Kumar Family",
  "version": "1.0",
  "nodes": [
    {
      "id": "GROOM_G0_001",
      "name": "Arjun Kumar",
      "age": 28,
      "gender": "M",
      "generation": "G0",
      "status": ""
    }
  ],
  "relations": [
    { "from": "GROOM_DAD_P1_001", "to": "GROOM_G0_001", "type": "FATHER_OF" }
  ],
  "settings": { "theme": "dark" }
}
```

### 8.4 Viewing the Raw Mermaid Code

Click **{ } View Mermaid** in the sidebar to open a modal showing the raw Mermaid `graph TB` code generated from your FamScript. Use the **Copy** button to paste it into any Mermaid-compatible tool such as Mermaid Live Editor, Notion, or GitHub.

---

## 9. Syntax Converter

The **Syntax Converter** (click **⇄ Converter** in the sidebar) lets you convert between FamScript, JSON, and Mermaid formats without compiling a tree. It is a standalone utility — useful for batch conversion, debugging, or bridging tools.

### 9.1 Available Conversion Modes

| Mode | Input | Output |
|---|---|---|
| FAMScript → JSON | FamScript text | Internal JSON model |
| FAMScript → Mermaid | FamScript text | Raw `graph TB` Mermaid code |
| Mermaid → FAMScript | Mermaid `graph TB` code | FamScript PERSON + RELATION blocks |
| JSON → Mermaid | JSON project file | Raw `graph TB` Mermaid code |
| JSON → FAMScript | JSON project file | FamScript PERSON + RELATION blocks |

### 9.2 How to Use the Converter

1. Click **⇄ Converter** in the sidebar to open the modal.
2. Select a conversion mode using the tab buttons at the top.
3. Paste your input into the left text area, or click **Use Editor Content** to pull in whatever is currently in the FamScript editor.
4. Click **Convert**.
5. The output appears in the right text area.
6. Click **Copy Output** to copy the result, or click **Load into Editor** (available for Mermaid → FAMScript and JSON → FAMScript) to push the converted script directly into the editor.

---

## 10. Mermaid Code Editor

The **Mermaid Code Editor** (click **Mermaid Editor** in the sidebar) is a full side-by-side Mermaid authoring environment. Use it to hand-write raw Mermaid code and preview it live — bypassing the FamScript parser entirely.

### 10.1 Features

| Button | Action |
|---|---|
| **Load from FamScript** | Compiles the current FamScript editor content and loads the resulting Mermaid code into the editor |
| **▶ Render** | Renders the Mermaid code in the right-hand preview pane |
| **→ Load into FamScript Editor** | Converts the Mermaid code back to FamScript and places it in the main editor |
| **Copy Code** | Copies the current Mermaid code to the clipboard |

### 10.2 Notes

- The `Tab` key inserts 2 spaces, consistent with the FamScript editor.
- Comments (`//` and `#`) in the Mermaid editor are stripped before rendering, since Mermaid only understands `%%` comments natively.
- If you paste a dual-mode script (with two `graph` declarations), only the first graph is rendered; a warning is shown.

---

## 11. Validation Rules

The validator runs automatically after every compile. Results appear in the **Console** at the bottom. Errors stop rendering; warnings render the tree but flag the issues.

### Rule 1 — Duplicate ID `[Error]`

No two `PERSON` blocks may share the same ID. The compiler stops and reports the duplicate.

```
PERSON DAD_001     // OK — first declaration
PERSON DAD_001     // Error: Duplicate node ID "DAD_001"
```

### Rule 2 — Required Fields `[Warning]`

Missing `NAME`, `GENDER`, or `GEN` on any person triggers a warning. The tree still renders.

```
PERSON X_001
AGE 40
// Warning: X_001: missing NAME
// Warning: X_001: missing GENDER
// Warning: X_001: missing GEN
```

### Rule 3 — Age Rule `[Error]`

A parent's age must be at least **15 years greater** than their child's age.

```
PERSON DAD_001
AGE 30

PERSON SON_001
AGE 20

RELATION DAD_001 FATHER_OF SON_001
// Error: Age rule: DAD_001 (age 30) must be ≥ SON_001 (age 20) + 15
```

### Rule 4 — Gender Rule `[Error]`

`FATHER_OF` requires `GENDER M`. `MOTHER_OF` requires `GENDER F`. Use `PARENT_OF` to skip gender enforcement.

```
PERSON MOM_001
GENDER F

RELATION MOM_001 FATHER_OF SON_001
// Error: Gender rule: MOM_001 declared FATHER_OF but GENDER is not M
```

### Rule 5 — Generation Rule `[Warning]`

For parent–child relations, the parent's `GEN` code must be exactly 1 level higher than the child's.

```
// Correct:   G+1 parent → G0 child
// Warning:   G+2 parent → G0 child — skips a generation
```

### Rule 6 — Marriage Rule `[Warning]`

Both people in a `MARRIED_TO` or `CORE_COUPLE` relation must have the same `GEN` code.

```
PERSON HUSBAND_001
GEN G+1

PERSON WIFE_001
GEN G0

RELATION HUSBAND_001 MARRIED_TO WIFE_001
// Warning: Marriage rule: HUSBAND_001 (G+1) and WIFE_001 (G0) are in different generations
```

### Rule 7 — Circular Ancestry `[Error]`

A depth-first search detects if any ancestor chain loops back to itself. Such a cycle makes the diagram impossible to render.

```
RELATION A FATHER_OF B
RELATION B FATHER_OF C
RELATION C FATHER_OF A   // Error: Circular ancestry involving "A"
```

### Validation Summary Table

| # | Rule | Severity | Description |
|---|---|---|---|
| 1 | Duplicate ID | Error | No two PERSON blocks may share the same ID |
| 2 | Required Fields | Warning | NAME, GENDER, GEN are strongly recommended |
| 3 | Age Rule | Error | Parent age must be ≥ child age + 15 |
| 4 | Gender Rule | Error | FATHER_OF requires M; MOTHER_OF requires F |
| 5 | Generation Rule | Warning | Parent GEN must be exactly 1 higher than child GEN |
| 6 | Marriage Rule | Warning | Both spouses must share the same GEN code |
| 7 | Circular Ancestry | Error | No ancestor chain may loop back to itself |

---

## 12. Complete Example — Wedding (3 Generations)

The following is a complete, ready-to-use wedding script covering three generations for both the groom's and bride's families. Copy and paste these blocks directly into the editor.

### Step 1 — Select the Event

From the event dropdown in the header, select **Wedding (Vivah)**. Two editor tabs appear: **Groom's Family** and **Bride's Family**.

### Step 2 — Groom's Family (paste into "Groom's Family" tab)

```
// Groom's Family - Vivah

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

PERSON GROOM_UNCLE_P1_001
NAME Vinod Kumar
AGE 50
GENDER M
GEN G+1

PERSON GROOM_G0_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0

// Relations — Grandparents
RELATION GROOM_GDF_P2_001 MARRIED_TO   GROOM_GDM_P2_001
RELATION GROOM_GDF_P2_001 FATHER_OF    GROOM_DAD_P1_001
RELATION GROOM_GDM_P2_001 MOTHER_OF    GROOM_DAD_P1_001
RELATION GROOM_GDF_P2_001 FATHER_OF    GROOM_UNCLE_P1_001
RELATION GROOM_GDM_P2_001 MOTHER_OF    GROOM_UNCLE_P1_001

// Relations — Parents to Groom
RELATION GROOM_DAD_P1_001 MARRIED_TO   GROOM_MOM_P1_001
RELATION GROOM_DAD_P1_001 FATHER_OF    GROOM_G0_001
RELATION GROOM_MOM_P1_001 MOTHER_OF    GROOM_G0_001
```

### Step 3 — Bride's Family (paste into "Bride's Family" tab)

```
// Bride's Family - Vivah

PERSON BRIDE_GDF_P2_001
NAME Suresh Sharma
AGE 76
GENDER M
GEN G+2

PERSON BRIDE_GDM_P2_001
NAME Geeta Sharma
AGE 73
GENDER F
GEN G+2

PERSON BRIDE_DAD_P1_001
NAME Vikram Sharma
AGE 52
GENDER M
GEN G+1

PERSON BRIDE_MOM_P1_001
NAME Kavita Sharma
AGE 49
GENDER F
GEN G+1

PERSON BRIDE_G0_001
NAME Priya Sharma
AGE 25
GENDER F
GEN G0

PERSON BRIDE_SIS_G0_001
NAME Anjali Sharma
AGE 22
GENDER F
GEN G0

// Relations — Grandparents
RELATION BRIDE_GDF_P2_001 MARRIED_TO   BRIDE_GDM_P2_001
RELATION BRIDE_GDF_P2_001 FATHER_OF    BRIDE_DAD_P1_001
RELATION BRIDE_GDM_P2_001 MOTHER_OF    BRIDE_DAD_P1_001

// Relations — Parents to Bride
RELATION BRIDE_DAD_P1_001 MARRIED_TO   BRIDE_MOM_P1_001
RELATION BRIDE_DAD_P1_001 FATHER_OF    BRIDE_G0_001
RELATION BRIDE_MOM_P1_001 MOTHER_OF    BRIDE_G0_001
RELATION BRIDE_DAD_P1_001 FATHER_OF    BRIDE_SIS_G0_001
RELATION BRIDE_MOM_P1_001 MOTHER_OF    BRIDE_SIS_G0_001
```

### Step 4 — Compile

Press `Ctrl + Enter`. Both trees render side-by-side. The console should show two green success lines — one for each side.

### Step 5 — Replace with Real Data

Replace the sample names and ages with your actual family data. Re-compile after each change.

---

## 13. Tips & Best Practices

### Use comments to organise large scripts

Break your script into sections with comment headers — they are completely ignored by the compiler and do not affect performance.

```
// ══════════════════
// GRANDPARENTS
// ══════════════════
PERSON GROOM_GDF_P2_001
...

// ══════════════════
// PARENTS
// ══════════════════
PERSON GROOM_DAD_P1_001
...
```

### Always use self-documenting IDs

An ID like `GROOM_MOM_P1_001` is immediately readable. An ID like `P4` becomes impossible to reason about in a 50-node tree.

### Add people before adding relations

While the compiler supports any order, defining all `PERSON` blocks first and all `RELATION` statements at the end makes the script far easier to read and maintain.

### Use PARENT_OF when gender is unknown or variable

`PARENT_OF` does not enforce gender, making it safe when you are unsure or when entering data for non-traditional family structures.

### Use STATUS for notes

The `STATUS` field does not affect rendering or validation. Use it to annotate nodes with notes like "Deceased", "NRI", "Adopted", or any other remark.

```
PERSON GDF_P2_001
NAME Harish Gupta
STATUS Deceased
```

### Validate early, validate often

Do not wait until the tree is complete to compile. Compile after adding each family unit (parents + children) so errors are caught while the context is fresh.

### Save your work with JSON export

The JSON Project export saves your entire project model, including the project name and theme. Import it at any time to resume where you left off.

### For large trees, use the Fit button

After compiling a large tree, click **Fit** to see the full picture. Then use scroll-to-zoom to explore individual branches.

---

## 14. For Developers — Adding Custom Events

To add your own ceremony preset, open `app.js` and add one entry to the `EVENTS` object:

```js
myEvent: {
  name:    'My Ceremony',
  color:   '#7c3aed',                // Accent hex colour (used in header and event bar)
  ecLight: 'rgba(124,58,237,0.07)', // Tinted background for dark mode
  dual:    false,                   // Set to true for a wedding-style dual canvas
  desc:    'Description shown in the event bar below the header'
}
```

Then add a matching `<option>` in the `<select id="event-select">` element inside `index.html`:

```html
<option value="myEvent">My Ceremony</option>
```

To add a sample script that loads when the user clicks **Load Sample**, add a matching key to the `SAMPLES` object in `app.js`:

```js
myEvent: `// My Ceremony Family Tree
PERSON HEAD_G0_001
NAME Person Name
AGE 40
GENDER M
GEN G0
`
```

---

## Internal Data Model Reference

For developers who need to work with the raw JSON model directly:

```js
// Node object
{
  id: "",          // Unique person ID (string, no spaces)
  name: "",        // Display name
  age: 0,          // Age (integer)
  gender: "",      // "M" or "F"
  generation: "",  // "G+4" to "G-3"
  status: ""       // Optional notes field
}

// Relation object
{
  from: "",  // ID of the source person
  to: "",    // ID of the target person
  type: ""   // Relationship type (e.g., "FATHER_OF", "MARRIED_TO")
}

// Project JSON (full export/import format)
{
  projectName: "",
  version: "1.0",
  nodes: [],
  relations: [],
  settings: { theme: "dark" }
}
```

---

## Mermaid Edge Reference (for Developers)

| Relation Category | Mermaid Edge Syntax |
|---|---|
| Parent / Child | `-->` (solid arrow) |
| Marriage | `---` (solid line, no arrow) |
| Core Couple | `==>` (bold double arrow) |
| Step / Sibling / Adoptive / Cousin / Spiritual | `-.->` (dashed arrow) |

The Mermaid output uses `graph TB` (top-to-bottom) layout. Generations are grouped using `subgraph` blocks, with older generations at the top and `G0` centred.

---

*FamScript Visual Builder — All processing is done locally in your browser. No data is sent to any server.*
