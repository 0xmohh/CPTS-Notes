# HTB CPTS Vault Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Quartz v4 static site that publishes 20 HTB CPTS vault modules, each with Notes / Cheatsheet / Checklist tabs and in-tab section-card navigation.

**Architecture:** A single custom Quartz component (`ModuleTabs`) injects CSS + JS on every page; the JS self-guards by looking for H2s named "Notes", "Cheatsheet", "Checklist" and exits silently on pages that don't have them. Each module's content lives in one `content/modules/<slug>/index.md` file, structured with those H2s and H3 sub-sections that become navigation cards.

**Tech Stack:** Quartz v4, TypeScript, Preact JSX, SCSS, vanilla JS (no extra deps)

**Spec:** `docs/superpowers/specs/2026-11-12-htb-cpts-vault-site-design.md`

## Global Constraints

- Quartz root: `C:\Users\Administrator\quartz`
- Vault source (read-only): `C:\Users\Administrator\OneDrive\Obsidian\PentestVault\Learning\HTB CPTS`
- Exclude any vault file whose name contains `claude` (case-insensitive)
- Every module file must have frontmatter `tags: [module]` to activate the tab component
- H2 tab labels must be exactly: `Notes`, `Cheatsheet`, `Checklist` (capitalized, no extra text)
- H3 sub-headings inside each tab become clickable scroll-to cards
- Checklist items use `- [ ]` syntax; Quartz OFM transformer renders them as interactive checkboxes with built-in localStorage persistence — do not re-implement this
- Build command: `npx quartz build` (run from `C:\Users\Administrator\quartz`)
- Preview command: `npx quartz build --serve`
- No new npm packages may be added

## Review Focus

- **H2 heading text with Quartz anchor links:** Quartz appends an anchor element inside each heading; `h2.textContent` may include the anchor's text (e.g. `§`). The tab detection must use the first TEXT_NODE child of the H2, not the full `.textContent`, to avoid false negatives.
- **SPA navigation re-init:** Quartz dispatches a `nav` event on client-side navigation. If the script adds event listeners without cleanup, navigating away and back duplicates listeners. Use `window.addCleanup()` for every listener added inside the `nav` handler.
- **DOM insertion order:** Moving H2s and their following siblings into panel `<div>`s must preserve document order. Collect all nodes into an array first (saving `nextSibling` before any move), then move them — otherwise `nextSibling` changes mid-loop.
- **Tab panel re-init guard:** If `nav` fires on a page that already has `.module-tabs-bar` (e.g., hard refresh then SPA back), the script must skip re-initialization to avoid creating duplicate tab bars.
- **CSS variable theming:** Tab accent color `#00ff9f` is hardcoded. If the user switches to light mode, it must remain readable. The SCSS should ensure sufficient contrast in both themes by keeping the accent only as a bottom border, not as a background fill.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `quartz/components/scripts/moduletabs.inline.ts` | Create | Tab JS: DOM transform, switching, card grids, cleanup |
| `quartz/components/styles/moduletabs.scss` | Create | Tab bar, panel, card grid, checklist styling |
| `quartz/components/ModuleTabs.tsx` | Create | Quartz component that attaches script + CSS |
| `quartz/components/index.ts` | Modify | Export `ModuleTabs` |
| `quartz.layout.ts` | Modify | Add `ModuleTabs` to `sharedPageComponents.afterBody` |
| `content/modules/index.md` | Create | Module grid landing page |
| `content/modules/<slug>/index.md` | Create ×20 | One file per module with Notes/Cheatsheet/Checklist |

---

### Task 1: Tab Component Infrastructure

**Files:**
- Create: `quartz/components/scripts/moduletabs.inline.ts`
- Create: `quartz/components/styles/moduletabs.scss`
- Create: `quartz/components/ModuleTabs.tsx`
- Modify: `quartz/components/index.ts`
- Modify: `quartz.layout.ts`
- Create (temp test): `content/modules/_test/index.md`

**Interfaces:**
- Produces: `ModuleTabs` component exported from `quartz/components/index.ts`, usable as `Component.ModuleTabs()` in `quartz.layout.ts`

---

- [ ] **Step 1: Create the inline tab script**

Create `quartz/components/scripts/moduletabs.inline.ts` with this exact content:

