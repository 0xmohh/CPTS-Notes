// @ts-ignore
import moduleTabsScript from "./scripts/moduletabs.inline"
import moduleTabsStyles from "./styles/moduletabs.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ModuleTabs: QuartzComponent = () => null

ModuleTabs.afterDOMLoaded = moduleTabsScript
ModuleTabs.css = moduleTabsStyles

export default (() => ModuleTabs) satisfies QuartzComponentConstructor
