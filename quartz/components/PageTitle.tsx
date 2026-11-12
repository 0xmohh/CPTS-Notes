import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const PageTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir} class="page-title-link" aria-label="Home">
        <img src={`${baseDir}/static/title.jpg`} alt="HTB CPTS" class="page-title-logo" />
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  margin: 0 0 0.5rem 0;
}

.page-title-link {
  display: block;
  text-decoration: none;
}

.page-title-logo {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 70px;
  object-fit: contain;
  border-radius: 4px;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