```typescript
const TAB_NAMES = ["Notes", "Cheatsheet", "Checklist"] as const
type TabName = typeof TAB_NAMES[number]

function getH2Label(h2: HTMLHeadingElement): string {
  for (const node of h2.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) return text
    }
  }
  return h2.textContent?.trim() ?? ""
}

function buildCardGrid(panel: HTMLElement): void {
  panel.querySelector(".module-card-grid")?.remove()
  const h3s = Array.from(panel.querySelectorAll("h3"))
  if (h3s.length === 0) return

  const grid = document.createElement("div")
  grid.className = "module-card-grid"

  for (const h3 of h3s) {
    const card = document.createElement("button")
    card.className = "module-card"
    card.textContent = h3.textContent ?? ""
    const target = h3
    const onClick = () => target.scrollIntoView({ behavior: "smooth", block: "start" })
    card.addEventListener("click", onClick)
    window.addCleanup(() => card.removeEventListener("click", onClick))
    grid.appendChild(card)
  }

  const h2 = panel.querySelector("h2")
  if (h2) {
    h2.insertAdjacentElement("afterend", grid)
  } else {
    panel.prepend(grid)
  }
}

function switchTab(
  index: number,
  panels: HTMLElement[],
  buttons: HTMLButtonElement[],
): void {
  panels.forEach((panel, i) => panel.classList.toggle("active", i === index))
  buttons.forEach((btn, i) => btn.classList.toggle("active", i === index))
  buildCardGrid(panels[index])
}

function initModuleTabs(): void {
  const article = document.querySelector<HTMLElement>("article.popover-hint")
  if (!article) return
  if (article.querySelector(".module-tabs-bar")) return

  const allH2s = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2"))
  const tabH2s = allH2s.filter((h2) => (TAB_NAMES as readonly string[]).includes(getH2Label(h2)))
  if (tabH2s.length < 2) return

  const tabBar = document.createElement("div")
  tabBar.className = "module-tabs-bar"
  tabH2s[0].parentNode?.insertBefore(tabBar, tabH2s[0])

  const panels: HTMLElement[] = tabH2s.map((h2, i) => {
    const nextH2 = tabH2s[i + 1] ?? null
    const panel = document.createElement("div")
    panel.className = `module-tab-panel${i === 0 ? " active" : ""}`
    panel.dataset.tab = TAB_NAMES[i].toLowerCase()

    const nodesToMove: Node[] = []
    let current: Node | null = h2
    while (current && current !== nextH2) {
      nodesToMove.push(current)
      current = current.nextSibling
    }
    for (const node of nodesToMove) panel.appendChild(node)
    return panel
  })

  let insertAfter: Element = tabBar
  for (const panel of panels) {
    insertAfter.after(panel)
    insertAfter = panel
  }

  const buttons: HTMLButtonElement[] = tabH2s.map((_, i) => {
    const btn = document.createElement("button")
    btn.className = `module-tab-btn${i === 0 ? " active" : ""}`
    btn.textContent = TAB_NAMES[i]
    const onClick = () => switchTab(i, panels, buttons)
    btn.addEventListener("click", onClick)
    window.addCleanup(() => btn.removeEventListener("click", onClick))
    tabBar.appendChild(btn)
    return btn
  })

  buildCardGrid(panels[0])
}

document.addEventListener("nav", initModuleTabs)
```

- [ ] **Step 2: Create the SCSS styles**

Create `quartz/components/styles/moduletabs.scss`:

```scss
.module-tabs-bar {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0 0 0;
  border-bottom: 2px solid var(--lightgray);
  padding-bottom: 0;
}

.module-tab-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  background: transparent;
  color: var(--darkgray);
  font-size: 0.95rem;
  font-family: var(--bodyFont);
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--dark);
    background: var(--lightgray);
  }

  &.active {
    color: #00ff9f;
    border-bottom: 2px solid #00ff9f;
    background: transparent;
    font-weight: 600;
  }
}

.module-tab-panel {
  display: none;
  padding-top: 1rem;

  &.active {
    display: block;
  }
}

.module-card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0.75rem 0 1.5rem 0;
}

.module-card {
  padding: 0.4rem 0.9rem;
  background: var(--lightgray);
  border: 1px solid var(--gray);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--darkgray);
  transition: all 0.15s ease;
  text-align: left;
  font-family: var(--bodyFont);

  &:hover {
    border-color: #00ff9f;
    color: var(--dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 255, 159, 0.15);
  }
}

.module-tab-panel[data-tab="checklist"] {
  li:has(input[type="checkbox"].checkbox-toggle:checked) {
    text-decoration: line-through;
    opacity: 0.55;
  }
}
```

- [ ] **Step 3: Create ModuleTabs.tsx**

Create `quartz/components/ModuleTabs.tsx`:

```tsx
// @ts-ignore
import moduleTabsScript from "./scripts/moduletabs.inline"
import moduleTabsStyles from "./styles/moduletabs.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ModuleTabs: QuartzComponent = () => null

ModuleTabs.afterDOMLoaded = moduleTabsScript
ModuleTabs.css = moduleTabsStyles

export default (() => ModuleTabs) satisfies QuartzComponentConstructor
```

- [ ] **Step 4: Export from components index**

