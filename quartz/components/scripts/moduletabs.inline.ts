const TAB_NAMES = ["Notes", "Cheatsheet", "Checklist"] as const
type TabName = (typeof TAB_NAMES)[number]

function getH2Label(h2: HTMLHeadingElement): string {
  for (const node of Array.from(h2.childNodes)) {
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
  const article = document.querySelector<HTMLElement>(".center article") ?? document.querySelector<HTMLElement>("article")
  if (!article) return
  if (article.querySelector(".module-tabs-bar")) return

  const allH2s = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2"))
  const tabH2s = allH2s.filter((h2) =>
    (TAB_NAMES as readonly string[]).includes(getH2Label(h2)),
  )
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
