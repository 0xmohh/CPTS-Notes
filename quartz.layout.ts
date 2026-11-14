import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const explorerConfig = {
  folderDefaultState: "collapsed" as const,
  folderClickBehavior: "collapse" as const,
  useSavedState: true,
  // map runs before sort (default order: filter → map → sort)
  mapFn: (node: { isFolder: boolean; displayName: string }) => {
    const labels: Record<string, string> = {
      Whoami: "01 · Whoami",
      modules: "02 · Modules",
    }
    if (labels[node.displayName]) {
      node.displayName = labels[node.displayName]
    }
  },
  sortFn: (a: { isFolder: boolean; displayName: string }, b: { isFolder: boolean; displayName: string }) => {
    return a.displayName.localeCompare(b.displayName, undefined, { numeric: true })
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.ModuleTabs()],
  footer: Component.Footer({
    links: {
      "HTB Academy": "https://academy.hackthebox.com",
      "CPTS Path": "https://academy.hackthebox.com/preview/certifications/htb-certified-penetration-testing-specialist",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.Explorer(explorerConfig),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(explorerConfig),
  ],
  right: [],
}