Open `quartz/components/index.ts`. Add at the end of the import list:

```typescript
import ModuleTabs from "./ModuleTabs"
```

Add `ModuleTabs` to the export block:

```typescript
export {
  // ... existing exports ...
  ModuleTabs,
}
```

- [ ] **Step 5: Register in layout**

Open `quartz.layout.ts`. The `sharedPageComponents` object currently has `afterBody: []`. Change it to:

```typescript
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.ModuleTabs()],
  footer: Component.Footer({ ... }),  // keep existing footer config
}
```

- [ ] **Step 6: Create a temporary test module page**

Create `content/modules/_test/index.md`:

```markdown
---
title: Test Module
tags: [module]
---

## Notes

### Sub-topic Alpha
This is some test note content under alpha.

### Sub-topic Beta
This is test content under beta.

## Cheatsheet

### Commands
\```bash
nmap -sV target
gobuster dir -u http://target -w wordlist.txt
\```

### Payloads
\```
' OR 1=1 --
<script>alert(1)</script>
\```

## Checklist

### Recon Phase
- [ ] Run nmap scan
- [ ] Enumerate web directories
- [ ] Check for open ports

### Exploitation Phase
- [ ] Test for SQLi
- [ ] Test for XSS
- [ ] Try default credentials
```

- [ ] **Step 7: Run the build**

```bash
cd C:/Users/Administrator/quartz && npx quartz build
```

Expected: build completes with no TypeScript errors. If there are import errors on `moduletabs.inline`, check that the file exists at the exact path.

- [ ] **Step 8: Preview and verify tabs work**

```bash
npx quartz build --serve
```

Navigate to `http://localhost:8080/modules/_test` in a browser. Verify:
- Three tab buttons appear: Notes | Cheatsheet | Checklist
- Notes tab is active by default
- Cards for "Sub-topic Alpha" and "Sub-topic Beta" appear below the tab bar
- Clicking a card scrolls to that H3
- Clicking Cheatsheet switches to that panel with its cards
- Clicking Checklist shows the checkboxes; checking one strikes through the item
- Reload the page — checked state is preserved (Quartz OFM handles this)

- [ ] **Step 9: Delete the test page**

```bash
rm -rf "C:/Users/Administrator/quartz/content/modules/_test"
```

- [ ] **Step 10: Commit**

```bash
cd C:/Users/Administrator/quartz
git add quartz/components/scripts/moduletabs.inline.ts quartz/components/styles/moduletabs.scss quartz/components/ModuleTabs.tsx quartz/components/index.ts quartz.layout.ts
git commit -m "feat: add ModuleTabs component with tab switching and card navigation"
```

---

### Task 2: Module Grid Landing Page

**Files:**
- Create: `content/modules/index.md`

**Interfaces:**
- Consumes: nothing
- Produces: `/modules` page listing all 20 modules as cards

---

- [ ] **Step 1: Create the module grid**

Create `content/modules/index.md`:

```markdown
---
title: Modules
---

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin:1.5rem 0">

<a href="/modules/footprinting" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Footprinting</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Infrastructure & host-based enumeration</div>
</a>

<a href="/modules/information-gathering" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Information Gathering</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Passive & active web reconnaissance</div>
</a>

<a href="/modules/shells-payloads" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Shells & Payloads</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Reverse shells, webshells, msfvenom</div>
</a>

<a href="/modules/file-transfer" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">File Transfer</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Windows, Linux, HTTP, LOL techniques</div>
</a>

<a href="/modules/metasploit" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Metasploit</div>
<div style="font-size:0.82rem;color:var(--darkgray)">MSF framework, payloads, evasion</div>
</a>

<a href="/modules/passwords-attack" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Passwords Attack</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Cracking, SAM, LSASS, PtH, PtT</div>
</a>

<a href="/modules/attacking-common-services" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Attacking Common Services</div>
<div style="font-size:0.82rem;color:var(--darkgray)">FTP, SMB, SQL, RDP, DNS, SMTP</div>
</a>

<a href="/modules/pivoting-tunneling" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Pivoting & Tunneling</div>
<div style="font-size:0.82rem;color:var(--darkgray)">SSH, Chisel, Socat, Rpivot, SocksOverRDP</div>
</a>

<a href="/modules/active-directory" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Active Directory</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Enumeration, Kerberos, ACL abuse, lateral movement</div>
</a>

<a href="/modules/login-brute-forcing" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Login Brute Forcing</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Hydra, Medusa, custom wordlists</div>
</a>

<a href="/modules/ffuf" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Attacking with Ffuf</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Directory, subdomain & parameter fuzzing</div>
</a>

<a href="/modules/using-web-proxy" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Using Web Proxy</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Burp Suite & ZAP techniques</div>
</a>

<a href="/modules/sql-injection" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">SQL Injection</div>
<div style="font-size:0.82rem;color:var(--darkgray)">In-band, blind, error-based, UNION attacks</div>
</a>

<a href="/modules/sqlmap" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Using SQLMap</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Automated SQLi detection & exploitation</div>
</a>

<a href="/modules/xss" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">XSS</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Reflected, stored, DOM-based, CSP bypass</div>
</a>

<a href="/modules/file-inclusion" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">File Inclusion</div>
<div style="font-size:0.82rem;color:var(--darkgray)">LFI, RFI, log poisoning, PHP wrappers</div>
</a>

<a href="/modules/file-upload" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">File Upload Attacks</div>
<div style="font-size:0.82rem;color:var(--darkgray)">Extension bypass, MIME, polyglots</div>
</a>

<a href="/modules/command-injection" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Command Injection</div>
<div style="font-size:0.82rem;color:var(--darkgray)">OS command injection & filter bypass</div>
</a>

<a href="/modules/web-attacks" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Web Attacks</div>
<div style="font-size:0.82rem;color:var(--darkgray)">IDOR, XXE, SSRF, CSRF, mass assignment</div>
</a>

<a href="/modules/attacking-common-apps" style="display:block;padding:1rem 1.25rem;border:1px solid var(--lightgray);border-radius:8px;text-decoration:none;transition:border-color 0.15s,transform 0.15s" onmouseover="this.style.borderColor='#00ff9f';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--lightgray)';this.style.transform=''">
<div style="font-weight:600;color:var(--dark);margin-bottom:0.3rem">Attacking Common Apps</div>
<div style="font-size:0.82rem;color:var(--darkgray)">WordPress, Tomcat, Jenkins, Splunk</div>
</a>

</div>
```

