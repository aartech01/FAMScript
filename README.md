# FamScript

> A browser-based, code-first family tree compiler and renderer — open source and free forever.

Write a short structured script, get a colour-coded, zoomable family diagram instantly. No installation. No account. No data leaves your browser.

---

## What is FamScript?

FamScript is a domain-specific language for describing family relationships. You write people and relations as plain text; FamScript parses, validates, and renders them as a professional visual tree using [Mermaid](https://mermaid.js.org/).

Designed initially for Indian ceremony contexts (Wedding/Vivah, Mundan, Namkaran, Sagai), but useful for any genealogy or org-hierarchy visualization.

```
PERSON GROOM_SLF_001
NAME Arjun Kumar
AGE 28
GENDER M
GEN G0

PERSON BRIDE_SLF_001
NAME Priya Sharma
AGE 25
GENDER F
GEN G0

RELATION GROOM_SLF_001 MARRIED_TO BRIDE_SLF_001
```

→ Instantly renders a validated, colour-coded family tree.

---

## Features

- **Code-first** — describe trees in text, not by dragging boxes
- **Live compile** — diagram updates as you type (< 100 ms debounce)
- **Validation engine** — enforces age rules, generation rules, gender rules, circular ancestry detection, and more
- **Multi-generation** — spans G+4 (great-great-grandparents) to G-3 (great-grandchildren)
- **Event modes** — Wedding, Mundan, Namkaran, Sagai, and custom ceremony layouts
- **Import** — paste raw Mermaid or JSON; FamScript converts it to the internal model
- **Export** — SVG, PNG, JPG, Markdown, and JSON
- **Zero dependencies at runtime** — pure HTML/CSS/Vanilla JS; Mermaid loaded from CDN
- **10,000+ node support** at sub-second render times
- **100% local** — no server, no account, no telemetry

---

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in Chrome, Edge, Firefox, or Brave.
3. Type FamScript in the left panel and watch the tree render on the right.

No build step. No `npm install`. No server required.

> Safari has partial support only.

---

## FamScript Syntax

```
PERSON <ID>
NAME <Full Name>
AGE <number>
GENDER <M|F>
GEN <generation code>

RELATION <ID_A> <RELATION_TYPE> <ID_B>
```

**Generation codes:** `G+4` → `G+3` → `G+2` → `G+1` → `G0` (self) → `G-1` → `G-2` → `G-3`

**Relation types:** `MARRIED_TO`, `PARENT_OF`, `MOTHER_OF`, `STEP_PARENT_OF`, `ADOPTED_PARENT_OF`, `COUSIN_OF`, and more.

See [GUIDE.md](GUIDE.md) for the full syntax reference and [Usecase.md](Usecase.md) for real-world examples.

---

## Architecture

```
parser.js → validator.js → mermaidGenerator.js → Mermaid renderer → export.js
```

| File | Responsibility |
|---|---|
| `parser.js` | FamScript text → internal JSON model |
| `validator.js` | Business rule enforcement |
| `mermaidGenerator.js` | Internal JSON → Mermaid `graph TB` syntax |
| `importer.js` | Mermaid / JSON → internal JSON model |
| `export.js` | SVG, PNG, JPG, Markdown, JSON export |
| `app.js` | UI wiring, pipeline orchestration, theme switching |

---

## Contributing

FamScript is open source and **contributions are very welcome** — whether you're fixing a bug, adding a new ceremony mode, improving validation, or enhancing the UI.

### How to contribute

1. **Fork** this repository and create a branch from `main`.
2. Make your changes — keep commits focused and descriptive.
3. Test by opening `index.html` directly in a browser.
4. Open a **Pull Request** with a clear description of what you changed and why.

### Good first issues to tackle

- Add support for new relationship types
- Improve error messages in the validator
- Add new ceremony/event modes
- Improve accessibility (keyboard navigation, ARIA labels)
- Write example FamScript files for different family structures
- Performance improvements for very large trees

### Guidelines

- No build system — keep it pure HTML/CSS/Vanilla JS.
- Follow the existing module structure (`parser → validator → generator`).
- Validation rules live in `validator.js` — add new rules there with a clear comment on the constraint.
- Export logic lives in `export.js` — new formats go there.
- Test your changes with at least a 3-generation family tree before submitting.

---

## License

This project is open source. All are welcome to use, study, modify, and distribute it.

---

## Links

- [Full User Guide](GUIDE.md)
- [Use Cases & Examples](Usecase.md)
- [Report an issue](https://github.com/aartech01/FAMScript/issues)
- [Submit a pull request](https://github.com/aartech01/FAMScript/pulls)
