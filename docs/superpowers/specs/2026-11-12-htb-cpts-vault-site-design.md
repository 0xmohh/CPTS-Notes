# HTB CPTS Vault Site — Design Spec

**Date:** 2026-11-12  
**Status:** Approved

---

## Overview

Build a Quartz v4-based static site that publishes the HTB CPTS Obsidian vault as a polished, accessible knowledge base. The site serves pentesters who want fast access to notes, cheatsheets, and methodology checklists for each CPTS module.

**Source vault:** `C:\Users\Administrator\OneDrive\Obsidian\PentestVault\Learning\HTB CPTS`  
**Quartz root:** `C:\Users\Administrator\quartz`  
**Deployment target:** Local first, then Cloudflare Pages

---

## Goals

- One place for Notes, Cheatsheet, and Checklist per module — switchable with tabs
- Fast in-tab navigation via auto-generated section cards
- Checklist progress persists in localStorage
- Dark hacker aesthetic, easy on the eyes during long sessions
- Zero extra dependencies beyond what Quartz already has

---

## Content Structure

```
quartz/content/
├── index.md                        ← existing, keep (disclaimer + landing)
├── whoami.md                       ← existing, keep
└── modules/
    ├── index.md                    ← module grid (card per module)
    ├── footprinting/index.md
    ├── file-transfer/index.md
    ├── file-inclusion/index.md
    ├── file-upload/index.md
    ├── command-injection/index.md
    ├── web-attacks/index.md
    ├── attacking-common-apps/index.md
    ├── active-directory/index.md
    ├── attacking-common-services/index.md
    ├── ffuf/index.md
    ├── information-gathering/index.md
    ├── login-brute-forcing/index.md
    ├── passwords-attack/index.md
    ├── pivoting-tunneling/index.md
    ├── sql-injection/index.md
    ├── shells-payloads/index.md
    ├── metasploit/index.md
    ├── sqlmap/index.md
    ├── web-proxy/index.md
    └── xss/index.md
```

### Module File Format

Every `modules/<name>/index.md` follows this exact structure:

```markdown
---
title: <Module Name>
tags: [module]
---

## Notes

### Sub-topic A
...humanized notes...

### Sub-topic B
...

## Cheatsheet

### Sub-topic A
...commands, payloads, flags...

## Checklist

### Attack Flow
- [ ] Step 1
- [ ] Step 2
```

- `tags: [module]` triggers the tab component
- H2s (`## Notes`, `## Cheatsheet`, `## Checklist`) define the three tabs
- H3s define sub-sections that become navigation cards within each tab
- All content sourced from vault `.md` files, excluding any file containing `claude` in the name

---

## Custom Tab Component

**File:** `quartz/components/ModuleTabs.tsx`  
**Registration:** `quartz.layout.ts` → `afterBody` slot  
**Activation:** only on pages where `fileData.frontmatter.tags` includes `"module"`

### Behavior

1. **Tab bar** — Three buttons at the top: Notes | Cheatsheet | Checklist
2. **Tab switching** — Clicking a tab shows its panel, hides the others. Active tab highlighted with accent color.
3. **Section cards** — On tab activation, scan the visible panel for H3 elements. Render them as a card grid directly below the tab bar. Clicking a card smooth-scrolls to that H3.
4. **Checklist persistence** — Checkbox states saved to `localStorage` using key `checklist-<page-slug>`. Restored on page load.
5. **SPA compatibility** — Re-initializes on Quartz's `nav` event for client-side navigation.

### Styling

- Dark background matching Quartz dark theme (`var(--dark)`, `var(--light)`)
- Tab bar: pill-style buttons, active state uses `var(--secondary)` with green/cyan accent
- Cards: bordered tiles, subtle background, hover lift effect
- Checklist items: custom checkbox styling, struck-through when checked
- Responsive: cards wrap on narrow viewports

### DOM Transformation

The component injects CSS + JS as a `<style>` and `<script>` block into `afterBody`. The JS:

1. Runs on `DOMContentLoaded` and on Quartz's `nav` custom event
2. Finds the article element (`.popover-hint`)
3. Locates H2s with text exactly matching `Notes`, `Cheatsheet`, `Checklist`
4. Collects all DOM nodes between consecutive H2s into panel arrays
5. Wraps panels in `<div class="module-tab-panel">` containers
6. Inserts tab bar before first panel
7. On tab click: toggles `active` class on buttons and panels, then rebuilds card grid for the newly active tab
8. Card grid: queries H3s inside active panel, creates `<div class="module-card-grid">` with one `<button>` per H3

---

## Module Grid Landing Page

**File:** `content/modules/index.md`

A visual grid of all 20 modules. Each module is a card showing:
- Module name
- Brief one-line description
- Link to the module page

Implemented as a markdown table or HTML grid with inline styles (Quartz renders raw HTML in markdown).

---

## Content Generation

For each module, all non-`*claude*` `.md` files in the vault module folder are read and processed into three sections:

### Notes
- Grammar corrected, sentences restructured for clarity
- Original structure and sub-topics preserved
- Technical accuracy kept — no information added or removed
- Written in second person ("you") for a guide feel

### Cheatsheet
- Commands in fenced code blocks with language tag (`bash`, `sql`, `powershell`, etc.)
- Grouped by sub-topic matching the Notes H3 structure
- Includes: tool flags, payloads, one-liners, example usage
- No prose — pure reference

### Checklist
- `- [ ]` items only
- Follows logical attack methodology order (enumerate → identify → exploit → escalate)
- Each step is a single actionable task, not a description
- Sub-sections (`### Phase`) used for multi-phase modules (e.g., recon → exploit → post-exploit)

### Processing Order
Modules processed one at a time, largest/most complex first:
1. Active Directory
2. Passwords Attack
3. Pivoting, Tunneling & Port Forwarding
4. Attacking Common Services
5. File Transfer
6. Shells & Payloads
7. SQL Injection
8. File Upload Attacks
9. File Inclusion
10. Command Injection
11. XSS
12. Web Attacks
13. Information Gathering
14. Footprinting
15. Metasploit
16. SQLMap
17. Login Brute Forcing
18. Web Proxy
19. Ffuf
20. Attacking Common Applications

---

## Existing Content

- `content/index.md` — keep as-is (has disclaimer)
- `content/whoami.md` — keep as-is (has background, certs, motivation)
- `content/Methodology/` — keep as-is
- `content/Writeups/` — keep as-is

---

## Out of Scope

- Authentication / access control (local use only for now)
- Search customization (Quartz built-in search is sufficient)
- Flashcard `.txt` files from vault (not included)
- Any `*claude*` files from vault (excluded)