- [ ] **Step 2: Build and verify**

```bash
cd C:/Users/Administrator/quartz && npx quartz build --serve
```

Navigate to `http://localhost:8080/modules` and verify: 20 cards appear in a grid, each links to the correct slug, hover effect turns border green.

- [ ] **Step 3: Commit**

```bash
git add content/modules/index.md
git commit -m "feat: add module grid landing page"
```

---

### Task 3: Module — Active Directory

**Files:**
- Create: `content/modules/active-directory/index.md`

**Vault sources** (read all, skip `*claude*`):
- `Active Directory Enumeration and Attacks/Introduction to AD/`
- `Active Directory Enumeration and Attacks/Initial Enumeration/`
- `Active Directory Enumeration and Attacks/Sniffing out a foothold/`
- `Active Directory Enumeration and Attacks/Password Spraying/`
- `Active Directory Enumeration and Attacks/Enumerating Security Controls.md`
- `Active Directory Enumeration and Attacks/Credentialed Enumeration/`
- All remaining files in `Active Directory Enumeration and Attacks/`

---

- [ ] **Step 1: Read all vault source files**

Read every `.md` file in the vault's `Active Directory Enumeration and Attacks/` folder (recursively), skipping files whose names contain `claude`.

- [ ] **Step 2: Write the module file**

Create `content/modules/active-directory/index.md` following this structure. The H3 sub-headings must match the logical groupings found in the vault notes. Minimum expected H3s per tab:

**Notes H3s** (derive from vault content): AD Overview & Functionality, Users & Machine Accounts, Initial Enumeration, LLMNR/NBT-NS Poisoning, Password Spraying, Enumerating Security Controls, Credentialed Enumeration from Linux, Credentialed Enumeration from Windows, Living Off the Land, Kerberoasting, ACL Attacks, Lateral Movement, Domain Trusts

**Cheatsheet H3s** (extract commands/payloads): Recon & Enumeration Commands, BloodHound & SharpHound, Responder & Inveigh, Password Spraying Tools, Kerberoasting, AS-REP Roasting, ACL Abuse, Lateral Movement Commands, Domain Trust Enumeration

**Checklist H3s** (methodology phases): External Recon, Initial Foothold, Unauthenticated Enumeration, Foothold & Credential Capture, Authenticated Enumeration, Privilege Escalation Paths, Lateral Movement, Domain Domination

```markdown
---
title: Active Directory Enumeration & Attacks
tags: [module]
---

## Notes

### AD Overview & Functionality
[humanized content from Introduction to AD files]

### Users & Machine Accounts
[humanized content]

... (continue for all H3s above)

## Cheatsheet

### Recon & Enumeration Commands
```bash
# Example — fill with actual commands from vault
crackmapexec smb <IP> --users
ldapsearch -H ldap://<IP> -x -b "DC=domain,DC=local"
```

... (continue for all Cheatsheet H3s)

## Checklist

### External Recon
- [ ] Identify domain name via DNS, OSINT
- [ ] Enumerate public-facing services (web, VPN, email)
- [ ] Check for credential exposure (breach data, GitHub)

... (continue for all Checklist H3s)
```

- [ ] **Step 3: Build and verify**

```bash
cd C:/Users/Administrator/quartz && npx quartz build
```

Expected: no errors. Spot-check: at least 3 H3 cards appear in the Notes tab, cheatsheet code blocks render correctly, checklist checkboxes are interactive.

- [ ] **Step 4: Commit**

```bash
git add content/modules/active-directory/
git commit -m "feat: add Active Directory module (notes, cheatsheet, checklist)"
```

---

### Task 4: Module — Passwords Attack

**Files:**
- Create: `content/modules/passwords-attack/index.md`

**Vault sources** (skip `*claude*`):
- All files under `Passwords Attack/` recursively

**Notes H3s**: Windows Authentication Process, Attacking SAM/SYSTEM/SECURITY, Attacking LSASS, Attacking Active Directory & NTDS.dit, Attacking Windows Credential Manager, Linux Authentication & Credential Hunting, Credential Hunting in Network Traffic & Shares, Password Cracking Techniques, Custom Wordlists, Cracking Files & Archives, Remote Password Attacks, Pass-the-Hash, Pass-the-Ticket (Windows), Pass-the-Ticket (Linux), Pass-the-Certificate

**Cheatsheet H3s**: Credential Extraction (Windows), Credential Extraction (Linux), Hashcat & John Commands, Network Service Attacks, Pass-the-Hash Commands, Pass-the-Ticket Commands, Custom Wordlist Tools

**Checklist H3s**: Windows Credential Hunting, Linux Credential Hunting, Network Sniffing, Hash Cracking, Lateral Movement (PtH/PtT/PtC)

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/passwords-attack/index.md`** following the H3 structure above
- [ ] **Step 3: Build — `npx quartz build`** — expected no errors
- [ ] **Step 4: Commit — `git add content/modules/passwords-attack/ && git commit -m "feat: add Passwords Attack module"`**

---

### Task 5: Module — Pivoting, Tunneling & Port Forwarding

**Files:**
- Create: `content/modules/pivoting-tunneling/index.md`

**Vault sources**: All files under `Pivoting, Tunneling and port forwarding/` recursively (skip `*claude*`)

**Notes H3s**: SSH & Meterpreter Tunneling, SOCKS5 with Chisel, Socat (Bind & Reverse), Rpivot, plink.exe (Windows SSH), Sshuttle, DNS Tunneling with DNScat2, ICMP Tunneling, RDP & SOCKS with SocksOverRDP, Attacking Unreachable Networks, Detection & Prevention

**Cheatsheet H3s**: SSH Port Forwarding & Tunneling, Chisel Commands, Socat Commands, Meterpreter Routing, Rpivot Setup, DNScat2 Commands, SocksOverRDP Setup, Proxychains Config

**Checklist H3s**: Environment Assessment, Single Pivot Setup, Double Pivot Setup, Covert Channels, Cleanup

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/pivoting-tunneling/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/pivoting-tunneling/ && git commit -m "feat: add Pivoting & Tunneling module"`**

---

### Task 6: Module — Attacking Common Services

**Files:**
- Create: `content/modules/attacking-common-services/index.md`

**Vault sources**: All files under `Attacking Common Services/` (skip `*claude*`)

**Notes H3s**: Service Attack Concepts, FTP Attacks, SMB Attacks, SQL Database Attacks, RDP Attacks, SMTP Attacks, DNS Attacks, Gotchas & Tips

**Cheatsheet H3s**: FTP Commands, SMB / CrackMapExec Commands, SQL Attack Commands, RDP Attack Commands, SMTP Enumeration, DNS Attack Commands

**Checklist H3s**: FTP Assessment, SMB Assessment, SQL Assessment, RDP Assessment, SMTP Assessment, DNS Assessment

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/attacking-common-services/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/attacking-common-services/ && git commit -m "feat: add Attacking Common Services module"`**

---

### Task 7: Module — File Transfer

**Files:**
- Create: `content/modules/file-transfer/index.md`

**Vault sources**: All files under `File Transfer/` (skip `*claude*`)

**Notes H3s**: Windows File Transfer Methods, Linux File Transfer Methods, Transferring Files with Code, Upload over HTTP/HTTPS, Protected File Transfer, Living Off the Land, Miscellaneous Methods, Evading Detection

**Cheatsheet H3s**: Windows Download Commands, Windows Upload Commands, Linux Download Commands, Linux Upload Commands, Code-Based Transfer (Python/PHP/Ruby), HTTP Server One-Liners, LOLBins for Transfer

**Checklist H3s**: Windows Exfil, Linux Exfil, Covert Transfer (Encrypted/Encoded), LOL Transfer

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/file-transfer/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/file-transfer/ && git commit -m "feat: add File Transfer module"`**

---

### Task 8: Module — Shells & Payloads

**Files:**
- Create: `content/modules/shells-payloads/index.md`

**Vault sources**: All files under `Shells & Payloads/` (skip `*claude*`)

**Notes H3s**: Payload Types & Concepts, Windows Shell Techniques, Linux/Unix Shells, Webshells (PHP, ASPX, JSP), Spawning Interactive Shells, Msfvenom Payloads, Detection & Prevention

**Cheatsheet H3s**: Netcat / Reverse Shell One-Liners, Msfvenom Commands, Webshell Snippets, Shell Upgrade Techniques, Payload Encoding & Obfuscation

**Checklist H3s**: Initial Shell Acquisition, Shell Stabilization, Payload Generation, Webshell Deployment

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/shells-payloads/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/shells-payloads/ && git commit -m "feat: add Shells & Payloads module"`**

---

### Task 9: Module — SQL Injection

**Files:**
- Create: `content/modules/sql-injection/index.md`

**Vault sources**: All files under `SQL Injection/` (skip `*claude*`)

**Notes H3s**: SQLi Types & Concepts, In-Band SQLi (Union-based), Error-Based SQLi, Boolean-Blind SQLi, Time-Based Blind SQLi, Out-of-Band SQLi, Bypassing WAF/Filters, Reading & Writing Files via SQLi

**Cheatsheet H3s**: UNION Attack Payloads, Error-Based Payloads, Boolean-Blind Payloads, Time-Based Payloads, DB Fingerprinting, Extracting DB/Table/Column Names, OS Interaction Payloads, WAF Bypass Techniques

**Checklist H3s**: Detection Phase, Exploitation Phase, Data Extraction, OS Interaction, Post-Exploitation

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/sql-injection/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/sql-injection/ && git commit -m "feat: add SQL Injection module"`**

---

### Task 10: Module — File Upload Attacks

**Files:**
- Create: `content/modules/file-upload/index.md`

**Vault sources**: All files under `17- File Upload Attacks/` (skip `*claude*`)

**Notes H3s**: Upload Validation Concepts, Client-Side Filter Bypass, Blacklist Extension Bypass, Whitelist Extension Bypass, MIME Type Bypass, Limited Upload Exploitation (XXE, SVG XSS), File Upload + Other Vulns

**Cheatsheet H3s**: Extension Bypass Payloads, MIME Type Bypass Headers, PHP Webshell Snippets, Double Extension Tricks, Null Byte Payloads, Polyglot Files

**Checklist H3s**: Recon the Upload Function, Client-Side Filter Bypass, Server-Side Filter Bypass, Webshell Upload, Post-Upload Exploitation

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/file-upload/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/file-upload/ && git commit -m "feat: add File Upload Attacks module"`**

---

### Task 11: Module — File Inclusion

**Files:**
- Create: `content/modules/file-inclusion/index.md`

**Vault sources**: All files under `16- File inclusion/` (skip `*claude*`)

**Notes H3s**: LFI Concepts, Basic LFI Exploitation, Bypassing Filters & Restrictions, PHP Wrappers, Remote File Inclusion (RFI), Log Poisoning, LFI to RCE, Automated LFI Tools

**Cheatsheet H3s**: LFI Path Traversal Payloads, Filter Bypass Payloads, PHP Wrapper Payloads, RFI Payloads, Log Poisoning Techniques, LFI Automation (ffuf/wfuzz)

**Checklist H3s**: Identify Inclusion Point, Path Traversal Test, PHP Wrapper Test, Log Poisoning, RFI Attempt, RCE via LFI

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/file-inclusion/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/file-inclusion/ && git commit -m "feat: add File Inclusion module"`**

---

### Task 12: Module — Command Injection

**Files:**
- Create: `content/modules/command-injection/index.md`

**Vault sources**: All files under `18- Command Injection/` (skip `*claude*`)

**Notes H3s**: Command Injection Concepts, Detection & Testing, Operator-Based Injection, Blind Command Injection, Filter Bypass Techniques, Advanced Obfuscation

**Cheatsheet H3s**: Injection Operators (Linux & Windows), Blind Injection Payloads, Filter Bypass Payloads, Space Bypass, Character Obfuscation, Time-Based Detection

**Checklist H3s**: Identify Injection Point, Confirm Injection, Blind Injection Confirmation, Filter Enumeration & Bypass, RCE Confirmation, Shell Upgrade

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/command-injection/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/command-injection/ && git commit -m "feat: add Command Injection module"`**

---

### Task 13: Module — XSS

**Files:**
- Create: `content/modules/xss/index.md`

**Vault sources**: All files under `XSS/` (skip `*claude*`)

**Notes H3s**: XSS Types (Reflected, Stored, DOM), XSS Discovery, Stored XSS Exploitation, Session Hijacking, Phishing via XSS, DOM-Based XSS, Blind XSS, XSS Prevention

**Cheatsheet H3s**: Basic XSS Payloads, Event Handler Payloads, WAF Bypass Payloads, Cookie Stealing Payloads, Keylogger Payloads, Phishing Templates

**Checklist H3s**: Identify Reflection Points, Test for Stored XSS, Test for DOM XSS, Session Hijacking Setup, Phishing Setup, Blind XSS

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/xss/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/xss/ && git commit -m "feat: add XSS module"`**

---

### Task 14: Module — Web Attacks

**Files:**
- Create: `content/modules/web-attacks/index.md`

**Vault sources**: All files under `19- Web Attacks/` (skip `*claude*`)

**Notes H3s**: IDOR, XXE Injection, SSRF, CSRF, HTTP Verb Tampering, Mass Assignment, Insecure Direct Object References Advanced

**Cheatsheet H3s**: IDOR Payloads & Techniques, XXE Payloads, SSRF Payloads & Bypasses, CSRF PoC Templates, HTTP Verb Tampering, Mass Assignment Payloads

**Checklist H3s**: IDOR Testing, XXE Testing, SSRF Testing, CSRF Testing, HTTP Verb Tampering, Mass Assignment Testing

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/web-attacks/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/web-attacks/ && git commit -m "feat: add Web Attacks module"`**

---

### Task 15: Module — Information Gathering

**Files:**
- Create: `content/modules/information-gathering/index.md`

**Vault sources**: All files under `Information Gathering - Web Edition/` + `Information Gathering - Web Edition.md` (skip `*claude*`)

**Notes H3s**: Passive Reconnaissance Overview, WHOIS & DNS Enumeration, Subdomain Discovery (Passive), Certificate Transparency Logs, Active Recon Overview, DNS Zone Transfers, Web Technology Fingerprinting, Web Crawling & Spidering, Google Dorks & OSINT

**Cheatsheet H3s**: WHOIS & DNS Commands, Subdomain Enumeration Commands, Certificate Search, Active Web Recon Tools, Google Dork Operators

**Checklist H3s**: Passive Recon, DNS & Subdomain Enum, Active Fingerprinting, Web Crawling

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/information-gathering/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/information-gathering/ && git commit -m "feat: add Information Gathering module"`**

---

### Task 16: Module — Footprinting

**Files:**
- Create: `content/modules/footprinting/index.md`

**Vault sources**: All files under `01- Footprinting/` (skip `*claude*`)

**Notes H3s**: Infrastructure-Based Enumeration, Host-Based Enumeration, DNS Records & Exploitation, NFS Share Exploitation, SNMP Enumeration

**Cheatsheet H3s**: DNS Enumeration Commands, NFS Commands, SNMP Commands, General Footprinting Tools

**Checklist H3s**: External Infrastructure Enum, DNS Enumeration, Service-Specific Enum (NFS, SNMP), Host Fingerprinting

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/footprinting/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/footprinting/ && git commit -m "feat: add Footprinting module"`**

---

### Task 17: Module — Metasploit

**Files:**
- Create: `content/modules/metasploit/index.md`

**Vault sources**: All files under `Using MSF/` (skip `*claude*`)

**Notes H3s**: MSF Framework Architecture, Core MSF Commands, Working with Modules, Payloads & Encoders, Post-Exploitation with MSF, Importing Custom Modules, Firewall & IDS/IPS Evasion

**Cheatsheet H3s**: Core MSF Commands, Payload Generation (msfvenom), Post-Exploitation Modules, Evasion Techniques, Database Commands

**Checklist H3s**: Initial Setup, Module Search & Config, Exploitation, Post-Exploitation, Evasion

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/metasploit/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/metasploit/ && git commit -m "feat: add Metasploit module"`**

---

### Task 18: Module — SQLMap

**Files:**
- Create: `content/modules/sqlmap/index.md`

**Vault sources**: All files under `Using SQLMap/` (skip `*claude*`)

**Notes H3s**: SQLMap Overview, Basic Usage, Tuning Detection, Database Enumeration, Advanced Exploitation, Bypassing Protections, OS Interaction

**Cheatsheet H3s**: Basic SQLMap Commands, Detection Tuning Flags, Enumeration Flags, Dump Commands, Tamper Scripts, OS Shell Commands

**Checklist H3s**: Basic Detection, DB Enumeration, Data Extraction, WAF Bypass, OS Interaction

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/sqlmap/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/sqlmap/ && git commit -m "feat: add SQLMap module"`**

---

### Task 19: Module — Login Brute Forcing

**Files:**
- Create: `content/modules/login-brute-forcing/index.md`

**Vault sources**: All files under `Login Brute Forcing/` (skip `*claude*`)

**Notes H3s**: Brute Force Concepts, Hydra Usage, Medusa Usage, Custom Wordlist Creation, Service-Specific Attacks (SSH, FTP, HTTP, RDP), Password Spraying

**Cheatsheet H3s**: Hydra Commands, Medusa Commands, Wordlist Tools (cewl, crunch), Service-Specific Flags, Default Credentials

**Checklist H3s**: Target Identification, Wordlist Preparation, Service Brute Force, Web Login Brute Force, Spraying (Low & Slow)

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/login-brute-forcing/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/login-brute-forcing/ && git commit -m "feat: add Login Brute Forcing module"`**

---

### Task 20: Module — Using Web Proxy

**Files:**
- Create: `content/modules/using-web-proxy/index.md`

**Vault sources**: All files under `Using Web Proxy/` (skip `*claude*`)

**Notes H3s**: Burp Suite Overview & Setup, Intercepting & Modifying Requests, Repeater & Intruder, Burp Scanner, ZAP Overview & Setup, ZAP Active & Passive Scanning, Proxying Mobile/Thick Clients

**Cheatsheet H3s**: Burp Suite Shortcuts, Intruder Attack Types, Repeater Usage, ZAP Commands & Spider, Proxy Setup (Browser/Mobile)

**Checklist H3s**: Burp Setup & Intercept, Manual Testing with Repeater, Fuzzing with Intruder, Automated Scanning, ZAP Alternative Workflow

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/using-web-proxy/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/using-web-proxy/ && git commit -m "feat: add Web Proxy module"`**

---

### Task 21: Module — Attacking with Ffuf

**Files:**
- Create: `content/modules/ffuf/index.md`

**Vault sources**: All files under `Attacking Web Application With Ffuf/` (skip `*claude*`)

**Notes H3s**: Ffuf Overview, Directory & File Fuzzing, Subdomain Fuzzing, VHost Fuzzing, Parameter & Value Fuzzing, Filter & Matcher Options, Recursive Fuzzing

**Cheatsheet H3s**: Directory Fuzzing Commands, Subdomain Fuzzing Commands, VHost Fuzzing Commands, Parameter Fuzzing Commands, Filter/Matcher Flags, Wordlist Sources

**Checklist H3s**: Directory Enumeration, Subdomain Discovery, VHost Enumeration, Parameter Discovery, Recursive Fuzzing

---

- [ ] **Step 1: Read all vault source files**
- [ ] **Step 2: Write `content/modules/ffuf/index.md`**
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/ffuf/ && git commit -m "feat: add Ffuf module"`**

---

### Task 22: Module — Attacking Common Applications

**Files:**
- Create: `content/modules/attacking-common-apps/index.md`

**Vault sources**: All files under `20- Attacking Common Application/` (skip `*claude*`)

**Notes H3s**: Derive H3s from the actual vault content — this module's contents are not fully known in advance. Read all files and structure accordingly. Expected topics include: WordPress, Joomla, Tomcat, Jenkins, Splunk, PRTG, osTicket, GitLab.

**Cheatsheet H3s**: One per application covered in the vault notes.

**Checklist H3s**: One per application, following the attack methodology found in the vault.

---

- [ ] **Step 1: Read all vault source files in `20- Attacking Common Application/`**
- [ ] **Step 2: Write `content/modules/attacking-common-apps/index.md`** — derive all H3s from actual content
- [ ] **Step 3: `npx quartz build`**
- [ ] **Step 4: `git add content/modules/attacking-common-apps/ && git commit -m "feat: add Attacking Common Applications module"`**

---

### Task 23: Final Build & Smoke Test

**Files:** none new

---

- [ ] **Step 1: Full clean build**

```bash
cd C:/Users/Administrator/quartz && npx quartz build
```

Expected: zero errors, zero warnings about missing files.

- [ ] **Step 2: Serve and spot-check 5 modules**

```bash
npx quartz build --serve
```

For each of these 5 modules, verify: tabs appear, all 3 tabs switch correctly, card grids appear and scroll on click, checklists are interactive:
- `/modules/active-directory`
- `/modules/sql-injection`
- `/modules/file-upload`
- `/modules/passwords-attack`
- `/modules/pivoting-tunneling`

- [ ] **Step 3: Verify module grid**

Navigate to `/modules` — all 20 cards present, all links resolve to pages with content (no 404s).

- [ ] **Step 4: Verify non-module pages are unaffected**

Navigate to `/whoami` and `/` — no tab bars, no card grids, page looks identical to before.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete HTB CPTS vault site — 20 modules with tabs, cheatsheets, checklists"
```
